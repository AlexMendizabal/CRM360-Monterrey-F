import { object } from '@amcharts/amcharts4/core';
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
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { ptBrLocale } from 'ngx-bootstrap/locale';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

defineLocale('pt-br', ptBrLocale);

// Services
import { PNotifyService } from './../../../../../shared/services/core/pnotify.service';
import { TitleService } from './../../../../../shared/services/core/title.service';
import { AtividadesService } from './../../../../../shared/services/requests/atividades.service';
import { DateService } from './../../../../../shared/services/core/date.service';
import { DetailPanelService } from './../../../../../shared/templates/detail-panel/detal-panel.service';
import { ComercialVendedoresService } from '../../../services/vendedores.service';
import { ComercialService } from '../../../comercial.service';
import { ComercialDashboardVendedorService } from '../../../dashboard/vendedor/vendedor.service';
import { ComercialComissoesService } from './../../comissoes.service';
import { AuthService } from './../../../../../shared/services/core/auth.service';
import { ConfirmModalService } from './../../../../../shared/modules/confirm-modal/confirm-modal.service';
import { EscritoriosService } from 'src/app/shared/services/requests/escritorios.service';

// Interfaces
import { IComissaoMetas } from './../models/comissao-metas';
import { CustomTableConfig } from './../../../../../shared/templates/custom-table/models/config';
import { Subtitles } from './../../../../../shared/modules/subtitles/subtitles';
import { Breadcrumb } from './../../../../../shared/modules/breadcrumb/breadcrumb';
// import { JsonResponse } from 'src/app/models/json-response';

@Component({
  selector: 'comercial-comissoes-vendedores-internos-lancamento-metas',
  templateUrl: './lancamento-metas.component.html',
  styleUrls: ['./lancamento-metas.component.scss'],
})
export class ComercialComissoesVendedoresInternosLancamentoMetasComponent
  implements OnInit
{
  @ViewChild('scrollToFilter', {}) scrollToFilter: ElementRef;
  private user = this.authService.getCurrentUser();

  loaderNavbar = false;
  //loaderFullScreen = true;
  loaderFullScreen = false;

  userMarketing: boolean = true;

  loadingModal = false;
  modalRef: BsModalRef;

  breadCrumbTree: Array<Breadcrumb> = [];

  activatedRouteSubscription: Subscription;

  showDetailPanelSubscription: Subscription;
  showDetailPanel = false;

  subtitles: Array<Subtitles> = [
    {
      id: 1,
      text: 'Aprovada',
      color: 'green',
    },
    {
      id: 0,
      text: 'Reprovada',
      color: 'red',
    },
    {
      id: 2,
      text: 'Em aprovação',
      color: 'blue',
    },
  ];

  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
  };

  bsConfig: Partial<BsDatepickerConfig>;

  form: FormGroup;
  orderBy = 'codClassificacao';
  orderType = 'ASC';

  profile: any = {};
  showPermissionDenied = false;
  disable: boolean;

  vendedores: Array<any> = [];
  vendedoresTotal: Array<any> = [];
  escritorios: Array<any> = [];

  filteredVendedores: Array<any> = [];

  maxSize = 10;
  itemsPerPage = 300;
  currentPage = 1;
  totalItems = 0;

  dados: Array<IComissaoMetas> = [];
  dadosPagination: Array<IComissaoMetas> = [
    {
      codComissao: 1,
      situacao: 2,
      codVendedor: 1,
      nomeVendedor: 'vendedor 1vendedor 1vendedor 1',
      codGerente: 1,
      nomeGerente: 'gerente 1gerente 1',
      descReprov: null,
    },
    {
      codComissao: 2,
      situacao: 2,
      codVendedor: 2,
      nomeVendedor: 'vendedor 2vendedor 2vendedor 2',
      codGerente: 2,
      nomeGerente: 'gerente 2gerente 2',
      descReprov: null,
    },
  ];
  dadosLoaded = false;
  dadosEmpty = false;

  metas: Array<any> = [];
  comissaoSelecionada: IComissaoMetas;
  test: number;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private pnotifyService: PNotifyService,
    private localeService: BsLocaleService,
    private atividadesService: AtividadesService,
    private titleService: TitleService,
    private formBuilder: FormBuilder,
    private dateService: DateService,
    private vendedoresService: ComercialVendedoresService,
    private escritoriosService: EscritoriosService,
    private comercialService: ComercialService,
    private detailPanelService: DetailPanelService,
    private dashboardService: ComercialDashboardVendedorService,
    private authService: AuthService,
    private modalService: BsModalService,
    private confirmModalService: ConfirmModalService,
    private comissoesService: ComercialComissoesService
  ) {
    this.localeService.use('pt-br');
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
    this.getPerfil();
    this.getFiltersValues();
    this.setFormFilter();
    this.titleService.setTitle('Lançamento de Metas');
    this.onDetailPanelEmitter();
    this.setComissaoSelecionada();
    this.loadingFilterValues();
  }

  ngOnDestroy(): void {
    this.showDetailPanelSubscription.unsubscribe();
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  onDetailPanelEmitter(): void {
    this.showDetailPanelSubscription = this.detailPanelService.config.subscribe(
      (event: any) => {
        this.showDetailPanel = event.showing;
      }
    );
  }

  setBreadCrumb(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/comercial/home',
        },
        {
          descricao: 'Gestão',
          routerLink: `/comercial/comissoes/${params['idSubModulo']}`,
        },
        {
          descricao: 'Vendedores Internos',
          routerLink: `/comercial/comissoes/${params['idSubModulo']}/vendedores-internos`,
        },
        {
          descricao: 'Lançamento de Metas',
        },
      ];
    });
  }

  setFormFilter(): void {
    const formValue: any = this.checkRouterParams();

    this.form = this.formBuilder.group({
      dataInicial: [formValue.dataInicial],
      dataFinal: [formValue.dataFinal],
      codVendedor: [formValue.codVendedor],
      codGerente: [formValue.codGerente],
      pagina: [formValue.pagina],
      registros: [this.itemsPerPage, Validators.required],
      metaClientes: [formValue.metaCliente, [Validators.required]],
      metaCivil: [formValue.metaCivil, [Validators.required]],
      metaFaturamento: [formValue.metaFaturamento, [Validators.required]],
    });

    this.checkValuesEscritorio();
  }

  checkRouterParams(): Object {
    let formValue = {
      dataInicial: this.dateService.getFirstDayMonth(),
      dataFinal: this.dateService.getLastDayMonth(),
      codVendedor: 0,
      codGerente: 0,
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
                if (formKey === 'dataInicial' || formKey === 'dataFinal') {
                  formValue[formKey] = this.dateService.convertStringToDate(
                    params[paramKey],
                    'pt-br'
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
        }
      }
    );
    this.activatedRouteSubscription.unsubscribe();

    return formValue;
  }

  onPageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.dadosPagination = this.dados.slice(startItem, endItem);

    this.scrollToFilter.nativeElement.scrollIntoView({
      behavior: 'instant',
    });
  }

  getFiltersValues(): void {
    this.vendedoresService.getVendedores().subscribe((response: any) => {
      if (response.responseCode === 200) {
        this.vendedores = response.result;
        this.vendedoresTotal = this.vendedores;
        this.form.controls.codVendedor.enable();

        console.log(this.vendedores); //retirar

        this.vendedores.unshift({
          id: 0,
          nome: 'EXIBIR TODOS',
        });
      }
    });

    this.escritoriosService.getEscritorios().subscribe((response: any) => {
      if (response.responseCode === 200) {
        this.escritorios = response.result;
        this.form.controls.codGerente.enable();

        console.log(this.escritorios); //retirar

        this.escritorios.unshift({
          id: 0,
          nome: 'EXIBIR TODOS',
        });
      }
    });
  }

  loadingFilterValues() {
    this.form.controls.codGerente.disable();
    this.form.controls.codVendedor.disable();
  }

  onChangeEscritorio(escritorio: Array<any>, reset: boolean) {
    if (reset) {
      this.form.controls.codVendedor.reset();
      this.form.controls.codVendedor.setValue(0);
      this.form.controls.codVendedor.disable();
      this.vendedores = this.vendedoresTotal;
    }

    this.form.controls.codVendedor.enable();

    this.filteredVendedores = this.vendedores.filter(
      (value: any) => value.idEscritorio == this.form.value.codGerente
    );

    console.log(this.filteredVendedores);

    this.filteredVendedores.unshift({
      idClasse: 0,
      nomeClasse: 'EXIBIR TODOS',
    });

    this.onChangeVendedores();
  }

  onChangeVendedores(): void {
    this.vendedores = this.filteredVendedores;
  }

  checkValuesEscritorio(): void {
    if (
      this.form.value.codGerente !== '' &&
      this.form.value.codGerente !== null
    ) {
      this.onChangeEscritorio(this.form.value.codGerente, false);
    }
  }

  getPerfil() {
    this.comercialService
      .getPerfil()
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.responseCode === 200) {
            this.profile = response.result;
            console.log(this.user);
            console.log(this.profile);

            if (
              this.profile.coordenador === true ||
              this.profile.gestor === true
            ) {
              this.form.controls.codGerente.disable();
              this.userMarketing = false; //alterar para visualizar a tela
              console.log(this.userMarketing);
            } else if (this.profile.vendedor === true) {
              this.form.controls.codGerente.enable();
            } else {
              this.showPermissionDenied = true;
            }
          } else {
            this.showPermissionDenied = true;
          }
        },
        error: (error: any) => {
          this.showPermissionDenied = true;
        }
      });
  }

  classStatusBorder(comissao: IComissaoMetas): string {
    let borderClass: string;

    if (comissao.situacao === 1) {
      borderClass = 'border-success';
    } else if (comissao.situacao === 2) {
      borderClass = 'border-primary';
    } else if (comissao.situacao === 0) {
      borderClass = 'border-danger';
    }

    return borderClass;
  }

  setComissaoSelecionada(): void {
    this.comissaoSelecionada = {
      codComissao: null,
      situacao: null,
      codVendedor: null,
      nomeVendedor: null,
      codGerente: null,
      nomeGerente: null,
      descReprov: null,
    };
  }

  onDetails(comissao: IComissaoMetas): void {
    this.loaderNavbar = true;
    this.detailPanelService.show();
    this.setComissaoSelecionada();
    this.comissaoSelecionada = comissao;
    this.loaderNavbar = false; //retirar

    this.metas = [
      {
        anoPassado: [
          { clientes: { meta: 10 } },
          { extras: { meta: 20 } },
          { toneladas: { meta: 30 } },
        ],
        passado: [
          { clientes: { meta: 11 } },
          { extras: { meta: 21 } },
          { toneladas: { meta: 31 } },
        ],
        corrente: [
          { clientes: { meta: 12 } },
          { extras: { meta: 22 } },
          { toneladas: { meta: 32 } },
        ],
      },
    ];

    console.log(this.metas);
    this.detailPanelService.loadedFinished(false); //retirar
    
    return;
    this.dashboardService
      .getMetas(comissao.codGerente, comissao.codVendedor)
      .pipe(
        finalize(() => {
          setTimeout(() => {
            this.loaderNavbar = false;
          }, 500);
        })
      )
      .subscribe(
        (response: any) => {
          if (response.hasOwnProperty('success') && response.success === true) {
            // Não está vazio.
            this.detailPanelService.loadedFinished(false);
            this.metas = response;
            console.log(this.metas);
            console.log(this.test);
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
        (error: any) => {
          // Vazio e com erro.
          this.detailPanelService.loadedFinished(true);
          if (error.error.hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
      );
  }

  openModal(template: TemplateRef<any>, meta) {
    this.loadingModal = true;
    this.comissaoSelecionada = meta;
    this.modalRef = this.modalService.show(template, {
      animated: false,
      class: 'modal-lg',
    });
  }

  hideModal() {
    this.modalRef.hide();
  }

  onSalvar(meta: Array<any>) {}

  onFilter(): void {
    if (this.form.valid) {
      this.itemsPerPage = this.form.value.registros;
      this.currentPage = 1;
      this.setRouterParams(this.verificaParams());
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

    if (this.form.value.nomeClassificacao) {
      params.nomeClassificacao = this.form.value.nomeClassificacao;
    }

    if (this.form.value.situacao) {
      params.situacao = this.form.value.situacao;
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

    /* this.rankingClientesService
      .getListaRanking(params)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
          this.dadosLoaded = true;
        })
      )
      .subscribe(
        (response: any) => {
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
        (error: any) => {
          this.dadosEmpty = true;

          if (error.error.hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
      ); */
  }

  onAprovar() {}

  onReprovar() {}
}
