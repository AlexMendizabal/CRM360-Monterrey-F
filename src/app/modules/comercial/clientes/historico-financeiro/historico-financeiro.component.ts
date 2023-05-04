import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { finalize } from 'rxjs/operators';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialClientesDetalheService } from './../detalhes/detalhes.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';

// Interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';

@Component({
  selector: 'comercial-clientes-historico-financeiro',
  templateUrl: './historico-financeiro.component.html',
  styleUrls: ['./historico-financeiro.component.scss']
})
export class ComercialClientesHistoricoFinanceiroComponent implements OnInit {
  loaderFullScreen = true;

  breadCrumbTree: Array<Breadcrumb> = [];

  cliente: any = {};

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
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
      this.registrarAcesso();
      this.getDetalhes();
    } else if (
      this.activatedRoute.snapshot.data['response']['responseCode'] === 403
    ) {
      this.pnotifyService.notice('Ese cliente no forma parte de su cartera');
      this.router.navigate(['/comercial/home']);
    } else {
      this.pnotifyService.error();
      this.location.back();
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
              this.onRouterChange();
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
    let router = this.router.url.split('/');
    let currRoute = router[router.length - 1];

    this.breadCrumbTree = [
      {
        descricao: 'Home',
        routerLink: '/comercial/home'
      },
      {
        descricao: 'Busqueda de clientes',
        routerLink: '/comercial/clientes/lista'
      },
      {
        descricao: 'Detalhes',
        routerLink: `/comercial/clientes/detalhes/${id}`
      },
      {
        descricao: 'Histórico financeiro',
        routerLink: `/comercial/clientes/historico-financeiro/${id}/resumo`
      },
      {
        descricao: this.breadCrumbConfig(currRoute)
      }
    ];
  }

  breadCrumbConfig(route: string) {
    let descricao = '';

    if (route == 'resumo') {
      descricao = 'Resumo';
    } else if (route == 'detalhes') {
      descricao = 'Detalhes';
    } else if (route == 'acumulos-mensais') {
      descricao = 'Acúmulos mensais';
    } else if (route == 'notas-promissorias') {
      descricao = 'Notas promissórias';
    } else if (route == 'debitos') {
      descricao = 'Débitos em aberto';
    } else if (route == 'corte-dobra') {
      descricao = 'Corte Dobra';
    } else {
      descricao = 'Materiais da duplicata';
    }

    this.titleService.setTitle(descricao);

    return descricao;
  }

  onRouterChange() {
    this.router.events.subscribe(event => {
      this.activatedRoute.params.subscribe(params => {
        this.setBreadCrumb(params['id']);
      });
    });
  }
}
