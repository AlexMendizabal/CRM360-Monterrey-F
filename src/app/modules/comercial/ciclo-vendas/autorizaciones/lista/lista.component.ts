import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy,
  TemplateRef,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';

// ngx-bootstrap
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

defineLocale('es', esLocale);

// Services
import { AuthService } from 'src/app/shared/services/core/auth.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { DateService } from 'src/app/shared/services/core/date.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { ComercialCicloVendasAutorizacionesService } from '../autorizaciones.service';
import { ComercialCicloVendasCotacoesListaService } from '../../cotacoes/lista/lista.service';
import { ComercialCicloVendasAutorizacionesListaService } from './lista.service';
import { ComercialVendedoresService } from '../../../services/vendedores.service';
import { DetailPanelService } from 'src/app/shared/templates/detail-panel/detal-panel.service';
import { ComercialCicloVendasCotacoesListaModalHistoricoComercialService } from './modal/historico-comercial/historico-comercial.service';
import { ComercialCicloVendasCotacoesListaModalConsultaLiberacaoService } from './modal/consulta-liberacao/consulta-liberacao.service';
import { ComercialCicloVendasCotacoesListaModalTrocarClienteService } from './modal/trocar-cliente/trocar-cliente.service';
import { ComercialCicloVendasCotacoesListaModalDuplicarPropostaService } from './modal/duplicar-proposta/duplicar-proposta.service';
import { ComercialCicloVendasCotacoesListaModalDesdobrarPropostaService } from './modal/desdobrar-proposta/desdobrar-proposta.service';
import { ComercialCicloVendasCotacoesListaModalTrocarEmpresaService } from './modal/trocar-empresa/trocar-empresa.service';
import { ComercialCicloVendasCotacoesListaModalEmailCotacaoService } from './modal/email-cotacao/email-cotacao.service';
import { ComercialCicloVendasCotacoesListaModalTransfereFaturamentoService } from './modal/transfere-faturamento/transfere-faturamento.service';
import { ComercialCicloVendasCotacoesListaModalHistoricoExclusaoService } from './modal/historico-exclusao/historico-exclusao.service';
import { ModalAutorizacionService} from '../../autorizaciones/lista/modal-autorizacion/modal-autorizacion.service';

// Interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';
import { ICotacao } from './models/cotacao';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { JsonResponse } from 'src/app/models/json-response';
import { IAssociacao } from '../../../cadastros/propostas/associacao-situacoes-proposta/models/associacao-situacoes-proposta';

@Component({
  selector: 'comercial-ciclo-vendas-cotacoes-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class ComercialCicloVendasCotacoesListaComponent
  implements OnInit, OnDestroy {
  user = this.authService.getCurrentUser();

  @ViewChild('scrollToFilter', {}) scrollToFilter: ElementRef;
  @ViewChild('scrollToDetails', {}) scrollToDetails: ElementRef;

  loaderNavbar: boolean;
  loaderFullScreen = true;

  loading = true;
  loadingNavBar = false;
  noResult = false;
  //nombreCliente: [];
  formFilter: FormGroup;


  loaderConsultaLiberacaoSubscription: Subscription;
  loaderDesdobrarPropostaSubscription: Subscription;
  loaderEmailCotacaoSubscription: Subscription;
  loaderHistoricoExclusaoSubscription: Subscription;

  trocarClienteSubscription: Subscription;
  transfereFaturamentoSubscrition: Subscription;
  cotacaoDuplicadaSubscription: Subscription;
  cotacaoDesdobradaSubscription: Subscription;
  trocarEmpresaSubscription: Subscription;

  estado_oferta = [
    { "id": "T", "nombre": "Todos" },
    { "id": 0, "nombre": "Aprobado" },
    { "id": 1, "nombre": "Pendiente" },
    { "id": 2, "nombre": "Rechazado" },
  ];

  formGroup: FormGroup;
  defaultSelection = this.estado_oferta[0];
  breadCrumbTree: Array<Breadcrumb> = [];

  subtitles: Array<Subtitles> = [];
  leyendas: Array<Subtitles> = [];


  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
  };

  activatedRouteSubscription: Subscription;

  showDetailPanelSubscription: Subscription;
  showDetailPanel = false;
  detailPanelTitle: string;

  bsConfig: Partial<BsDatepickerConfig>;

  form: FormGroup;
  orderBy = 'id_oferta';
  orderType = 'DESC';

  nrCliente: number;
  codSituacao: number;
  pedidoTransferido: number;
  imprimirSeparacao: number;
  empresas: Array<any> = [];
  depositos: Array<any> = [];
  filteredDepositos: Array<any> = [];
  situacoesCores: Array<IAssociacao> = [];
  vendedores: Array<any> = [];
  dataInicial: Array<any> = []; //////aumente esto para usar en la funcion getFilterValues
  dataFinal: Array<any> = []; //////aumente esto para usar en la funcion getFilterValues
  totalMateriales: Array<any> = [];

  dataFromParent: any;
  data: [];
  autorizaciones: any = [];
  items: Array<any> = [];

  dados: Array<any> = [];
  datos: Array<ICotacao> = [];
  datosAutorizaciones: Array<ICotacao> = []
  dadosLoaded = false;
  dadosEmpty = false;
  searchSubmitted = false;

  detalhes: any = {
    dataFaturamento: Date,
    contatos: [],
    itens: {
      materiais: [],
      total: {},
    },
  };

  modalRef: BsModalRef;
  loadingModal = false;

  contatosLoaded = false;
  contatosEmpty = false;
  contatoSelected: any = {};
  itensLoaded = false;
  itensEmpty = false;

  activeRow: number;
  activeCotacao: ICotacao;

  maxSize = 10;
  totalModal = 0;
  itemsPerPageModal = 20;
  /* Pagination */
  itemsPerPage = 100;
  totalItems = 10;
  currentPage = 1;
  /* Pagination */

  imprimirPdf: boolean = false;
  pdfBase64: any;

  detalhesCodCliente: any;
  filtroCotacoes: boolean;
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private localeService: BsLocaleService,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private pnotifyService: PNotifyService,
    private dateService: DateService,
    private titleService: TitleService,
    private atividadesService: AtividadesService,
    private cotacoesService: ComercialCicloVendasAutorizacionesService, //de dataFromParent
    private listaService: ComercialCicloVendasCotacoesListaService,
    private vendedoresService: ComercialVendedoresService,
    private detailPanelService: DetailPanelService,
    private historicoExclusaoService: ComercialCicloVendasCotacoesListaModalHistoricoExclusaoService,
    private consultaLiberacaoService: ComercialCicloVendasCotacoesListaModalConsultaLiberacaoService,
    private trocarClienteService: ComercialCicloVendasCotacoesListaModalTrocarClienteService,
    private transfereFaturamentoService: ComercialCicloVendasCotacoesListaModalTransfereFaturamentoService,
    private duplicarPropostaService: ComercialCicloVendasCotacoesListaModalDuplicarPropostaService,
    private desdobrarPropostaService: ComercialCicloVendasCotacoesListaModalDesdobrarPropostaService,
    private emailCotacaoService: ComercialCicloVendasCotacoesListaModalEmailCotacaoService,
    private modalService: BsModalService,
    private modalAutorizacionService:  ModalAutorizacionService
  ) {
    this.localeService.use('es');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );
    this.pnotifyService.getPNotify();
  }

  ngOnInit(): void {
    this.registrarAcesso();
    this.setBreadCrumb();
    this.checkUserProfile();
    this.setLoaderEvents();
    this.setChangeEvents();
    this.getFilterValues();
    this.setFormFilter();
    this.titleService.setTitle('Autorizaciones');
    this.onDetailPanelEmitter();
   //this.detalhesCodCliente = this.activatedRoute.snapshot.queryParams['codCliente'];
    this.getDatosAutorizaciones();
    this.search(null);


    /* this.formGroup = this.formBuilder.group({
      dataInicial: [''], // Valor inicial del campo dataInicial
      dataFinal: [''], // Valor inicial del campo fechaFinal
      estado_oferta: [''],
      nrPedido: [''],
      codVendedor: [''],
      pagina: [''],
      registros: ['']
    }); */
  }

  ngOnDestroy(): void {
    this.unsetLoaderEvents();
    this.unsetChangeEvents();
    this.activatedRouteSubscription.unsubscribe();
    this.showDetailPanelSubscription.unsubscribe();
  }

 /*  navigateToNuevo() {
    this.router.navigate(['./nuevo']);
  } */

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  setBreadCrumb() {
    const id = this.activatedRoute.snapshot.params.idSubModulo;
    this.activatedRoute.params.subscribe((params: any) => {
      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/comercial/home',
        },
        {
          descricao: 'Ciclo de vendas',
          routerLink: `/comercial/ciclo-vendas/${id}`,
        },
        {
          descricao: 'Autorizaciones',
        },
      ];
    });
  }

  setLoaderEvents(): void {
    this.loaderConsultaLiberacaoSubscription =
      this.consultaLiberacaoService.loaderNavbar.subscribe(
        (response: boolean) => {
          this.loaderNavbar = response;
        }
      );

    this.loaderHistoricoExclusaoSubscription =
      this.historicoExclusaoService.loaderNavbar.subscribe(
        (response: boolean) => {
          this.loaderNavbar = response;
        }
      );

    this.loaderDesdobrarPropostaSubscription =
      this.desdobrarPropostaService.loaderNavbar.subscribe(
        (response: boolean) => {
          this.loaderNavbar = response;
        }
      );

    this.loaderEmailCotacaoSubscription =
      this.emailCotacaoService.loaderNavbar.subscribe((response: boolean) => {
        this.loaderNavbar = response;
      });
  }

  setChangeEvents(): void {

    this.trocarClienteSubscription = this.listaService.clienteCotacao.subscribe(
      (data: [any, ICotacao]) => {
        if (data.length > 0) {
          this.onChangeClienteCotacao(data);
        }
      }
    );

    this.transfereFaturamentoSubscrition =
      this.listaService.transfereFaturamento.subscribe((data: [ICotacao]) => {
        if (data.length > 0) {
          this.onTransferidaFaturamento(data);
        }
      });

    this.cotacaoDuplicadaSubscription =
      this.listaService.cotacaoDuplicada.subscribe(
        (data: [number, number, ICotacao]) => {
          if (data.length > 0) {
            this.onPropostaDuplicada(data);
          }
        }
      );

    this.cotacaoDesdobradaSubscription =
      this.listaService.cotacaoDesdobrada.subscribe(
        (data: [number, ICotacao, []]) => {
          if (data.length > 0) {
            this.onPropostaDesdobrada(data);
          }
        }
      );
  }

  unsetLoaderEvents(): void {
    this.loaderConsultaLiberacaoSubscription.unsubscribe();
    this.loaderDesdobrarPropostaSubscription.unsubscribe();
    this.loaderEmailCotacaoSubscription.unsubscribe();
    this.loaderHistoricoExclusaoSubscription.unsubscribe();
  }

  unsetChangeEvents(): void {
    this.trocarClienteSubscription.unsubscribe();
    this.cotacaoDuplicadaSubscription.unsubscribe();
    this.cotacaoDesdobradaSubscription.unsubscribe();
    this.trocarEmpresaSubscription.unsubscribe();
  }

  onDetailPanelEmitter(): void {
    this.showDetailPanelSubscription = this.detailPanelService.config.subscribe(
      (event: any) => {
        this.showDetailPanel = event.showing;

        if (this.showDetailPanel === false) {
          this.onCloseDetailPanel();
        }
      }
    );
  }

  checkUserProfile(): void {
    const profile = this.activatedRoute.snapshot.data.profile.result;

    if (profile.coordenador === true || profile.gestor === true) {
      this.getVendedores();
    } else if (
      profile.vendedor === true &&
      profile.coordenador === false &&
      profile.gestor === false
    ) {
      this.getVinculoOperadores();
    }
  }

  getVendedores(): void {
    this.vendedoresService.getVendedores().subscribe((response: any) => {
      if (response.responseCode === 200) {
        this.vendedores = response.result;

        this.vendedores.unshift({
          id: 0,
          nome: 'EXHIBIR TODOS',
        });
      }
    });
  }

  getVinculoOperadores(): void {
    this.vendedoresService.getVinculoOperadores().subscribe((response: any) => {
      if (response.responseCode === 200) {
        this.vendedores = response.result;
        this.formGroup.controls.codVendedor.setValue(parseInt(null));
        this.formGroup.controls.codVendedor.updateValueAndValidity();
      }
    });
  }

  getFilterValues(): void {
    let params: any;
    this.cotacoesService
      .getAutorizaciones(params)
      .pipe(
        finalize(() => {
          this.populaDadosResolver();
          this.loaderFullScreen = false;
        })
      )
      .subscribe(
        (response: any | JsonResponse[]) => {
           this.estado_oferta = [
            {
              "id": "T",
              "nombre": "Todos"
            },
            {
              "id": 1,
              "nombre": "Pendiente"
            },
            {
              "id": 2,
              "nombre": "Aprobado"
            },
            {
              "id": 3,
              "nombre": "Rechazado"
            },
          ]
        },
        (error: any) => {
          this.pnotifyService.error('Ha ocurrido un error al cargar los filtros requeridos.');
          this.location.back();
        }
      );
  }


  setFormFilter(): void {
    const formValue: any = this.checkRouterParams();

    this.formGroup = this.formBuilder.group({
      dataInicial: [formValue['dataInicial']],
      dataFinal: [formValue['dataFinal']],
      codVendedor: [formValue['codVendedor']],
      estado_oferta: [formValue['estado_oferta']],
      nrPedido: [formValue['nrPedido']],
      pagina: [formValue['pagina']],
      registros: [formValue['registros']]
    });
  }

  checkRouterParams(): Object {
    let formValue = {
      dataInicial: this.dateService.getFirstDayMonth(),
      dataFinal: this.dateService.getLastDayMonth(),
      codVendedor: 0,
      estado_oferta: this.estado_oferta,
      nrPedido: null,
      pagina: 1,
      registros: this.itemsPerPage,
    };

    this.activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (queryParams: any) => {
        if (Object.keys(queryParams).length > 0) {
         let params = atob(queryParams['q']);
          params = JSON.parse(params);
          this.setSubmittedSearch();
          this.search(params);
        }
      }
    );

    this.activatedRouteSubscription.unsubscribe();
    return formValue;
  }

setOrderBy(column: string) {
  if (this.orderBy === column) {
    if (this.orderType == 'DESC') {
      this.orderType = 'ASC';
    } else if (this.orderType == 'ASC') {
      this.orderType = 'DESC';
    }
  } else {
    this.orderBy = column;
    this.orderType = 'DESC';
  }
  this.onFilter();
}

setOrderByModal(column: string) {
  //console.log(column);
  if (this.orderBy === column) {
    this.orderType = this.orderType === 'asc' ? 'desc' : 'asc'; // Cambiar el tipo de orden si se hace clic nuevamente en la misma columna
  } else {
    this.orderBy = column;
    this.orderType = 'asc'; // Establecer el orden ascendente por defecto al hacer clic en una nueva columna
  }

  this.items.sort((a, b) => {

    const valueA = a[column]/* .toUpperCase(); */;
    const valueB = b[column]/* .toUpperCase() */;
    /*       console.log(this.datos);
          console.log(column); */
    if (valueA < valueB) {
      return this.orderType === 'asc' ? -1 : 1;
    }
    if (valueA > valueB) {
      return this.orderType === 'asc' ? 1 : -1;
    }
    return 0;
  });

}
filterByFechaInicialStatus(status: string): void {
  this.formGroup.get('dataInicial').setValue(status);
  this.onFilter();
}
filterByFechaFinalStatus(status: string): void {
  this.formGroup.get('dataFinal').setValue(status);
  this.onFilter();
}
filterByCodVendedorStatus(status: string): void {
  this.formGroup.get('codVendedor').setValue(status);
  this.onFilter();
}
 filterByEstadoStatus(status: string): void {
  this.formGroup.get('estado_oferta').setValue(status);
  this.onFilter();
}


onFilter(): void {
    this.itemsPerPage = this.formGroup.value.registros;
    this.currentPage = 1;

    this.detailPanelService.hide();
    this.setRouterParams(this.getFormFilterValues());
    this.getDatosAutorizaciones();
  return;
}


setSubmittedSearch(): void {
  this.searchSubmitted = true;
}

setRouterParams(params: any): void {
  this.router.navigate([], {
    relativeTo: this.activatedRoute,
    queryParams: { q: btoa(JSON.stringify(params)) },
    queryParamsHandling: 'merge',
  });
  this.setSubmittedSearch();
  this.search(params);
}

getFormFilterValues(): Object {
  let params: any = {};

  if (this.formGroup.value.dataInicial) {
    params.dataInicial = this.dateService.convertToUrlDate(
      new Date(this.formGroup.value.dataInicial)
    );
  }

  if (this.formGroup.value.dataFinal) {
    params.dataFinal = this.dateService.convertToUrlDate(
      new Date(this.formGroup.value.dataFinal)
    );
  }

  if (this.formGroup.value.estado_oferta && this.formGroup.value.estado_oferta.id) {
    const idEstadoOferta = this.formGroup.value.estado_oferta.id;
    params['estado_oferta'] = idEstadoOferta;
  }

  if (this.formGroup.value.nrPedido) {
    params.nrPedido = this.formGroup.value.nrPedido;
  }

  if (this.formGroup.value.codVendedor) {
    params.codVendedor = this.formGroup.value.codVendedor;
  }

  if (this.formGroup.value.pagina) {
    params.pagina = this.formGroup.value.pagina;
  }

  if (this.formGroup.value.registros) {
    params.registros = this.formGroup.value.registros;
  }

  params.orderBy = this.orderBy;
  params.orderType = this.orderType;
  return params;
}

populaDadosResolver() {
  if (this.activatedRoute.snapshot.url.length > 1) {
    const resolver = this.activatedRoute.snapshot.data.data;
    if (resolver.success === true) {
      this.autorizaciones.push(resolver.data[0]);
      this.formGroup.controls.nrPedido.setValue(resolver.data[0].nrPedido);
      /* this.form.controls.codEmpresa.setValue(resolver.data[0].codEmpresa);
      this.filteredDepositos = this.depositos.filter(
        (value: any) => value.idEmpresa == resolver.data[0].codEmpresa
      );

      if (this.filteredDepositos.length === 1) {
        this.form.controls.codDeposito.setValue(
          this.filteredDepositos[0]['idDeposito']
        );
      } */
    }
  }
}

search(params: any): void {
  this.loaderNavbar = false;
  this.dadosLoaded = false;
  this.dadosEmpty = false;
  this.detailPanelService.hide();
  this.datosAutorizaciones = [];
  this.totalItems = 0;

  this.cotacoesService
    .getAutorizaciones(params)
    .pipe(
      finalize(() => {
        this.loading = false;
        this.loadingNavBar = false;
      })
    )
    .subscribe({
      next: (response: JsonResponse) => {
        if (response.hasOwnProperty('success') && response.success === true) {
          this.datos = response.data;
          this.datosAutorizaciones = this.datos.slice(0, this.itemsPerPage);
          this.totalItems = this.datos.length;
          this.dadosLoaded = true;
          this.loaderNavbar = false;
        }
      },
      error: (error: any) => {
        this.handleSearchError('Error al cargar lista de autorizaciones.');
        this.loaderNavbar = false;
      }
    });
}

handleSearchError(msg: string = null) {
  this.pnotifyService.error(msg);
  this.location.back();
}

onReset() {
  this.formGroup.reset();
  this.formGroup.patchValue({
    dataInicial: this.dateService.getFirstDayMonth(),
    dataFinal: this.dateService.getLastDayMonth(),
    estado_oferta: 0,
    codVendedor: 0,
    nrPedido: null,
    pagina: 1,
    registros: this.itemsPerPage,
    //statusCliente: 'Ativo'
  });
}

onPageChanged(event: PageChangedEvent) {
  if (this.formGroup.value.pagina != event.page) {
    this.formGroup.controls.pagina.setValue(event.page);

    this.onCloseDetailPanel();
    this.detailPanelService.hide();
    this.setRouterParams(this.getFormFilterValues());

    this.scrollToFilter.nativeElement.scrollIntoView({
      behavior: 'instant',
    });
  }
}

getPaginateData(): any[] {
  const startIndex = (this.currentPage - 1) * this.itemsPerPage;
  const endIndex = startIndex + this.itemsPerPage;
  return this.autorizaciones.slice(startIndex, endIndex);
}

onPageChangedModal(event: PageChangedEvent): void {
  this.currentPage = event.page;
  this.getPaginateDataModal();
}

getPaginateDataModal(): any[] {
  const startIndex = (this.currentPage - 1) * this.itemsPerPageModal;
  const endIndex = startIndex + this.itemsPerPageModal;
  //this.getPaginatedData = this.resuldata.slice(startIndex, endIndex);
  return this.items.slice(startIndex, endIndex);
}


resetRegister(): void {
  this.detalhes.contatos = [];
  this.detalhes.itens = {
    materiais: [],
    total: {},
  };

  this.contatosLoaded = false;
  this.contatosEmpty = false;

  this.itensLoaded = false;
  this.itensEmpty = false;
}

viewContato(contato: any): void {
  this.contatoSelected = contato;
}


onCloseDetailPanel(): void {
  this.resetActiveCotacao();
  this.resetActiveRow();
  this.resetRegister();
}

setActiveCotacao(cotacao: ICotacao): void {
  this.activeCotacao = cotacao;
}

resetActiveCotacao(): void {
  this.activeCotacao = null;
}

setActiveRow(index: number): void {
  this.activeRow = index;
}

resetActiveRow(): void {
  this.activeRow = null;
}

// onSubtitleActivationChange(event: any): void {
// }

showLoaderNavbar(event: boolean) {
  this.loaderNavbar = event;
}

onTrocarCliente(): void {
  if(
    this.activeCotacao.codCliente &&
      this.activeCotacao.codCliente !== null
    ) {
  this.trocarClienteService.showModal(this.activeCotacao);
}
  }

onChangeClienteCotacao(data: [any, ICotacao]): void {
  const updatedCotacao: ICotacao = data[1];

  this.form.controls.nrPedido.setValue(updatedCotacao.nrPedido);
  this.form.controls.codEmpresa.setValue(updatedCotacao.codEmpresa);

  this.onFilter();
}

onValidarDuplicatas(): void {
  this.loaderNavbar = true;

  this.cotacoesService
    .getValidadeDuplicata(
      this.activeCotacao.nrPedido,
      this.activeCotacao.codEmpresa
    )
    .pipe(
      finalize(() => {
        this.loaderNavbar = false;
      })
    )
    .subscribe((response: JsonResponse) => {
      if (response.success === true) {
        this.onTransfereFaturamento();
      } else {
        this.pnotifyService.notice(response.mensagem);
      }
    });
}

onTransfereFaturamento(): void {
  if(
    this.activeCotacao.codCliente &&
      this.activeCotacao.codCliente !== null
    ) {
  this.transfereFaturamentoService.showModal(this.activeCotacao);
}
  }

onTransferidaFaturamento(data: [ICotacao]) {
  const updatedCotacao: ICotacao = data[0];

  this.form.controls.nrPedido.setValue(updatedCotacao.nrPedido);
  this.form.controls.codEmpresa.setValue(updatedCotacao.codEmpresa);
  this.onFilter();
}

onDuplicarProposta(): void {
  if(
    this.activeCotacao.codCliente &&
      this.activeCotacao.codCliente !== null
    ) {
  // Remove "EXIBIR TODOS".
  const vendedores = this.vendedores.filter(
    (vendedor) => vendedor.id !== 0
  );

  this.duplicarPropostaService.showModal(vendedores, this.activeCotacao);
}
  }

onPropostaDuplicada(data: [number, number, ICotacao]): void {
  const nrProposta = data[0];
  const codVendedor = data[1];
  const cotacao = data[2];

  this.form.controls.nrPedido.setValue(nrProposta);
  this.form.controls.codEmpresa.setValue(cotacao.codEmpresa);
  this.form.controls.codVendedor.setValue(codVendedor);
  this.onFilter();
}

onDesdobrarProposta(): void {
  if(
    this.activeCotacao.codCliente &&
      this.activeCotacao.codCliente !== null
    ) {
  this.desdobrarPropostaService.showModal(this.activeCotacao);
}
  }

onPropostaDesdobrada(data: [number, ICotacao, []]): void {
  const nrProposta = data[0];
  const cotacao = data[1];
  const materiais = data[2];

  this.form.controls.nrPedido.setValue(nrProposta);
  this.form.controls.codEmpresa.setValue(cotacao.codEmpresa);
  this.onFilter();

  /* if (materiais.length > 0) {
    this.itensLoaded = false;

    const filteredMateriais = this.detalhes.itens['materiais'].filter(
      (_material: any) =>
        !materiais.some(
          (material: any) => material.codigo === _material.codigo
        )
    );

    let total = {
      quantidade: 0,
      valor: 0,
    };

    filteredMateriais.map((material: any) => {
      total.quantidade += material.quantidade;
      total.valor += material.valorTotal;
    });

    this.detalhes.itens = {
      materiais: filteredMateriais,
      total: total,
    };

    setTimeout(() => {
      this.itensLoaded = true;
    }, 1000);
  } */
}

openModal(id_autorizacion) {
   //console.log(id_autorizacion);
  this.modalAutorizacionService.showModal(id_autorizacion);
}

hideModal() {
  this.modalRef.hide();
  this.formGroup.controls.codEmpresaAdd.reset();
  this.formGroup.controls.codEmpresaAdd.clearValidators();
  this.formGroup.controls.codEmpresaAdd.updateValueAndValidity();
}

nuevo() {
  this.router.navigate(
    [
      '../novo', 1
    ],
    {
      queryParams: { codCliente: this.detalhesCodCliente },
      relativeTo: this.activatedRoute,
    }
  );
}


 getDatosAutorizaciones(){
  const params = this.getFormFilterValues();
  if (!this.loading) {
    this.loadingNavBar = false;
  }
  this.cotacoesService
    .getAutorizaciones(params)
    .pipe(
      finalize(() => {
        this.loading = false;
        this.loadingNavBar = false;
      })
    )
    .subscribe(
      response => {
        if (response['success'] !== true) {
          this.autorizaciones = [];
          this.noResult = true;
          this.pnotifyService.notice('No hay registros de su búsqueda');
        } else {
          this.autorizaciones = response['data'];
        }
      },
      error => {
        this.data = [];
        this.noResult = true;
        this.pnotifyService.error();
      }
    );
}

/* registrarAutorizacion(): void {
  const nombreVendedor = this.form.value['nombreVendedor'];
  const estado = this.form.value['estado'];
  const fechaInicial = this.form.value['fechaInicial'];
  const fechaFinal = this.form.value['fechaFinal'];

  const data = {
    id_vendedor: nombreVendedor,
    estado: estado,
    fechaInicial: fechaInicial ? fechaInicial : null,
    fechaFinal: fechaFinal ? fechaFinal : null,
  };
  // Llamada al servicio reporteAgenda
  this.cotacoesService.getAutorizaciones(data).subscribe(
    (response: any) => {
      this.totalItems = response.result.length;
      //console.log('respuesta|132123');
      //console.log(this.totalItems);
      // Realizar las acciones necesarias con la respuesta
    },
    (error: any) => {
      console.error(error);
    }
  );
} */
}
