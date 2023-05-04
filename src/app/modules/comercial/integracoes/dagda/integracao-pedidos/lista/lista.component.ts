import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { ptBrLocale } from 'ngx-bootstrap/locale';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { AtividadesService } from './../../../../../../shared/services/requests/atividades.service';
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy,
  TemplateRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Subscription, EMPTY, Observable } from 'rxjs';
import { take, switchMap, finalize } from 'rxjs/operators';

// ngx-bootstrap
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { BsModalRef, BsModalService} from 'ngx-bootstrap/modal';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialIntegracoesDagdaIntegracaoPedidosService } from '../../services/integracao-pedidos.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { DetailPanelService } from 'src/app/shared/templates/detail-panel/detal-panel.service';

// Interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { IPedido } from './../models/pedido';

defineLocale('pt-br', ptBrLocale);

@Component({
  selector: 'comercial-cadastros-linha-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class ComercialIntegracoesDagdaIntegracaoPedidosListaComponent implements OnInit {
  @ViewChild('scrollToFilter', {}) scrollToFilter: ElementRef;

  loaderNavbar = false;
  loaderFullScreen = true;
  loaderModalFullScreen = false;

  breadCrumbTree: Array<Breadcrumb> = [];

  subtitles: Array<Subtitles> = [
    {
      id: 1,
      text: 'Integrado',
      color: 'green',
    },
    {
      id: 2,
      text: 'Ag.Integração',
      color: 'gray',
    },
    {
      id: 3,
      text: 'Erro',
      color: 'red',
    },
  ];

 tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
  };

  activatedRouteSubscription: Subscription;

  showDetailPanelSubscription: Subscription;
  showDetailPanel = false;

  form: FormGroup;
  orderBy = 'codigo';
  orderType = 'ASC';

  maxSize = 10;
  itemsPerPage = 300;
  currentPage = 1;
  totalItems = 0;


  status: Array<any> = [];
  logs: Array<any> = [];

  dados: Array<IPedido> = [];
  dadosPagination: Array<IPedido> = [];
  dadosLoaded = false;
  dadosEmpty = false;
  enviado: Array<any> = [];

  appTitle = 'Integração de Pedidos';
  modalRef: BsModalRef;


  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private location: Location,
    private localeService: BsLocaleService,
    private formBuilder: FormBuilder,
    private pnotifyService: PNotifyService,
    private integracaoPedidosService: ComercialIntegracoesDagdaIntegracaoPedidosService,
    private atividadesService: AtividadesService,
    private titleService: TitleService,
    private confirmModalService: ConfirmModalService,
    private detailPanelService: DetailPanelService,
    private bsModalService: BsModalService,
  ) {
    this.localeService.use('pt-br');
    this.pnotifyService.getPNotify();
  }

  ngOnInit(): void {
    this.getStatus();
    this.registrarAcesso();
    this.setBreadCrumb();
    this.setFormFilter();
    this.titleService.setTitle('Pedidos');

  }

  ngOnDestroy(): void {
    //this.showDetailPanelSubscription.unsubscribe();
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  setBreadCrumb() {
    const id = this.activatedRoute.snapshot.params.idSubModulo;
    this.breadCrumbTree = [
      {
        descricao: 'Home',
        routerLink: `/comercial/home`,
      },
      {
        descricao: 'Integração Dagda',
        routerLink: `/comercial/integracoes/dagda/${id}`,
      },
      {
        descricao: this.appTitle,
      },
    ];
  }


  /*Formulario */
  setFormFilter(): void {
    const formValue: any = this.checkRouterParams();

    this.form = this.formBuilder.group({
      idEmpresa: [formValue.idEmpresa],
      nomeEmpresa: [formValue.nomeEmpresa],
      pedidoTid: [formValue.pedidoTid],
      pedidoDagda: [formValue.pedidoDagda],
      status: [formValue.status],
      dataAcao:[formValue.dataAcao],
      orderBy: [formValue.orderBy],
      orderType: [formValue.orderType],
      pagina: [formValue.pagina],
      registros: [formValue.registros, Validators.required],

    });

    this.checkOrder();
    this.loaderFullScreen = false;
  }

  checkRouterParams(): Object {
    let formValue = {
      idEmpresa:'',
      nomeEmpresa: '',
      pedidoTid:'',
      pedidoDagda: '',
      status: 0,
      dataAcao:'',
      orderBy: this.orderBy,
      orderType: this.orderType,
      pagina: 1,
      registros: this.itemsPerPage,

    };

    this.activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (queryParams: any) => {
        if (Object.keys(queryParams).length > 0) {
          let params = atob(queryParams['q']);
          params = JSON.parse(params);
          this.search(params);

          Object.keys(formValue).forEach((formKey) => {
            Object.keys(params).forEach((paramKey) => {
              if (
                formKey == paramKey &&
                formValue[formKey] != params[paramKey]
              ) {
                if (!isNaN(Number(params[paramKey]))) {
                  formValue[formKey] = Number(params[paramKey]);
                } else {
                  formValue[formKey] = params[paramKey];
                }
              }
            });
          });
        }
      }
    );
    this.activatedRouteSubscription.unsubscribe();

    return formValue;
  }

  checkOrder(): void {
    if (this.form.value.orderBy !== this.orderBy) {
      this.orderBy = this.form.value.orderBy;
    }

    if (this.form.value.orderType !== this.orderType) {
      this.orderType = this.form.value.orderType;
    }
  }

  setOrderBy(column: string): void {
    if (this.orderBy === column) {
      if (this.orderType == 'DESC') {
        this.orderType = 'ASC';
      } else if (this.orderType == 'ASC') {
        this.orderType = 'DESC';
      }
    } else {
      this.orderBy = column;
      this.orderType = 'ASC';
    }

    this.form.value.orderBy = this.orderBy;
    this.form.value.orderType = this.orderType;

    this.onFilter();
  }

  /*Modal*/
  openModal(template: TemplateRef<any>, index) {
    this.modalRef = this.bsModalService.show(template,{
      class: 'modal-xl',
    });
  }

  closeModal(modalRef: TemplateRef<any>) {
    this.modalRef.hide();
  }

  /*Filtrar*/
  onFilter(): void {
    if (this.form.valid) {
      this.itemsPerPage = this.form.value.registros;
      this.currentPage = 1;
      this.setRouterParams(this.verificaParams());
    }

  }

  /*Select */
  getStatus() {
    this.loaderFullScreen = true;
    this.integracaoPedidosService
      .getIntegracaoStatus()
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.success === true) {
            this.status = response.data
            this.status.unshift({
              id: 0,
              nomeStatus: 'EXIBIR TODOS',
            });
          } else {
            this.pnotifyService.error();
          }
        },
        error: (error: any) => {
          this.pnotifyService.error();
        }
      });
  }

  /*Log /histórico */
  onLogs(item) {
    this.loaderModalFullScreen = true;
    this.integracaoPedidosService
      .getIntegracaoLogs(item)
      .pipe(
        finalize(() => {
          this.loaderModalFullScreen = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.body['success'] === true) {
            this.logs = response.body['data'];
          }
        },
        error: (error: any) => {
          this.pnotifyService.error();
        }
      });
  }

   /*Processar */
  postProcessamento(item, index) {
    item.dsIntegracao = 'Solicitação de Processamento'
    this.enviado.push(index)
    this.loaderNavbar = true;
    this.integracaoPedidosService
      . postIntegracaoPedidos(item)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.body['success'] === true) {
            this.pnotifyService.success();
            this.onFilter();
          }
        },
        error: (error: any) => {
          this.enviado = [];
          this.pnotifyService.error();
        }
      });
  }

  setRouterParams(params: any): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { q: btoa(JSON.stringify(params)) },
    });
    this.search(params);
  }

  verificaParams(): Object {
    let params: any = {};

    if (this.form.value.pedidoTid) {
      params.pedidoTid = this.form.value.pedidoTid;
    }

    if (this.form.value.pedidoDagda) {
      params.pedidoDagda = this.form.value.pedidoDagda;
    }

    if (this.form.value.status) {
      params.status = this.form.value.status;
    }

    if (this.form.value.dataAcao) {
      params.dataAcao = this.form.value.dataAcao;
    }

    params.orderBy = this.form.value.orderBy;
    params.orderType = this.form.value.orderType;

    return params;
  }

  search(params: any): void {
    this.loaderNavbar = true;
    this.dados = [];
    this.dadosPagination = [];
    this.dadosLoaded = false;
    this.dadosEmpty = false;

    this.integracaoPedidosService
    .getIntegracaoPedidos(params)
    .pipe(
      finalize(() => {
        this.loaderNavbar = false;
        this.dadosLoaded = true;
      })
    )
    .subscribe({
      next: (response:any ) => {
        if (response.status === 200) {
          this.dados = response.body['data'];
          this.dadosPagination = this.dados.slice(0, this.itemsPerPage);
          this.totalItems = this.dados.length;
          this.dadosLoaded = true;
        } else {
          this.pnotifyService.notice('Nenhuma informação encontrada');
          this.dadosEmpty = true;
        }
      },
      error: (error: any) => {
        this.dadosEmpty = true;
        if (error.error.hasOwnProperty('mensagem')) {
          this.pnotifyService.error(error.error.mensagem);
        } else {
          this.pnotifyService.error();
        }
      }
    });
  }

 /* Borda lateral da tabela */

  classStatusBorder(item): string {
    let borderClass: string;

    if (item.status === '1') {
    borderClass = 'border-success';
  } else if (item.status === '2') {
    borderClass = 'border-secondary'
  } else if (item.status === '3') {
    borderClass = 'border-danger';
  }
  return borderClass;
 }

/*Paginação */
 onPageChanged(event: PageChangedEvent): void {
  const startItem = (event.page - 1) * event.itemsPerPage;
  const endItem = event.page * event.itemsPerPage;
  this.dadosPagination = this.dados.slice(startItem, endItem);

  this.scrollToFilter.nativeElement.scrollIntoView({
    behavior: 'instant',
  });
 }
}
