import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// Services
import { ComercialClientesService } from 'src/app/modules/comercial/services/clientes.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

@Component({
  selector: 'comercial-clientes-cadastro-travas-detalhes',
  templateUrl: './detalhes.component.html',
  styleUrls: ['./detalhes.component.scss']
})
export class ComercialClientesCadastroTravasDetalhesComponent
  implements OnInit {
  loaderFullScreen: boolean = true;

  travas: any = [];
  travasLoaded: boolean = false;

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
      this.clientesService
        .getTravas(params['id'])
        .subscribe((response: any) => {
          if (response['responseCode'] === 200) {
            this.loaderFullScreen = false;
            this.travas = response['result'];
            this.travasLoaded = true;
          } else if (response['responseCode'] === 204) {
            this.loaderFullScreen = false;
            this.travasLoaded = true;
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

  iconClass(situacao: string) {
    let iconClass: string;

    if (situacao == 'LIBERADO') {
      iconClass = 'fas fa-check-circle text-success';
    } else if (situacao == 'TRAVADO') {
      iconClass = 'fas fa-exclamation-triangle text-danger';
    }

    return iconClass;
  }
}
