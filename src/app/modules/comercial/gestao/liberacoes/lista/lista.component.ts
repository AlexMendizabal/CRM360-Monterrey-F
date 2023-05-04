import { object, string } from '@amcharts/amcharts4/core';
import { IContato } from './../../../../servicos/contatos/models/contato';
import { ContatoService } from './../../../../servicos/contatos/services/contato.service';
//angular
import {
  Component,
  OnInit,
  OnDestroy,
  TemplateRef,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Location } from '@angular/common';

//servicos
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ConfirmModalService } from './../../../../../shared/modules/confirm-modal/confirm-modal.service';
import { DetailPanelService } from './../../../../../shared/templates/detail-panel/detal-panel.service';
import { ComercialGestaoLiberacoesService } from '../services/liberacoes.service';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { XlsxService } from 'src/app/shared/modules/xlsx/xlsx.service';
import { DateService } from 'src/app/shared/services/core/date.service';
import { ComercialCicloVendasCotacoesFormularioService } from '../../../ciclo-vendas/cotacoes/formulario/formulario.service';
import { ComercialCicloVendasCotacoesService } from '../../../ciclo-vendas/cotacoes/cotacoes.service';
import { ComercialVendedoresService } from '../../../services/vendedores.service';
import { EscritoriosService } from 'src/app/shared/services/requests/escritorios.service';
import { ComercialClientesService } from '../../../services/clientes.service';

// rxjs
import { finalize, take, switchMap } from 'rxjs/operators';
import { Subscription, EMPTY } from 'rxjs';

//modelos
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { CustomTableConfig } from './../../../../../shared/templates/custom-table/models/config';
import { JsonResponse } from 'src/app/models/json-response';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { ptBrLocale } from 'ngx-bootstrap/locale';

defineLocale('pt-br', ptBrLocale);

//Interfaces
import { IComercialGestaoLiberacoes } from './../models/liberacoes';
import { IPermissoesAcessoModel } from '../../../ciclo-vendas/cotacoes/formulario/models/permissoes-acesso';
import { isValid } from 'date-fns';
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';

@Component({
  selector: 'comercial-gestao-liberacoes-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComercialGestaoLiberacoesListaComponent
  implements OnInit, OnDestroy
{
  permissoesAcesso: IPermissoesAcessoModel = {
    acessoClientes: false,
    historicoExclusao: false,
    duplicataCarteira: false,
  };

  @ViewChild('scrollToFilter', {}) scrollToFilter: ElementRef;

  breadCrumbTree: Array<Breadcrumb>;
  idSubModulo: number;

  modalRef: BsModalRef;
  form: FormGroup;
  formModal: FormGroup;
  showDetailPanelSubscription: Subscription;
  showDetailPanel = false;
  $activatedRouteSubscription: Subscription;
  bsConfig: Partial<BsDatepickerConfig>;
  orderBy = 'nrPedido';
  orderType = 'ASC';
  activatedRouteSubscription: Subscription;

  //LOADINGS

  loadingDetails = false;
  loaderNavbar = false;
  loadingModal = false;
  loaderFullScreen = false;

  //VARIAVEIS

  codClienteSubscription: Subscription;
  codClientErrors = false;
  isCarteiraClientesLoaded: boolean;

  empresas: Array<any> = [];
  clientes: Array<any> = [];
  linhas: Array<any> = [];
  vendedores: Array<any> = [];
  vendedoresTotal: Array<any> = [];
  escritorios: Array<any> = [];
  motivos: any;
  comentario: any;

  tipoDataControl: number;

  filteredVendedores: Array<any> = [];

  showPermissionDenied = false;

  totalItens: any = [];

  dadosLoaded = false;
  dadosEmpty = false;
  dadosEmptyDetalhes = false;

  dados: Array<IComercialGestaoLiberacoes>;
  dadosPagination: Array<any> = [];
  solicitacaoSelecionada: any;
  detalhes: any = [];
  profile: any = [];

  contato: IContato[] = [];

  viewHistorico: boolean;
  solicitante: any = [];

  // CUSTOM TABLE
  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
  };

  subtitles: Array<Subtitles> = [
    {
      id: 1,
      text: 'Analisar',
      color: 'blue',
    },
    {
      id: 2,
      text: 'Reprovado',
      color: 'red',
    },
  ];

  /* Pagination */
  itemsPerPage = 100;
  totalItems: number;
  currentPage = 1;
  /* Pagination */

  constructor(
    private router: Router,
    private atividadesService: AtividadesService,
    private pnotify: PNotifyService,
    private localeService: BsLocaleService,
    private activatedRoute: ActivatedRoute,
    private liberacoesService: ComercialGestaoLiberacoesService,
    private formBuilder: FormBuilder,
    private contatosService: ContatoService,
    private titleService: TitleService,
    private formularioService: ComercialCicloVendasCotacoesFormularioService,
    private location: Location,
    private cotacoesService: ComercialCicloVendasCotacoesService,
    private vendedoresService: ComercialVendedoresService,
    private escritoriosService: EscritoriosService,
    private clientesService: ComercialClientesService,
    // private motivosService: LogisticaEntradaMateriaisMotivosService,
    private xlsxService: XlsxService,
    private modalService: BsModalService,
    private confirmModalService: ConfirmModalService,
    private routerService: RouterService,
    private dateService: DateService,
    private detailPanelService: DetailPanelService,
    private pnotifyService: PNotifyService
  ) {
    this.pnotifyService.getPNotify();
    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );
  }

  ngOnInit() {
    this.registrarAcesso();
    this.setBreadCrumb();
    this.getFilterValues();
    this.setFormFilter();
    //this.setFormBuilder();
    this.getPerfil();
    this.titleService.setTitle('Liberações Comerciais');
    this.onDetailPanelEmitter();
    this.setSolicitacaoSelecionada();
    this.loadingFilterValues();
  }

  ngOnDestroy() {
    this.showDetailPanelSubscription.unsubscribe();
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  setBreadCrumb(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: `/comercial/home`,
        },
        {
          descricao: 'Gestão',
          routerLink: `/comercial/gestao/${params['idSubModulo']}`,
        },
        {
          descricao: 'Liberações Comerciais',
        },
      ];
    });
  }

  onDetailPanelEmitter(): void {
    this.showDetailPanelSubscription = this.detailPanelService.config.subscribe(
      (event: any) => {
        this.showDetailPanel = event.showing;
      }
    );
  }

  setFormFilter() {
    const formValue: any = this.checkRouterParams();

    this.form = this.formBuilder.group({
      idAprovacao: [formValue.idAprovacao],
      tipoData: [formValue.tipoData, [Validators.required]],
      dtInicial: [
        formValue.dtInicial
          ? formValue.dtInicial
          : this.dateService.getFirstDayMonth(),
        [Validators.required],
      ],
      dtFinal: [
        formValue.dtFinal
          ? formValue.dtFinal
          : this.dateService.getLastDayMonth(),
        [Validators.required],
      ],
      numPedido: [formValue.numPedido],
      nomeSolicitante: [formValue.nomeSolicitante],
      gerenciaSolicitante: [formValue.gerenciaSolicitante],
      empresa: [formValue.empresa, [Validators.required]],
      codSituacao: [formValue.codSituacao],
      cliente: [formValue.cliente],
      linhaPredominante: [formValue.linhaPredominante],
      descObs: [formValue.descObs],
      excluiPedido: [formValue.excluiPedido],
      pagina: [formValue.pagina],
      registros: [formValue.registros, Validators.required],
      orderBy: this.orderBy,
      orderType: this.orderType,
    });

    this.checkValuesGerente();
    this.checkOrder();
  }

  checkRouterParams(): Object {
    let formValue = {
      idAprovacao: null,
      tipoData: 1,
      dtInicial: this.dateService.getFirstDayMonth(),
      dtFinal: this.dateService.getLastDayMonth(),
      numPedido: null,
      nomeSolicitante: null,
      gerenciaSolicitante: null,
      empresa: null,
      codSituacao: 1,
      cliente: null,
      linhaPredominante: null,
      descObs: null,
      excluiPedido: null,
      orderBy: this.orderBy,
      orderType: this.orderType,
      pagina: 1,
      registros: this.itemsPerPage,
    };

    this.activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
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

  convertDate(date: Date): string {
    let y = date.getFullYear().toString();
    let m = (date.getMonth() + 1).toString().padStart(2, '0');
    let d = date.getDate().toString().padStart(2, '0');

    return `${d}/${m}/${y}`;
  }

  checkOrder(): void {
    if (this.form.value.orderBy !== this.orderBy) {
      this.orderBy = this.form.value.orderBy;
    }

    if (this.form.value.orderType !== this.orderType) {
      this.orderType = this.form.value.orderType;
    }
  }

  setSolicitacaoSelecionada() {
    this.solicitacaoSelecionada = {
      idAprovacao: null,
      nomeVendedor: null,
      matrVendedor: null,
      gerenciaVendedor: null,
      idMotivoSolic: null,
      descMotivoSolic: null,
      tipoData: null,
      dataLancamento: null,
      statusItem: null,
      dtSolic: null,
      descSolic: null,
      codCli: null,
      razaoSocialCli: null,
      cnpjCli: null,
      dtInicial: null,
      dtFinal: null,
      dtAprov: null,
      descObs: null,
      matrUsuarioCad: null,
      dtPedido: null,
      nfPedido: null,
      formaPagtoPedido: null,
      enderecoPedido: null,
      depositoPedido: null,
      empresaPedido: null,
      situaPedido: null,
      nrPedido: null,
      valorPedido: null,
      pesoPedido: null,
      linhaPredominante: null,
      descUsuarioCad: null,
      dtInclusao: null,
    };
  }

  onFieldError(field: string): string {
    if (this.onFieldInvalid(field)) {
      return 'is-invalid';
    }

    return '';
  }

  onFieldInvalid(field: any): boolean {
    field = this.form.get(field);

    return field.status == 'INVALID' && field.touched;
  }

  onFieldRequired(
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

  onFilter(): void {
    if (this.form.valid) {
      this.itemsPerPage = this.form.value.registros;
      this.currentPage = 1;
      this.setRouterParams(this.verificaParams());
      this.tipoDataControl = this.form.value.tipoData;
    }
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

    if (this.form.value.idAprovacao) {
      params.idAprovacao = this.form.value.idAprovacao;
    }

    if (this.form.value.tipoData) {
      params.tipoData = this.form.value.tipoData;
    }

    if (this.form.value.dtInicial) {
      if (this.form.value.dtInicial instanceof Date) {
        params.dtInicial = this.convertDate(this.form.value.dtInicial);
      } else {
        params.dtInicial = this.form.value.dtInicial;
      }
    }

    if (this.form.value.dtFinal) {
      if (this.form.value.dtFinal instanceof Date) {
        params.dtFinal = this.convertDate(this.form.value.dtFinal);
      } else {
        params.dtFinal = this.form.value.dtFinal;
      }
    }

    if (this.form.value.numPedido) {
      params.numPedido = this.form.value.numPedido;
    }

    if (this.form.value.nomeSolicitante) {
      params.nomeSolicitante = this.form.value.nomeSolicitante;
    }

    if (this.form.value.gerenciaSolicitante) {
      params.gerenciaSolicitante = this.form.value.gerenciaSolicitante;
    }

    if (this.form.value.empresa) {
      params.empresa = this.form.value.empresa;
    }

    if (this.form.value.cliente) {
      params.cliente = this.form.value.cliente;
    }

    if (this.form.value.linhaPredominante) {
      params.linhaPredominante = this.form.value.linhaPredominante;
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
    this.detailPanelService.hide();

    this.liberacoesService
      .getSolicitacoes(params)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
          this.dadosLoaded = true;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.hasOwnProperty('success') && response.success === true) {
            this.dados = response.data;

            this.dadosPagination = this.dados.slice(0, this.itemsPerPage);
            this.totalItems = this.dados.length;
            this.dadosLoaded = true;
          } else if (
            response.hasOwnProperty('success') &&
            response.success === false
          ) {
            this.dadosEmpty = true;
          } else {
            this.pnotifyService.error();
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

    for (let i = 0; i < this.totalItems; i++) {}
  }

  onPageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.dadosPagination = this.dados.slice(startItem, endItem);

    this.scrollToFilter.nativeElement.scrollIntoView({
      behavior: 'instant',
    });
  }

  onDetails(solicitacao: any): void {
    this.loaderNavbar = true;
    this.loadingDetails = true;
    this.detailPanelService.show();
    this.setSolicitacaoSelecionada();
    this.solicitacaoSelecionada = solicitacao;

    this.motivos = [];
    this.comentario = null;

    this.loaderNavbar = false;
    this.detailPanelService.loadedFinished(false);

    this.liberacoesService
      .getMotivosTrava(solicitacao.nrPedido, solicitacao.codEmpresa)
      .pipe(
        finalize(() => {
          setTimeout(() => {
            this.loaderNavbar = false;
            this.loadingDetails = false;
          }, 500);
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.hasOwnProperty('success') && response.success === true) {
            // Não está vazio.
            this.detailPanelService.loadedFinished(false);
            this.motivos = response.data.motivos;
            this.comentario = response.data.detalhes[0].comentario;
          } else if (
            response.hasOwnProperty('success') &&
            response.success === false
          ) {
            // Vazio.
            this.detailPanelService.loadedFinished(true);
          } else {
            // Vazio e com possível erro.
            this.pnotifyService.error();
            this.detailPanelService.loadedFinished(true);
          }
        },
        error: (error: any) => {
          // Vazio e com erro.
          this.detailPanelService.loadedFinished(true);

          if (error.error.hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
      });
  }

  onVisualizar(lista: any): void {
    this.router.navigate(['../detalhes', lista.nrPedido, lista.codEmpresa], {
      relativeTo: this.activatedRoute,
    });
  }

  getPerfil() {
    this.liberacoesService
      .getPermissoesAcesso()

      .subscribe({
        next: (response: any) => {
          if (response.success === true) {
            this.profile = response.data;
          }
        },
        error: (error: any) => {
          this.showPermissionDenied = true;
        }
      });
  }

  getFilterValues(): void {
    this.loaderFullScreen = true;
    this.loaderNavbar = true;

    this.cotacoesService.getCotacaoFilterValues().subscribe((response: any) => {
      if (response[0].responseCode === 200) {
        this.linhas = response[0].result;
        this.form.controls.linhaPredominante.enable();
      }
    });

    this.formularioService
      .loadDependencies()
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
          this.loaderNavbar = false;
        })
      )
      .subscribe((response: Array<JsonResponse | any>) => {
        this.empresas = response[1].result || [];
        this.form.controls.empresa.enable();
      });

    this.vendedoresService.getVendedores().subscribe((response: any) => {
      if (response.responseCode === 200) {
        this.vendedores = response.result;
        this.form.controls.nomeSolicitante.enable();

        this.vendedoresTotal = this.vendedores;
        this.vendedores.unshift({
          id: '',
          nome: 'EXIBIR TODOS',
        });
      }
    });

    this.escritoriosService.getEscritorios().subscribe((response: any) => {
      if (response.responseCode === 200) {
        this.escritorios = response.result;
        this.form.controls.gerenciaSolicitante.enable();

        this.escritorios.unshift({
          codEscritorio: '',
          nomeEscritorio: 'EXIBIR TODOS',
        });
      }
    });
  }

  loadingFilterValues() {
    this.form.controls.empresa.disable();
    this.form.controls.linhaPredominante.disable();
    this.form.controls.gerenciaSolicitante.disable();
    this.form.controls.nomeSolicitante.disable();
  }

  onChangeEscritorio(event: any, reset: boolean) {
    if (reset == true) {
      this.form.controls.nomeSolicitante.reset();
      this.form.controls.nomeSolicitante.setValue(0);
      this.vendedores = this.vendedoresTotal;
    }
    this.filteredVendedores = this.vendedores.filter(
      (value: any) => value.idEscritorio == this.form.value.gerenciaSolicitante
    );

    this.filteredVendedores.unshift({
      id: '',
      nome: 'EXIBIR TODOS',
    });
    this.onChangeVendedores();

    if (this.form.value.gerenciaSolicitante == '') {
      this.vendedores = this.vendedoresTotal;
    }
  }

  onChangeVendedores(): void {
    this.vendedores = this.filteredVendedores;
  }

  checkValuesGerente(): void {
    if (
      this.form.value.gerenciaSolicitante !== '' &&
      this.form.value.gerenciaSolicitante !== null
    ) {
      this.onChangeEscritorio(this.form.value.gerenciaSolicitante, false);
    }
  }

  openModal(template: TemplateRef<any>, lista, tipo) {
    if (tipo == 1) {
      if (lista.materiaisSemEstoque.length == 0) {
        this.loadingModal = true;
        this.setSolicitacaoSelecionada();
        this.solicitacaoSelecionada = lista;
        this.modalRef = this.modalService.show(template, {
          animated: false,
          class: 'modal-lg',
        });
      } else {
        this.pnotify.error('Solicitação possui materiais sem estoque');
      }
    } else {
      this.loadingModal = true;
      this.form.controls.descObs.setValidators([
        Validators.minLength(3),
        Validators.required,
      ]);
      this.form.controls.descObs.setValue(lista.comentario);
      this.form.controls.descObs.updateValueAndValidity();
      this.setSolicitacaoSelecionada();
      this.solicitacaoSelecionada = lista;
      this.modalRef = this.modalService.show(template, {
        animated: false,
        class: 'modal-lg',
      });
    }
  }

  hideModal() {
    this.modalRef.hide();
    this.form.controls.descObs.reset();
    this.form.controls.descObs.clearValidators();
    this.form.controls.descObs.updateValueAndValidity();
    this.form.controls.excluiPedido.reset();
    this.form.controls.excluiPedido.updateValueAndValidity();
  }

  onReset() {
    this.form.reset();
    this.form.patchValue({
      PAGI: 1,
      TT_REGI_PAGI: 100,
    });
  }

  setParams(solicitacao): Object {
    let params: any = {};

    let exclui;

    if (this.form.value.excluiPedido == true) {
      exclui = 1;
    } else {
      exclui = 0;
    }

    params.descObs = this.form.value.descObs;
    params.excluiPedido = exclui;
    params.empresa = solicitacao.codEmpresa;
    params.nrPedido = solicitacao.nrPedido;

    return params;
  }

  requestSuccess(solicitacao: any) {
    const stat = 1;

    this.confirmChange(stat)
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) => {
          if (!result) return EMPTY;

          this.loaderNavbar = true;

          return this.liberacoesService.aprovaLiberacao(
            this.setParams(solicitacao)
          );
        }),
        finalize(() => {
          this.loaderNavbar = false;
          this.hideModal();
          this.checkRouterParams();
        })
      )
      .subscribe(
        (success: any) => {
          this.pnotify.success();
          this.onFilter();
        },
        (error: any) => {
          this.pnotify.error('Erro ao aprovar a solicitação');
        }
      );
  }

  requestFail(solicitacao: any) {
    const stat = 2;

    this.confirmChange(stat)
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) => {
          if (!result) return EMPTY;

          this.loaderNavbar = true;
          return this.liberacoesService.reprovaLiberacao(
            this.setParams(solicitacao)
          );
        }),
        finalize(() => {
          this.loaderNavbar = false;
          this.hideModal();
          this.checkRouterParams();
        })
      )
      .subscribe(
        (success: any) => {
          this.pnotify.success();
          this.onFilter();
        },
        (error: any) => {
          this.pnotify.error('Erro ao reprovar a solicitação');
        }
      );
  }

  confirmChange(stat): any {
    if (stat == 1)
      return this.confirmModalService.showConfirm(
        null,
        'Confirmar Aprovação',
        'Deseja realmente aprovar a solicitação ?',
        'Cancelar',
        'Confirmar'
      );

    return this.confirmModalService.showConfirm(
      null,
      'Confirmar Reprovação',
      'Deseja realmente reprovar a solicitação?',
      'Cancelar',
      'Confirmar'
    );
  }

  classStatusBorder(lista: any): string {
    let borderClass: string;

    if (lista.comentario != '') {
      borderClass = 'border-danger';
    } else if (lista.comentario == '' || lista.comentario == null) {
      borderClass = 'border-primary';
    }

    return borderClass;
  }

  onExport(): void {
    let data = new Date().toLocaleDateString().split('/'),
      dataExport = `${data[0]}${data[1]}${data[2]}`;

    let listagemExport: any = [];
    listagemExport = this.dados.concat(this.totalItens);

    this.xlsxService.exportFile(listagemExport, `Aprovacoes${dataExport}`);
  }
}
