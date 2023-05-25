import { finalize } from 'rxjs/operators';
import {
  Component,
  OnInit,
  AfterContentChecked,
  OnDestroy
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialClientesDetalheService } from '../detalhes/detalhes.service';
import { ComercialClientesService } from 'src/app/modules/comercial/services/clientes.service';
import { ComercialClientesCadastroService } from './cadastro.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';

// Interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';

@Component({
  selector: 'comercial-clientes-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss']
})
export class ComercialClientesCadastroComponent
  implements OnInit, AfterContentChecked, OnDestroy {
  private subscriptionLoaded: Subscription;
  private subscriptionSended: Subscription;

  loaderFullScreen = true;
  loaderNavbar = false;

  codCliente: number;
  cliente: any = {};

  title: string = 'Dados cadastrais';
  showEditButton: boolean = false;
  showAddButton: boolean = false;
  showCancelButton: boolean = false;
  showSubmitButton: boolean = false;
  breadCrumbTree: Array<Breadcrumb> = [];

  travas: number = 0;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private detalhesService: ComercialClientesDetalheService,
    private clientesService: ComercialClientesService,
    private cadastroService: ComercialClientesCadastroService,
    private pnotifyService: PNotifyService,
    private atividadesService: AtividadesService,
    private titleService: TitleService
  ) {
    this.pnotifyService.getPNotify();
    this.actionButtonsConfig();
  }

  ngOnInit() {
    if (this.activatedRoute.snapshot.data['response']['responseCode'] === 200) {
      this.activatedRoute.params.subscribe(params => {
        this.codCliente = params['id'];

        this.registrarAcesso();
        this.setBreadCrumb(this.codCliente);
        this.onRouterChange();
        this.sendedSubscription();
        // this.getTravas(this.codCliente);
        this.getDetalhes(this.codCliente);
      });
    } else if (
      this.activatedRoute.snapshot.data['response']['responseCode'] === 403
    ) {
      this.pnotifyService.notice('Este cliente no pertenece a su cartera');
      this.router.navigate(['/comercial/home']);
    } else {
      this.pnotifyService.error();
      this.location.back();
    }
  }

  ngAfterContentChecked() {
    this.loadedSubscription();
  }

  ngOnDestroy() {
    this.subscriptionLoaded.unsubscribe();
    this.subscriptionSended.unsubscribe();
  }

  loadedSubscription() {
    this.subscriptionLoaded = this.cadastroService.notifyLoadedObservable$.subscribe(
      (response: boolean) => {
        this.loaderNavbar = response;
      }
    );
  }

  sendedSubscription() {
    this.subscriptionSended = this.cadastroService.notifySendedObservable$.subscribe(
      (response: boolean) => {
        if (response === true) {
          if (this.travas > 0) {
            this.getTravas(this.codCliente);
          }
        }
      }
    );
  }

  registrarAcesso() {
    this.atividadesService.registrarAcesso().subscribe();
  }

  setBreadCrumb(id: number) {
    let router = this.router.url.split('/');
    let currRoute = '';

    if (router.length == 6) {
      currRoute = router[router.length - 1];
    } else if (router.length == 7) {
      currRoute = router[router.length - 2];
    } else if (router.length == 8) {
      currRoute = router[router.length - 3];
    } else if (router.length == 9) {
      currRoute = router[router.length - 4];
    }

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
        descricao: 'Detalles',
        routerLink: `/comercial/clientes/detalhes/${id}`
      },
      {
        descricao: this.breadCrumbConfig(currRoute)
      },
      {
        descricao: 'reporte',
        routerLink: '/comercial/reporte'
      },
    ];
  }

  breadCrumbConfig(route: string) {
    let descricao = '';

    if (route == 'dados-faturamento') {
      descricao = 'Datos de facturación';
    } else if (route == 'enderecos') {
      descricao = 'Direcciones';
    } else if (route == 'contatos') {
      descricao = 'Contactos';
    } else if (route == 'dados-relacionamento') {
      descricao = 'Datos de la relación';
    } else if (route == 'potencial-compra') {
      descricao = 'Potencial de compra';
    } else if (route == 'anexos') {
      descricao = 'Anexos';
    } else if (route == 'filial') {
      descricao = 'Filial';
    } else if (route == 'travas') {
      descricao = 'Cerraduras';
    } else if (route == 'informacoes-financeiras') {
      descricao = 'Información financiera';
    } else if (route == 'informacoes-comerciais') {
      descricao = 'Información Comercial';
    }

    this.title = descricao;
    this.titleService.setTitle(descricao);

    return descricao;
  }

  actionButtonsConfig() {
    let router = this.router.url.split('/');
    let routeConfig = {};

    if (router.length == 6) {
      routeConfig = {
        route: router[router.length - 1],
        form: false
      };
    } else if (router.length == 7) {
      routeConfig = {
        route: router[router.length - 2],
        form: true
      };
    } else if (router.length == 8) {
      routeConfig = {
        route: router[router.length - 3],
        form: true
      };
    } else if (router.length == 9) {
      routeConfig = {
        route: router[router.length - 4],
        form: true
      };
    }

    if (routeConfig['route'] == 'dados-faturamento') {
      if (routeConfig['form']) {
        this.setButtonConfig(false, false, true, true);
      } else {
        this.setButtonConfig(true, false, false, false);
      }
    } else if (routeConfig['route'] == 'enderecos') {
      if (routeConfig['form']) {
        this.setButtonConfig(false, false, true, true);
      } else {
        this.setButtonConfig(false, true, false, false);
      }
    } else if (routeConfig['route'] == 'contatos') {
      if (routeConfig['form']) {
        this.setButtonConfig(false, false, true, true);
      } else {
        this.setButtonConfig(false, true, false, false);
      }
    } else if (routeConfig['route'] == 'dados-relacionamento') {
      if (routeConfig['form']) {
        this.setButtonConfig(false, false, true, true);
      } else {
        this.setButtonConfig(true, false, false, false);
      }
    } else if (routeConfig['route'] == 'potencial-compra') {
      if (routeConfig['form']) {
        this.setButtonConfig(false, false, true, true);
      } else {
        this.setButtonConfig(true, false, false, false);
      }
    } else if (routeConfig['route'] == 'anexos') {
      if (routeConfig['form']) {
        this.setButtonConfig(false, false, true, true);
      } else {
        this.setButtonConfig(false, true, false, false);
      }
    } else if (routeConfig['route'] == 'filial') {
      this.setButtonConfig(false, false, false, false);
    } else if (routeConfig['route'] == 'travas') {
      this.setButtonConfig(false, false, false, false);
    } else if (routeConfig['route'] == 'informacoes-financeiras') {
      this.setButtonConfig(false, false, false, false);
    } else if (routeConfig['route'] == 'informacoes-comerciais') {
      this.setButtonConfig(false, false, false, false);
    }
  }

  setButtonConfig(
    edit: boolean,
    add: boolean,
    cancel: boolean,
    submit: boolean
  ) {
    this.showEditButton = edit;
    this.showAddButton = add;
    this.showCancelButton = cancel;
    this.showSubmitButton = submit;
  }

  onRouterChange() {
    this.router.events.subscribe(event => {
      this.actionButtonsConfig();
      this.setBreadCrumb(this.codCliente);
    });
  }

  getTravas(id: number) {
    this.clientesService.getTravas(id).subscribe({
      next: (response: any) => {
        if (response['responseCode'] === 200) {
          let travas = 0;

          if (response['result'].length > 0) {
            for (let i = 0; i < response['result'].length; i++) {
              if (response['result'][i]['situacao'] == 'TRAVADO') {
                travas++;
              }
            }

            this.travas = travas;
          }
        }
      },
      error: (error: any) => {
        this.pnotifyService.error('Ocurrio un error al cargar las deudas.');
        this.location.back();
      }
    });
  }

  getDetalhes(codCliente: number) {
    this.detalhesService
      .getDetalhes(codCliente)
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe((response: any) => {
        if (response['responseCode'] === 200) {
          this.cliente = response['result'];
        }
      });
  }

  onEdit() {
    this.router.navigate([this.router.url, 'editar']);
  }

  onCancel() {
    this.cadastroService.onNotifyCancel(true);
  }

  onSubmit() {
    this.cadastroService.onNotifySubmit(true);
  }

  onAdd() {
    this.router.navigate([this.router.url, 'novo']);
  }
}
