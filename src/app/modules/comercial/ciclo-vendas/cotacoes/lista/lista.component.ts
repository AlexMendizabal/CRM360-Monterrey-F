import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
  ComponentFactoryResolver,
  ComponentRef,
  ChangeDetectorRef,
} from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { saveAs } from 'file-saver';
//import * as XLSX from 'xlsx';
import * as XLSXStyle from 'xlsx-style';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';

// ngx-bootstrap
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { RouterService } from './../../../../../shared/services/core/router.service';

defineLocale('es', esLocale);

// Services
import { AuthService } from 'src/app/shared/services/core/auth.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { DateService } from 'src/app/shared/services/core/date.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { ComercialCicloVendasCotacoesService } from '../cotacoes.service';
import { ComercialCicloVendasCotacoesListaService } from './lista.service';
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
import { ComercialCicloVendasCotacoesListaModalAlertaOfertaService } from './modal/alerta-oferta/alerta-oferta.service';
import { ComercialCicloVendasCotacoesListaModalAlertaOfertaComponent } from './modal/alerta-oferta/alerta-oferta.component';
import { NotificacionesService } from '../../../../../../app/core/header/notificaciones/notificaciones.service';

// Interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';
import { ICotacao } from './models/cotacao';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { JsonResponse } from 'src/app/models/json-response';
import { IAssociacao } from '../../../cadastros/propostas/associacao-situacoes-proposta/models/associacao-situacoes-proposta';
import { PdfComponent } from './pdf/pdf.component';
import { VistaComponent } from './vista/vista.component';

@Component({
  selector: 'comercial-ciclo-vendas-cotacoes-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
  providers: [DetailPanelService],
})
export class ComercialCicloVendasCotacoesListaComponent
  implements OnInit, OnDestroy
{
  user = this.authService.getCurrentUser();

  @ViewChild('scrollToFilter', {}) scrollToFilter: ElementRef;
  @ViewChild('scrollToDetails', {}) scrollToDetails: ElementRef;

  loaderNavbar: boolean;
  loaderFullScreen = true;

  loaderConsultaLiberacaoSubscription: Subscription;
  loaderDesdobrarPropostaSubscription: Subscription;
  loaderEmailCotacaoSubscription: Subscription;
  loaderHistoricoExclusaoSubscription: Subscription;

  trocarClienteSubscription: Subscription;
  transfereFaturamentoSubscrition: Subscription;
  cotacaoDuplicadaSubscription: Subscription;
  cotacaoDesdobradaSubscription: Subscription;
  trocarEmpresaSubscription: Subscription;

  $activateRoutedSubscription: Subscription;

  situacoes = [
    { id: '', nombre: 'Todos' },
    { id: 1, nombre: 'Borrador' },
    { id: 9, nombre: 'Venta' },
    { id: 13, nombre: 'Cerrado' },
    { id: 14, nombre: 'Abierto' },
  ];
  situacao = [
    {
      cd: '',
      ds: 'Todos',
    },
    {
      cd: '0',
      ds: 'Inactivo',
    },
    {
      cd: '1',
      ds: 'Activo',
    },
  ];

  breadCrumbTree: Array<Breadcrumb> = [];
  spinnerFullScreen: boolean = true;
  subtitles: Array<Subtitles> = [];
  leyendas: any[] = [
    {
      id: 1,
      text: 'Enviado a SAP',
      hex: '#32a852',
    },
    {
      id: 2,
      text: 'Sin envío a SAP',
      hex: '#c40f06',
    },
    {
      id: 3,
      text: 'Pendiente de aprobación',
      hex: '#e8c515',
    },
  ];

  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
  };

  activatedRouteSubscription: Subscription;
  showDetailPanelSubscription: Subscription;
  showDetailPanel = false;

  detailPanelTitle: string;

  bsConfig: Partial<BsDatepickerConfig>;

  form: FormGroup;
  orderBy = null;
  orderType = null;
  noResult = false;
  nrCliente: number;

  pedidoTransferido: number;
  imprimirSeparacao: number;
  empresas: Array<any> = [];
  depositos: Array<any> = [];
  filteredDepositos: Array<any> = [];
  situacoesCores: Array<IAssociacao> = [];
  vendedores: Array<any> = [];
  totalMateriales: Array<any> = [];

  resultFromParent: any;
  result: [];
  clientes: [];
  analiticos: any[];
  arrayOfertas: any[];

  items: Array<any> = [];
  ofer: Array<any> = [];

  dados: Array<any> = [];
  datos: Array<any> = [];

  cotizacion: Array<any> = [];
  dadosLoaded = false;
  dadosEmpty = false;

  detalhes: any = {
    dataFaturamento: Date,
    contatos: [],
    itens: {
      materiais: [],
      total: {},
    },
  };

  reg = [
    {
      cd: 10,
      ds: '10',
    },
    {
      cd: 25,
      ds: '25',
    },
    {
      cd: 50,
      ds: '50',
    },
    {
      cd: 100,
      ds: '100',
    },
    {
      cd: 200,
      ds: '200',
    },
    {
      cd: 300,
      ds: '300',
    },
  ];

  modalRef: BsModalRef;
  modalRef2: BsModalRef;
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
  itemsPerPageModal = 25;
  registros: number = 10;

  /* Paginação */
  itemsPerPage: number = this.registros;
  totalItems: number;
  currentPage: number = 1;
  begin: number = 0;
  end: number = this.itemsPerPage;

  swOfertaVencida: boolean = false;

  imprimirPdf: boolean = false;
  pdfBase64: any;

  detalhesCodCliente: any;

  filtroCotacoes: boolean;
  tipoEntregaSeleccionado: boolean = false;
  disableButton: boolean;

  selectedVendedor: any;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private localeService: BsLocaleService,
    private formBuilder: FormBuilder,
    private routerService: RouterService,
    private authService: AuthService,
    private pnotifyService: PNotifyService,
    private dateService: DateService,
    private titleService: TitleService,
    private atividadesService: AtividadesService,
    private cotacoesService: ComercialCicloVendasCotacoesService,
    private listaService: ComercialCicloVendasCotacoesListaService,
    private vendedoresService: ComercialVendedoresService,
    private detailPanelService: DetailPanelService,
    private historicoComercialService: ComercialCicloVendasCotacoesListaModalHistoricoComercialService,
    private historicoExclusaoService: ComercialCicloVendasCotacoesListaModalHistoricoExclusaoService,
    private consultaLiberacaoService: ComercialCicloVendasCotacoesListaModalConsultaLiberacaoService,
    private trocarClienteService: ComercialCicloVendasCotacoesListaModalTrocarClienteService,
    private transfereFaturamentoService: ComercialCicloVendasCotacoesListaModalTransfereFaturamentoService,
    private duplicarPropostaService: ComercialCicloVendasCotacoesListaModalDuplicarPropostaService,
    private desdobrarPropostaService: ComercialCicloVendasCotacoesListaModalDesdobrarPropostaService,
    private trocarEmpresaService: ComercialCicloVendasCotacoesListaModalTrocarEmpresaService,
    private emailCotacaoService: ComercialCicloVendasCotacoesListaModalEmailCotacaoService,
    private alertaOfertaService: ComercialCicloVendasCotacoesListaModalAlertaOfertaService,
    private modalService: BsModalService,
    private resolver: ComponentFactoryResolver,
    private cdr: ChangeDetectorRef,
    private notificacionesService: NotificacionesService // private pdfService: PdfService
  ) {
    this.localeService.use('es');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );
    this.pnotifyService.getPNotify();

    this.form = this.formBuilder.group({
      tipoData: [null],
      dataInicial1: [null],
      dataInicial2: [null],
      nrPedido: [null],
      codigo_oferta: [null],
      codEmpresa: [null],
      codEmpresaAdd: [null],
      codDeposito: [null],
      status: [null],
      cliente: [null],
      codVendedor: [null],
      registros: this.itemsPerPage,
      pagina: this.currentPage,
      orderBy: this.orderBy,
      orderType: this.orderType,
    });
  }

  ngOnInit(): void {
    this.registrarAcesso();
    this.setBreadCrumb();
    this.checkUserProfile();
    this.setLoaderEvents();
    this.setChangeEvents();
    this.getFilterValues();
    this.titleService.setTitle('Ofertas');
    /*  this.onDetailPanelEmitter(); */ /* 
    this.detalhesCodCliente = this.activatedRoute.snapshot.queryParams['codCliente']; */
    this.getActiveRoute();
    this.getVendedores();
    /*  */
    this.verificarOfertaNotificacion();
    this.onSubscription();
    /* this.result = this.resultFromParent; */
    /*this.analiticos = this.resultFromParent.analitico; */
  }

  ngOnDestroy(): void {
    this.$activateRoutedSubscription.unsubscribe();
    this.showDetailPanelSubscription.unsubscribe();
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  seleccionVendedor() {
    const perfil = this.activatedRoute.snapshot.data.profile.result;
    if (perfil.coordenador === false && this.vendedores.length > 0) {
      this.form.controls.codVendedor.setValue(this.vendedores[0].ID);
      this.verificarOfertas();
    }
  }

  async exportarExcel(): Promise<void> {
    /* alert('click'); */
    const headers = [
      '',
      'Código SAP',
      'Fecha Creación',
      'Fecha Validez',
      'Cliente',
      'Vendedor',
      'Modo de entrega',
      'Monto total USD.',
      'Monto total Bs.',
      'Tipo de cambio',
      'Descuento total',
      'Autorización solicitada',
      'Estado autorizacion',
      'Autorizador',
      'Situación',
      'Estado oferta',
    ];
    const data = this.dados.map((oferta) => [
      '', // Columna A vacía
      oferta.codigo_oferta,
      oferta.fecha_inicial,
      oferta.fecha_final,
      oferta.prim_nome,
      oferta.nombre,
      oferta.nombre_modo_entrega,
      oferta.monto_total,
      (oferta.monto_total * 6.96).toFixed(2),
      '6.96',
      oferta.descuento_total,
      oferta.id_autorizacion > 0 ? 'SI' : 'NO',
      oferta.id_estado_autorizacion === 12
        ? 'AUTORIZADO'
        : oferta.id_estado_autorizacion === 11
        ? 'RECHAZADO'
        : oferta.id_estado_autorizacion === 10? 'PENDIENTE': '',
      oferta.nombre_usuario,
      oferta.tipo_estado === 14 ? 'Abierto' : 'Cerrado',
      oferta.descripcion,
    ]);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('data');

    worksheet.addRow(headers);
    data.forEach((row, rowIndex) => {
      const formattedDate1 = formatDate(row[2]);
      row[2] = formattedDate1;
      const formattedDate2 = formatDate(row[3]);
      row[3] = formattedDate2;
      worksheet.addRow(row);
    });

    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
      if (rowNumber === 1) {
        row.font = { bold: true };
      }
    });

    for (let i = 2; i <= headers.length; i++) {
      const column = worksheet.getColumn(i);
      column.width = 20;
    }

    worksheet.getColumn('D').width = 25;

    function formatDate(date: string): string {
      const currentDate = new Date(date);
      const day = currentDate.getDate();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      return `${day}-${month}-${year}`;
    }

    const currentDate = new Date().toISOString().split('T')[0]; 
    const fileName = `${currentDate}_reporte_ofertas.xlsx`;
    const buffer = await workbook.xlsx.writeBuffer();
    const excelBlob: Blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(excelBlob, fileName);
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
          descricao: 'Ciclo de Ventas',
          routerLink: `/comercial/ciclo-vendas/${id}`,
        },
        {
          descricao: 'Ofertas',
        },
      ];
    });
  }

  resetImprimir(reset: boolean) {
    this.imprimirPdf = false;
  }

  getPdfBase64(data: any) {
    this.emailCotacaoService.showModal(
      this.activeCotacao.codCliente,
      data,
      this.activeCotacao.nrPedido
    );
  }

  verificarOfertaNotificacion() {
    const params = {
      codVendedor: this.form.get('codVendedor').value,
    };
    this.notificacionesService
      .verificarOferta(params)
      .pipe(
        finalize(() => {
          /* this.loaderNavbar = false; */
        })
      )
      .subscribe((response: JsonResponse) => {
        if (response.responseCode == 200) {
          //this.getNotificaciones();
        }
      });
  }

  /* getNotificaciones() {
    this.notificacionesService
      .getNotificaciones()
      .pipe(
        finalize(() => {
          /*  this.loaderNavbar = false;
         this.submittingForm = false; */
  /*  })
      )
      .subscribe(
        (response: any) => {
          if (response.responseCode === 200) {
          }
        },
        (error: any) => {
          //this.pnotifyService.notice('Ocurrio un error.');
        }
      );
  } */

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

    this.trocarEmpresaSubscription = this.listaService.empresaCotacao.subscribe(
      (data: [number, number, number]) => {
        if (data.length > 0) {
          this.onChangeEmpresaCotacao(data);
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

  onSubscription() {
    this.showDetailPanelSubscription = this.detailPanelService.config.subscribe(
      (event: any) => {
        this.showDetailPanel = event.showing;
      }
    );
  }

  /* onDetailPanelEmitter(): void {
    this.showDetailPanelSubscription = this.detailPanelService.config.subscribe(
      (event: any) => {
        this.showDetailPanel = event.showing;

        if (this.showDetailPanel === false) {
          this.onCloseDetailPanel();
        }
      }
    );
  } */

  checkUserProfile(): void {
    const profile = this.activatedRoute.snapshot.data.profile.result;
    /*     console.log(profile);
     */
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

  navegarHistorico() {
    this.router
      .navigate([], {
        relativeTo: this.activatedRoute,
      })
      .then((result) => {
        window.open(
          `/#/comercial/clientes/historico-financeiro/${this.nrCliente}/resumo`,
          '_blank'
        );
      });
  }

  navegarDashboard() {
    this.router
      .navigate([], {
        relativeTo: this.activatedRoute,
      })
      .then((result) => {
        window.open(
          `/#/comercial/clientes/dashboard/${this.nrCliente}`,
          '_blank'
        );
      });
  }

  navegarEstoque() {
    this.router
      .navigate([], {
        relativeTo: this.activatedRoute,
      })
      .then((result) => {
        window.open(`/#/comercial/estoque`, '_blank');
      });
  }

  getVendedores(): void {
    this.vendedoresService.getVendedores().subscribe((response: any) => {
      if (response.responseCode === 200) {
        this.vendedores = response.data;
        this.seleccionVendedor();
      }
    });
  }

  getVinculoOperadores(): void {
    this.vendedoresService.getVinculoOperadores().subscribe((response: any) => {
      if (response.responseCode === 200) {
        this.vendedores = response.result;
        /*  this.form.controls.codVendedor.setValue(parseInt(null)); */
        /*  this.form.controls.codVendedor.updateValueAndValidity(); */
      }
    });
  }

  getFilterValues(): void {
    this.listaService
      .loadDependencies()
      .pipe(
        finalize(() => {
          this.populaDadosResolver();
          this.setSubtitles();
          this.loaderFullScreen = false;
        })
      )
      .subscribe(
        (response: any | JsonResponse[]) => {
          this.situacoes = [
            {
              id: '',
              nombre: 'Todos',
            },
            {
              id: 13,
              nombre: 'Cerrado',
            },
            {
              id: 14,
              nombre: 'Abierto',
            },
          ];
          this.empresas = response[1].result || [];
          this.depositos = response[2].result || [];
          this.filteredDepositos = this.depositos;
        },
        (error: any) => {
          this.pnotifyService.error('Ocorreu um erro ao carregar filtros.');
          this.location.back();
        }
      );
  }

  setSubtitles(): void {
    if (this.situacoesCores.length > 0) {
      this.dados.forEach((oferta) => {
        const situacao = oferta.id_oferta_estado;
        this.situacoesCores.map((situacao) => {
          this.leyendas = [
            {
              id: 1,
              text: 'Enviado a SAP',
              /* hex: '#32a852', */
            },
            {
              id: 2,
              text: 'Sin envio a SAP',
              /* hex: '#c40f06', */
            },
            {
              id: 3,
              text: 'Pendiente de aprobación',
              /* hex: '#e8c515', */
            },
          ];
        });

        /*  this.subtitles.push({
           id: situacao.codAssociacao,
           text: situacao.descLegenda,
           hex: situacao.cor,
         }); */
      });
    }
  }

  /* setFormFilter(): void {
    const formValue: any = this.checkRouterParams();
   
    this.form = this.formBuilder.group({
      tipoData: [formValue.tipoData],
      dataInicial1: [formValue.dataInicial1],
      dataInicial2: [formValue.dataInicial2],
      nrPedido: [formValue.nrPedido],
      codigo_oferta: [formValue.codigo_oferta],
      codEmpresa: [formValue.codEmpresa, [Validators.required]],
      codEmpresaAdd: [formValue.codEmpresa],
      codDeposito: [formValue.codDeposito, [Validators.required]],
      status: [null],
      cliente: [formValue.cliente],
      codVendedor: [formValue.codVendedor, [Validators.required]],
      pagina: [formValue.pagina],
     /*  codSituacao: [this.selectedSituacao], */
  //  registros: 10,
  // statusCliente: ['Ativo'],
  // });

  //this.vendedorValue();

  //    if (!formValue.codEmpresa) {
  //   this.form.get('codDeposito').disable();
  // }
  //} */

  /*  checkRouterParams(): Object {
    let formValue = {
      tipoData: 1,
      dataInicial: this.dateService.getFirstDayMonth(),
      dataFinal: this.dateService.getLastDayMonth(),
      nrPedido: null,
      codEmpresa: null,
      codEmpresaAdd: null,
      codDeposito: null,
      status: 1,
      cliente: null,
      codVendedor: null,
      pagina: 1,
      registros: this.itemsPerPage,
    }; */

  /*  this.activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (queryParams: any) => {
        if (Object.keys(queryParams).length > 0) {
          let params = atob(queryParams.q);
          params = JSON.parse(params);
          this.search(params);

          if (params['pagina']) {
            this.currentPage = params['pagina'];
          }

          Object.keys(formValue).forEach((formKey) => {
            Object.keys(params).forEach((paramKey) => {
              if (
                formKey == paramKey &&
                formValue[formKey] != params[paramKey]
              ) {
                if (formKey === 'dataInicial' || formKey === 'dataFinal') {
                  formValue[formKey] = this.dateService.convertStringToDate(
                    params[paramKey],
                    'es'
                  );
                } else {
                  if (!isNaN(Number(params[paramKey]))) {
                    formValue[formKey] = Number(params[paramKey]);
                  } else {
                    formValue[formKey] = params[paramKey];
                  }
                }
              }
            });
          });

          // Desuscripción dentro del bloque de la suscripción
          this.activatedRouteSubscription.unsubscribe();
        }
      }
    ); */

  // Esto debería estar fuera del bloque de la suscripción
  // this.activatedRouteSubscription.unsubscribe();

  /*   return formValue;
  } */

  vendedorValue(): void {
    const profile = this.activatedRoute.snapshot.data.profile.result;

    if (
      profile.vendedor === true &&
      profile.coordenador === false &&
      profile.gestor === false
    ) {
      /* this.form.controls.codVendedor.setValue(
        parseInt(this.user.info.idVendedor)
      );
      this.form.controls.codVendedor.updateValueAndValidity(); */
    }
  }

  onChangeEmpresa(idEmpresa: number, idDeposito?: number): any {
    if (this.form.get('codDeposito').value) {
      this.form.controls.codDeposito.reset();
    }

    this.filteredDepositos = this.depositos.filter(
      (value: any) => value.idEmpresa == idEmpresa
    );

    if (this.filteredDepositos.length === 1 && idDeposito) {
      this.form.controls.codDeposito.setValue(idDeposito);
      this.form.get('codDeposito').enable();
      return;
    }

    if (this.filteredDepositos.length > 0) {
      this.form.controls.codDeposito.setValue(
        this.filteredDepositos[0]['idDeposito']
      );
      this.form.get('codDeposito').enable();
    } else {
      this.form.get('codDeposito').reset();
      this.form.get('codDeposito').disable();
      this.pnotifyService.notice(
        'Empresa não possui depósito válido vinculado.'
      );
    }
  }

  onChangeDeposito(deposito: number): void {
    this.form.controls.codDeposito.setValue(deposito);
  }

  setOrderBy(column: string) {
    if (this.orderBy === column) {
      if (this.orderType == 'desc') {
        this.orderType = 'asc';
      } else if (this.orderType == 'asc') {
        this.orderType = 'desc';
      }
    } else {
      this.orderBy = column;
      this.orderType = 'asc';
    }
    this.form.get('orderBy').setValue(this.orderBy);
    this.form.get('orderType').setValue(this.orderType);
    this.onFilter();
  }

  setOrderByModal(column: string) {
    /*     console.log(column);
     */ if (this.orderBy === column) {
      this.orderType = this.orderType === 'asc' ? 'desc' : 'asc'; // Cambiar el tipo de orden si se hace clic nuevamente en la misma columna
    } else {
      this.orderBy = column;
      this.orderType = 'asc'; // Establecer el orden ascendente por defecto al hacer clic en una nueva columna
    }

    this.items.sort((a, b) => {
      const valueA = a[column]; /* .toUpperCase(); */
      const valueB = b[column]; /* .toUpperCase() */
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

  /*   onFilter(): void {
    this.loaderNavbar = true;
    this.detailPanelService.hide();
  
    if (this.form.value['registros']) {
      this.itemsPerPage = this.form.value['registros'];
      this.end = this.form.value['registros'];
    }
  
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams()),
    })
    .catch(error => {
      console.error('Error during filtering:', error);
    })
    .finally(() => {
      this.loaderNavbar = false;
    });
  } */

  onFilter() {
    // Deshabilita el botón al iniciar la función
    this.disableButton = true;

    this.loaderNavbar = true;
    this.detailPanelService.hide();
    if (this.form.value['registros']) {
      this.itemsPerPage = this.form.value['registros'];
      this.end = this.form.value['registros'];
    }

    this.router
      .navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: this.routerService.setBase64UrlParams(this.getParams()),
      })
      .then(() => {
        // Recarga la página después de la navegación
        window.location.reload();

        // Habilita el botón al finalizar la recarga
        this.disableButton = false;

        // Forzar la detección de cambios manualmente
        this.cdr.detectChanges();
      });
  }

  getActiveRoute() {
    this.spinnerFullScreen = true;
    this.$activateRoutedSubscription =
      this.activatedRoute.queryParams.subscribe((response) => {
        if (Object.keys(response).length > 0) {
          const _response = this.routerService.getBase64UrlParams(response);
          this.form.patchValue(_response);
          /*           console.log(_response);
           */
        }
        this.search(this.getParams());
      });
  }

  getParams() {
    let _params = {};
    let _obj = this.form.value;

    for (let prop in _obj) {
      if (_obj[prop]) {
        if (_obj[prop] instanceof Date)
          _params[prop] = this.dateService
            .convertToBrazilianDate(_obj[prop])
            .substring(0, 10);
        else _params[prop] = _obj[prop];
      }
    }
    return _params;
  }

  /*   setRouterParams(params: any): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { q: btoa(JSON.stringify(params)) },
    });
    
    this.search(this.getParams());
  } */

  /* getFormFilterValues(): Object {
    let params: any = {};

    if (this.form.value.tipoData) {
      params.tipoData = this.form.value.tipoData;
    }

    if (this.form.value.dataInicial1) {
      params.dataInicial1 = this.dateService.convertToUrlDate(
        new Date(this.form.value.dataInicial1)
      );
    }

    if (this.form.value.dataInicial2) {
      params.dataInicial2 = this.dateService.convertToUrlDate(
        new Date(this.form.value.dataInicial2)
      );
    }

    if (this.form.value.dataInicial) {
      params.dataInicial = this.dateService.convertToUrlDate(
        new Date(this.form.value.dataInicial)
      );
    }

    if (this.form.value.dataFinal) {
      params.dataFinal = this.dateService.convertToUrlDate(
        new Date(this.form.value.dataFinal)
      );
    }

    if (this.form.value.codigo_oferta) {
      params.codigo_oferta = this.form.value.codigo_oferta;
    }
    if (this.form.value.nrPedido) {
      params.id_oferta = this.form.value.nrPedido;
    }

    if (this.form.value.codEmpresa) {
      params.codEmpresa = this.form.value.codEmpresa;
    }

    if (this.form.value.codDeposito) {
      params.codDeposito = this.form.value.codDeposito;
    }

    if (this.form.value.cliente) {
      params.cliente = this.form.value.cliente.id_cliente;
    }

    if (this.form.value.codVendedor) {
      params.codVendedor = this.form.value.codVendedor.ID;
    }

    if (this.form.value.pagina) {
      params.pagina = this.form.value.pagina;
    }

    if (this.form.value.registros) {
      params.registros = this.form.value.registros;
    }

    if (this.form.value.statusCliente && this.filtroCotacoes) {
      params.statusCliente = this.form.value.statusCliente;
    }

    params.orderBy = this.orderBy;
    params.orderType = this.orderType;
    return params;
  } */

  populaDadosResolver() {
    if (this.activatedRoute.snapshot.url.length > 1) {
      const resolver = this.activatedRoute.snapshot.data.data;
      if (resolver.success === true) {
        this.dados.push(resolver.data[0]);
        this.form.controls.nrPedido.setValue(resolver.data[0].nrPedido);
        this.form.controls.codEmpresa.setValue(resolver.data[0].codEmpresa);
        this.filteredDepositos = this.depositos.filter(
          (value: any) => value.idEmpresa == resolver.data[0].codEmpresa
        );

        if (this.filteredDepositos.length === 1) {
          this.form.controls.codDeposito.setValue(
            this.filteredDepositos[0]['idDeposito']
          );
        }
      }
    }
  }

  search(params: any): void {
    this.loaderNavbar = true;
    this.dadosLoaded = true;
    this.dadosEmpty = false;

    /*     console.log(params);
     */
    this.cotacoesService
      .getOfertas(params)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.responseCode === 200) {
            this.loaderNavbar = false;
            this.dadosLoaded = false;
            this.spinnerFullScreen = false;
            this.noResult = true;
            this.dados = response.result;
            this.clientes = response.clientes;
            this.totalItems = this.dados.length;
          } else {
            this.loaderNavbar = false;
            this.pnotifyService.notice('Ningún registro encontrado');
            this.dadosEmpty = false;
            return;
          }
        },
        error: (error) => this.pnotifyService.error(),
      });
  }

  agregarCliente(id: number, nombre: string) {
    interface Cliente {
      id: number;
      nombre: string;
    }
    const clientesUnicos: Cliente[] = [];
    // Verificar si el cliente ya existe en la matriz
    const clienteExistente = clientesUnicos.find(
      (cliente) => cliente.id === id || cliente.nombre === nombre
    );

    if (!clienteExistente) {
      // Agregar el cliente si no existe
      clientesUnicos.push({ id, nombre });
    }
  }

  /*  onReset() {
    this.form.reset();
    this.form.patchValue({
      tipoData: 1,
      dataInicial: this.dateService.getFirstDayMonth(),
      dataFinal: this.dateService.getLastDayMonth(),
      nrPedido: null,
      codEmpresa: null,
      codDeposito: null,
      status: 0,
      cliente: null,
      codVendedor: null,
      pagina:  this.currentPage,
      registros: 10,
      statusCliente: 'Ativo',
    });
  }
 */

  onPageChanged(event: PageChangedEvent): void {
    this.begin = (event.page - 1) * event.itemsPerPage;
    this.end = event.page * event.itemsPerPage;
  }

  /*  getPaginateData(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.dados.slice(startIndex, endIndex);
  }

  onPageChangedModal(event: PageChangedEvent): void {
    this.currentPageModal = event.page;
    this.getPaginateDataModal();
  }

  getPaginateDataModal(): any[] {
    const startIndex = (this.currentPageModal - 1) * this.itemsPerPageModal;
    const endIndex = startIndex + this.itemsPerPageModal;
    return this.items.slice(startIndex, endIndex);
  } */

  styleStatusBorder(cotacao: ICotacao): object {
    if (cotacao.cor) {
      return {
        'border-color': cotacao.cor,
      };
    }
    return {};
  }

  viewRegister(index: number, cotacao: ICotacao): void {
    this.loaderNavbar = true;
    /*  this.codSituacao = cotacao.codSituacao; */
    this.pedidoTransferido = cotacao.pedidoTransferido;
    this.imprimirSeparacao = cotacao.imprimirSeparacao;

    this.nrCliente = cotacao.codCliente;

    this.detailPanelService.show();
    this.detailPanelTitle = `#${
      cotacao.nrPedido
    } / ${cotacao.razaoSocial.toUpperCase()}`;
    this.showDetailPanel = true;

    this.setActiveRow(index);
    this.setActiveCotacao(cotacao);
    /*  this.resetRegister(); */

    this.cotacoesService
      .getDetalhesCotacoes(
        this.activeCotacao.codEmpresa,
        this.activeCotacao.nrPedido
      )
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
          this.contatosLoaded = true;
          this.itensLoaded = true;

          this.scrollToDetails.nativeElement.scrollIntoView({
            behavior: 'instant',
          });
        })
      )
      .subscribe(
        (response: any) => {
          if (response.hasOwnProperty('success') && response.success === true) {
            this.dados.forEach((element) => {
              if (
                element.nrPedido == response.data.itens.materiais[0].nrPedido
              ) {
                this.detalhes.dataFaturamento = element.dataFaturamento;
              }
            });

            this.detailPanelService.loadedFinished(false);

            if (response.data.contatos.length > 0) {
              this.detalhes.contatos = response.data.contatos;
              this.viewContato(this.detalhes.contatos[0]);
            } else {
              this.contatosEmpty = true;
            }

            if (response.data.itens.materiais.length > 0) {
              this.detalhes.itens = response.data.itens;
            } else {
              this.itensEmpty = true;
            }
          } else {
            this.contatosEmpty = true;
            this.itensEmpty = true;

            this.detailPanelService.loadedFinished(true);
            this.pnotifyService.error();
          }
        },
        (error: any) => {
          this.detailPanelService.loadedFinished(true);

          if (error.error.hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
      );
  }

  estoqueSuspensoClassStatusBorder(suspenso: number) {
    let borderClass = '';
    if (suspenso == 0) {
      borderClass = 'border-primary';
    } else if (suspenso == 1) {
      borderClass = 'border-success';
    } else if (suspenso == 2) {
      borderClass = 'border-danger';
    }
    return borderClass;
  }

  /*   resetRegister(): void {
    this.detalhes.contatos = [];
    this.detalhes.itens = {
      materiais: [],
      total: {},
    };

    this.contatosLoaded = false;
    this.contatosEmpty = false;

    this.itensLoaded = false;
    this.itensEmpty = false;
  } */

  viewContato(contato: any): void {
    this.contatoSelected = contato;
  }

  onCloseDetailPanel(): void {
    this.resetActiveCotacao();
    this.resetActiveRow();
    /* this.resetRegister(); */
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
    if (
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
    if (
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
    if (
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

    /*  this.form.controls.nrPedido.setValue(nrProposta);
    this.form.controls.codEmpresa.setValue(cotacao.codEmpresa);
    this.form.controls.codVendedor.setValue(codVendedor); */
    this.onFilter();
  }

  onDesdobrarProposta(): void {
    if (
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

  onHistoricoComercial(): void {
    if (
      this.activeCotacao.codCliente &&
      this.activeCotacao.codCliente !== null
    ) {
      this.historicoComercialService.showModal(this.activeCotacao.codCliente);
    }
  }

  onHistoricoExclusao(): void {
    const params = this.activeCotacao;
    if (
      this.activeCotacao.codCliente &&
      this.activeCotacao.codCliente !== null
    ) {
      this.historicoExclusaoService.showModal(
        this.setParamsHistoricoExclusao(params)
      );
    }
  }

  setParamsHistoricoExclusao(params): Object {
    let _params: any = {};

    _params.nrPedido = this.activeCotacao.nrPedido;
    _params.codEmpresa = this.activeCotacao.codEmpresa;

    return _params;
  }

  onConsultarLiberacao(): void {
    const params = this.activeCotacao;
    if (this.activeCotacao.nrPedido && this.activeCotacao.nrPedido !== null) {
      this.consultaLiberacaoService.showModal(
        this.setParamsConsultarLiberacao(params)
      );
    }
  }

  setParamsConsultarLiberacao(params): Object {
    let _params: any = {};

    _params.nrPedido = params.nrPedido;
    _params.codEmpresa = params.codEmpresa;

    return _params;
  }

  onTrocarEmpresa(): void {
    if (
      this.activeCotacao.codCliente &&
      this.activeCotacao.codCliente !== null
    ) {
      this.trocarEmpresaService.showModal(
        this.empresas,
        this.depositos,
        this.activeCotacao
      );
    }
  }

  onChangeEmpresaCotacao(data: [number, number, number]): void {
    const selectedEmpresa = data[0];
    const selectedDeposito = data[1];
    const nrProposta = data[2];

    this.form?.controls?.nrPedido?.setValue(nrProposta);
    this.form?.controls?.codEmpresa?.setValue(selectedEmpresa);
    this.onChangeEmpresa(selectedEmpresa, selectedDeposito);

    this.onFilter();
  }
  onVista(id_oferta: number): void {
    //this.router.navigate([]).then(result => {  window.open("/comercial/ciclo-vendas/23/cotacoes-pedidos/lista/vista", '_blank'); });

    var params = {
      id_oferta: id_oferta,
    };
    /*     console.log('parametros', params);
     */ this.loaderNavbar = true;
    this.cotacoesService
      .getDetalleOferta(params)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe(
        (response: JsonResponse) => {
          if (response.estado === true) {
            this.modalRef2 = this.modalService.show(VistaComponent, {
              initialState: { resultFromParent: response.result },
            });

            this.modalRef2.content.onClose.subscribe((result) => {
              /*               console.log('Modal closed with result:', result);
               */
            });
          } else {
            this.pnotifyService.error();
          }
        },
        (error: any) => {
          if (error.error.hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
      );
    /*     console.log(params);
     */
  }

  onImprimir(nmpedido: number): void {
    this.loaderNavbar = true;
    this.cotacoesService
      .getImprimirCotacao(nmpedido)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe(
        (response: JsonResponse) => {
          /*           console.log(response);
           */ if (
            response.hasOwnProperty('success') &&
            response.success === true
          ) {
            this.modalRef = this.modalService.show(PdfComponent, {
              initialState: { dataFromParent: response.data },
            });

            this.modalRef.content.onClose.subscribe((result) => {
              /*               console.log('Modal closed with result:', result);
               */
            });
          } else {
            this.pnotifyService.error();
          }
        },
        (error: any) => {
          if (error.error.hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
      );
  }

  onEmailCotacao(): void {
    if (
      this.activeCotacao.codCliente &&
      this.activeCotacao.codCliente !== null
    ) {
      this.imprimirPdf = true;
    }
  }

  openModal(template: TemplateRef<any>, id_oferta: number) {
    /* alert('sdsa'); */
    var params = {
      id_oferta: id_oferta,
    };
    this.loadingModal = true;
    this.cotacoesService.getDetalleOferta(params).subscribe({
      next: (response: any) => {
        if (response.responseCode === 200) {
          this.ofer = response.result.oferta[0];
          this.items = response.result.analitico;
          this.totalMateriales = response.result.total;
          this.totalModal = this.items.length;
        } else {
          this.loaderNavbar = false;
          this.pnotifyService.notice('Ningún registro encontrado');
          this.dadosEmpty = true;
        }
      },
    });
    this.form.controls.codEmpresaAdd.setValidators([Validators.required]);
    this.form.controls.codEmpresaAdd.updateValueAndValidity();
    this.modalRef = this.modalService.show(template, {
      animated: false,
      class: 'modal-xl',
    });
  }

  verificarOfertas() {
    const params = {
      codVendedor: this.form.get('codVendedor').value,
    };
    this.cotacoesService
      .verificarOfertas(params)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe((response: JsonResponse) => {
        if (response.pendiente === true) {
          this.swOfertaVencida = true;
          this.arrayOfertas = response.ofertas;
          this.openModalAd(this.arrayOfertas);
        } else {
          this.swOfertaVencida = false;
        }
      });
  }

  openModalAd(arrayOfertas: any[]) {
    const initialState = {
      ofertasPendientes: arrayOfertas,
    };

    this.modalRef = this.modalService.show(
      ComercialCicloVendasCotacoesListaModalAlertaOfertaComponent,
      {
        initialState,
        animated: true,
        class: 'modal-sm',
      }
    );
  }

  hideModal() {
    this.modalRef.hide();
    this.form.controls.codEmpresaAdd.reset();
    this.form.controls.codEmpresaAdd.clearValidators();
    this.form.controls.codEmpresaAdd.updateValueAndValidity();
  }

  nuevo() {
    this.router.navigate(['../novo', 1], {
      queryParams: { codCliente: this.detalhesCodCliente },
      relativeTo: this.activatedRoute,
    });
  }

  onAdd(): void {
    /* alert('click'); */
    let empresa = this.form.get('codEmpresaAdd').value;
    if (!empresa) {
      this.form.controls.codEmpresa.markAsTouched();
      this.pnotifyService.notice('Informe uma empresa');
      return;
    }
    this.loaderNavbar = true;

    this.cotacoesService
      .getReservarIdCotacao({ codEmpresa: empresa })
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe((response: JsonResponse) => {
        if (response.hasOwnProperty('success') && response.success === true) {
          this.modalRef.hide();
          if (this.detalhesCodCliente != null) {
            this.router.navigate(
              [
                '../novo',
                response.data.nrProposta,
                this.form.value.codEmpresaAdd,
              ],
              {
                queryParams: { codCliente: this.detalhesCodCliente },
                relativeTo: this.activatedRoute,
              }
            );
          } else {
            this.router.navigate(
              [
                '../novo',
                response.data.nrProposta,
                this.form.value.codEmpresaAdd,
              ],
              {
                relativeTo: this.activatedRoute,
              }
            );
          }
        } else {
          this.modalRef.hide();
          this.pnotifyService.error();
        }
      });
  }

  onView(): void {
    /* this.loaderNavbar = true; */

    let empresa = this.activeCotacao.codEmpresa;

    this.router.navigate(
      ['../visualizar', this.activeCotacao.nrPedido, empresa],
      {
        relativeTo: this.activatedRoute,
      }
    );
  }
  onEdit(item) {
     this.router.navigate(['./', item], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(item),
    });
  }

  onEdit2(pedido): void {
    // this.loaderNavbar = true;
    let empresa = 1;
    const idSubModulo = this.activatedRoute.snapshot.params.idSubModulo;
    this.router.navigate([`/comercial/ciclo-vendas/${idSubModulo}/cotacoes-pedidos/editar/${pedido}/${empresa}`,]);
    
  }

  transformNumberToCEP(valor: any): string {
    const resto = 8 - String(valor).length;
    valor = '0'.repeat(resto > 0 ? resto : 0) + valor;

    valor = valor.toString();

    let cep = valor.replace(/(\d{5})(\d{3})/g, '$1-$2');
    return cep;
  }

  onFieldError(field: string) {
    if (this.onFieldInvalid(field)) {
      return 'is-invalid';
    }
    return '';
  }

  onFieldInvalid(field: any) {
    field = this.form.get(field);
    return field.status == 'INVALID' && field.touched;
  }

  /*  onFieldRequired(
    abstractControl: AbstractControl,
    abstractControlField?: string
  ): string {
    if (abstractControl.validator) {
      const validator = abstractControl.validator({} as AbstractControl);
      if (validator && validator.required) {
        return 'is-required';
      }
    }

    if (abstractControlField) {
      for (const controlName in abstractControl['controls']) {
        if (abstractControl['controls'][controlName]) {
          if (
            this.onFieldRequired(abstractControl['controls'][controlName]) &&
            controlName == abstractControlField
          ) {
            return 'is-required';
          }
        }
      }
    }

    return '';
  } */
  onFieldRequired(field: string) {
    let required = false;
    let formControl = new FormControl();

    if (this.form.controls[field].validator) {
      let validationResult = this.form.controls[field].validator(formControl);
      required =
        validationResult !== null && validationResult.required === true;
    }

    if (required) {
      return 'is-required';
    }
  }

  onEnviarSap(nmpedido: number): void {
    this.loaderNavbar = true;
    this.cotacoesService
      .getenviarsap(nmpedido)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe(
        (response: JsonResponse) => {
          // console.log('Respuesta del servidor:', response);

          if (response.data_sap.CodigoRespuesta === 200) {
            this.pnotifyService.success('Se envió SAP');
            return;
          } else {
            console.error('Error al enviar SAP. Detalles:', response.data_sap);
            this.pnotifyService.error(response.data_sap.Mensaje);
          }
        },
        (error: any) => {
          // console.error('Error en la solicitud:', error);

          if (error.error.hasOwnProperty('Mensaje')) {
            console.error('Mensaje de error:', error.error.Mensaje);
            this.pnotifyService.error(error.error.Mensaje);
          } else {
            this.pnotifyService.error();
          }
        }
      );
  }

  onEstadoOferta(codigo_oferta): void {
    this.loaderNavbar = true;
    /*   const verificadorElement = document.getElementById('verificador');
    verificadorElement.classList.replace('fas fa-sync-alt', 'far fa-sync-alt fa-spin'); */
    this.cotacoesService
      .postverifica_oferta(codigo_oferta)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe(
        (response: JsonResponse) => {
          console.log('Resputs', response);
          if (response.CodigoRespuesta === 200) {
            this.pnotifyService.success(response.message);
            /*    verificadorElement.classList.replace('far fa-sync-alt fa-spin', 'fas fa-sync-alt'); */
            this.loaderNavbar = false;
            return;
          } else {
            this.pnotifyService.error(response.message);
          }
        },
        (error: any) => {
          if (error.error.hasOwnProperty('Mensaje')) {
            console.error('Mensaje de error:', error.error.Mensaje);
            this.pnotifyService.error(error.error.Mensaje);
          } else {
            this.pnotifyService.error();
          }
        }
      );
  }
}
