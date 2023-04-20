import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialClientesService } from 'src/app/modules/comercial/services/clientes.service';

@Component({
  selector: 'comercial-clientes-cadastro-informacoes-comerciais-detalhes',
  templateUrl: './detalhes.component.html',
  styleUrls: ['./detalhes.component.scss']
})
export class ComercialClientesCadastroInfosFinanceirasDetalhesComponent
  implements OnInit {
  loaderFullScreen: boolean = true;

  infosFinanceiras: any = {};
  infosFinanceirasLoaded: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private pnotifyService: PNotifyService,
    private clientesService: ComercialClientesService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit() {
    this.activatedRoute.parent.parent.params.subscribe(params => {
      this.clientesService
        .getInformacoesFinanceiras(params['id'])
        .subscribe((response: any) => {
          if (response['responseCode'] === 200) {
            this.loaderFullScreen = false;
            this.infosFinanceiras = response['result'];
            this.infosFinanceirasLoaded = true;
          } else if (response['responseCode'] === 204) {
            this.loaderFullScreen = false;
            this.infosFinanceirasLoaded = true;
          } else {
            this.pnotifyService.error();
            this.router.navigate([
              '/comercial/clientes/detalhes',
              params['id']
            ]);
          }
        });
    });
  }
}
