import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialClientesDetalheService } from '../detalhes/detalhes.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';

// Interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';

@Component({
  selector: 'comercial-clientes-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class ComercialClientesDashboardComponent implements OnInit {
  loaderFullScreen = true;

  breadCrumbTree: Array<Breadcrumb> = [];

  cliente: any = {};

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private detalhesService: ComercialClientesDetalheService,
    private pnotifyService: PNotifyService,
    private location: Location,
    private atividadesService: AtividadesService,
    private titleService: TitleService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit() {
    
  
    if (this.activatedRoute.snapshot.data['response']['responseCode'] === 200) {
      this.titleService.setTitle('Dashboard de cliente');
      this.registrarAcesso();
      this.getDetalhes();
    } else {
      // No importa el código de respuesta, permitir el acceso
      this.titleService.setTitle('Dashboard de cliente');
      this.registrarAcesso();
      this.getDetalhes();
    }
  }
  

  registrarAcesso() {
    this.atividadesService.registrarAcesso().subscribe();
  }

  getDetalhes() {
    this.activatedRoute.params.subscribe(params => {
      this.detalhesService
        .getDetalhes(params['id'])
        .pipe(
          finalize(() => {
            this.loaderFullScreen = false;
          })
        )
        .subscribe({
          next: (response: any) => {
            if (response['responseCode'] === 200) {
              this.cliente = response['result'];
              this.setBreadCrumb(params['id']);
            } else {
              this.handleLoadDependenciesError();
            }
          },
          error: (error: any) => {
            this.handleLoadDependenciesError();
          }
        });
    });
  }

  handleLoadDependenciesError() {
    this.pnotifyService.error();
    this.location.back();
  }

  setBreadCrumb(id: number) {
    this.breadCrumbTree = [
      {
        descricao: 'Home',
        routerLink: '/comercial/home'
      },
      {
        descricao: 'Busqueda de clientes',
        routerLink: '/comercial/clientes'
      },
      {
        descricao: `Detalles`,
        routerLink: `/comercial/clientes/detalhes/${id}`
      },
      {
         descricao: 'Dashboard de cliente'
      }
    ];
  }
}
