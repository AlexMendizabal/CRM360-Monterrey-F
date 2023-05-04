import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

// Services
import { ComercialClientesService } from 'src/app/modules/comercial/services/clientes.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

@Component({
  selector: 'comercial-clientes-cadastro-dados-relacionamento-detalhes',
  templateUrl: './detalhes.component.html',
  styleUrls: ['./detalhes.component.scss']
})
export class ComercialClientesCadastroDadosRelacionamentoDetalhesComponent
  implements OnInit {
  loaderFullScreen: boolean = true;

  dadosRelacionamento: any = {};
  dadosRelacionamentoLoaded: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private clientesService: ComercialClientesService,
    private pnotifyService: PNotifyService,
    private router: Router
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit() {
    this.activatedRoute.parent.parent.params.subscribe(params => {
      this.getDadosRelacionamento(params['id']);
    });
  }

  getDadosRelacionamento(id: number) {
    this.clientesService
      .getDadosRelacionamento(id)
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
          this.dadosRelacionamentoLoaded = true;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] === 200) {
            this.dadosRelacionamento = response['result'];

            this.dadosRelacionamento['obsPropostas'] =
              this.dadosRelacionamento['obsPropostas'] != null
                ? this.dadosRelacionamento['obsPropostas'].replace(
                    /(?:\r\n|\r|\n)/g,
                    '<br />'
                  )
                : null;
          } else {
            this.handleDadosRelacionamentoError(id);
          }
        },
        error: (error: any) => {
          this.handleDadosRelacionamentoError(id);
        }
      });
  }

  handleDadosRelacionamentoError(id: number) {
    this.pnotifyService.error();
    this.router.navigate(['/comercial/clientes/detalhes', id]);
  }
}
