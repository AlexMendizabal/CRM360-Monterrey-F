import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

// ng-brazil
import { utilsBr } from 'js-brasil';

// Services
import { ComercialClientesService } from 'src/app/modules/comercial/services/clientes.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

@Component({
  selector: 'comercial-clientes-dados-faturamento-detalhes',
  templateUrl: './detalhes.component.html',
  styleUrls: ['./detalhes.component.scss']
})
export class ComercialClientesCadastroDadosFaturamentoDetalhesComponent
  implements OnInit {
  public MASKS = utilsBr.MASKS;

  loaderFullScreen: boolean = true;

  dadosFaturamento: any = {};
  dadosFaturamentoLoaded: boolean = false;


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
      this.getDadosFaturamento(params['id']);
    });
  }

  getDadosFaturamento(id: number) {
    this.clientesService
      .getDadosFaturamento(id)
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
          this.dadosFaturamentoLoaded = true;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] === 200) {
            this.dadosFaturamento = response['result'];
            //this.dadosFaturamento.notaCliente = 6;
          } else {
            this.handleDadosFaturamentoError(id);
          }
        },
        error: (error: any) => {
          this.handleDadosFaturamentoError(id);
        }
      });
  }

  handleDadosFaturamentoError(id: number) {
    this.pnotifyService.error();
    this.router.navigate(['/comercial/clientes/detalhes', id]);
  }

}
