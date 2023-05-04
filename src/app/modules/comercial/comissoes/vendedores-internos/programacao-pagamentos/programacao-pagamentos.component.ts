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
import { ComercialGestaoAssociacoesCoordenadoresEscritoriosService } from '../../../gestao/associacoes/coordenadores-escritorios/coordenadores-escritorios.service';
import { ComercialDashboardVendedorService } from '../../../dashboard/vendedor/vendedor.service';
import { ComercialComissoesService } from './../../comissoes.service';
import { AuthService } from './../../../../../shared/services/core/auth.service';
import { ConfirmModalService } from './../../../../../shared/modules/confirm-modal/confirm-modal.service';

// Interfaces
import { IComissaoPagamentos } from './../models/comissao-pagamentos';
import { CustomTableConfig } from './../../../../../shared/templates/custom-table/models/config';
import { Subtitles } from './../../../../../shared/modules/subtitles/subtitles';
import { Breadcrumb } from './../../../../../shared/modules/breadcrumb/breadcrumb';
import { JsonResponse } from 'src/app/models/json-response';

@Component({
  selector: 'comercial-comissoes-vendedores-internos-programacao-pagamentos',
  templateUrl: './programacao-pagamentos.component.html',
  styleUrls: ['./programacao-pagamentos.component.scss'],
})
export class ComercialComissoesVendedoresInternosProgramacaoPagamentosComponent
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
      text: 'Pago',
      color: 'green',
    },
    {
      id: 0,
      text: 'Programado',
      color: 'blue',
    },
    {
      id: 2,
      text: 'Aguardando Programação',
      color: 'gray',
    },
  ];

  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
  };

  bsConfig: Partial<BsDatepickerConfig>;

  form: FormGroup;
  orderBy = 'codComissao';
  orderType = 'ASC';

  profile: any = {};
  showPermissionDenied = false;
  disable: boolean;

  vendedores: Array<any> = [];
  gerentes: Array<any> = [];

  maxSize = 10;
  itemsPerPage = 300;
  currentPage = 1;
  totalItems = 0;

  dados: Array<IComissaoPagamentos> = [];
  dadosPagination: Array<IComissaoPagamentos> = [
    {
      codComissao: 1,
      situacao: 1,
      codVendedor: 1,
      nomeVendedor: 'vendedor 1',
      codGerente: 1,
      nomeGerente: 'gerente 1',
      dataProg: '12/11/2020',
      valorComissao: 1000,
    },
    {
      codComissao: 2,
      situacao: 2,
      codVendedor: 2,
      nomeVendedor: 'vendedor 2',
      codGerente: 2,
      nomeGerente: 'gerente 2',
      dataProg: null,
      valorComissao: 2000,
    },
    {
      codComissao: 3,
      situacao: 0,
      codVendedor: 3,
      nomeVendedor: 'vendedor 3',
      codGerente: 3,
      nomeGerente: 'gerente 3',
      dataProg: '12/11/2020',
      valorComissao: 3000,
    },
  ];

  dadosLoaded = false;
  dadosEmpty = false;

  comissaoSelecionada: IComissaoPagamentos;
  test: number;

  constructor(
    private activatedRoute: ActivatedRoute,
    private pnotifyService: PNotifyService,
    private localeService: BsLocaleService,
    private router: Router,
    private atividadesService: AtividadesService,
    private titleService: TitleService,
    private vendedoresService: ComercialVendedoresService,
    private formBuilder: FormBuilder,
    private dateService: DateService,
    private escritoriosService: ComercialGestaoAssociacoesCoordenadoresEscritoriosService,
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
    this.getGerentes();
    this.getVendedores();
    this.setFormFilter();

    this.titleService.setTitle('Programação de Pagamentos');

    this.setComissaoSelecionada();
  }

  ngOnDestroy(): void {}

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
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
          descricao: 'Programação de Pagamentos',
        },
      ];
    });
  }

  setFormFilter(): void {
    const formValue: any = this.checkRouterParams();

    this.form = this.formBuilder.group({
      dataInicial: [formValue.dataInicial],
      dataFinal: [formValue.dataFinal],
      codGerente: [formValue.codGerente, [Validators.required]],
      situacao: [formValue.situacao, [Validators.required]],
      dataProg: [formValue.dataProg, [Validators.required]],
      pagina: [formValue.pagina],
      registros: [this.itemsPerPage, Validators.required],
      orderBy: [formValue.orderBy],
      orderType: [formValue.orderType],
    });
  }

  checkRouterParams(): Object {
    let formValue = {
      dataInicial: this.dateService.getFirstDayMonth(),
      dataFinal: this.dateService.getLastDayMonth(),
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

  onFilter() {
    if (this.form.valid) {
      this.itemsPerPage = this.form.value.registros;
      this.currentPage = 1;
      this.setRouterParams(this.verificaParams());
    }
  }

  verificaParams(): Object {
    let params: any = {};

    if (this.form.value.dataInicial) {
      params.dataInicial = this.form.value.dataInicial;
    }

    if (this.form.value.dataFinal) {
      params.dataFinal = this.form.value.dataFinal;
    }

    if (this.form.value.codGerente) {
      params.codGerente = this.form.value.codGerente;
    }

    if (this.form.value.situacao) {
      params.situacao = this.form.value.situacao;
    }

    params.orderBy = this.form.value.orderBy;
    params.orderType = this.form.value.orderType;
    params.pagina = this.form.value.pagina;
    params.registros = this.form.value.registros;

    return params;
  }

  setRouterParams(params: any): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { q: btoa(JSON.stringify(params)) },
    });
    this.search(params);
  }

  search(params: any): void {
    this.loaderNavbar = true;
    this.dados = [];
    this.dadosLoaded = false;
    this.dadosEmpty = false;

    this.dadosLoaded = true; //retirar
    /* this.cotacoesService
      .getCotacoes(params)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
          this.dadosLoaded = true;
        })
      )
      .subscribe(
        (response: JsonResponse) => {
          if (response.hasOwnProperty('success') && response.success === true) {
            this.dados = response.data;

            this.totalItems = this.dados[0].qtdeRegistros;
          } else if (
            response.hasOwnProperty('success') &&
            response.success === false &&
            response.hasOwnProperty('mensagem') &&
            response.mensagem.length > 0 &&
            response.mensagem !== null
          ) {
            this.pnotifyService.error(response.mensagem);
            this.dadosEmpty = true;
          } else {
            this.pnotifyService.error();
            this.dadosEmpty = true;
          }
        },
        (error: any) => {
          if (error.error.hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
      ); */
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

  onPageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.dadosPagination = this.dados.slice(startItem, endItem);

    this.scrollToFilter.nativeElement.scrollIntoView({
      behavior: 'instant',
    });
  }

  getVendedores(): void {
    this.vendedoresService.getVendedores().subscribe((response: any) => {
      if (response.responseCode === 200) {
        this.vendedores = response.result;

        this.vendedores.unshift({
          id: 0,
          nome: 'EXIBIR TODOS',
        });
      }
    });
  }

  getGerentes(): void {
    this.escritoriosService
      .getListaCoordenadoresEscritorios()
      .subscribe((response: any) => {
        if (response.responseCode === 200) {
          this.gerentes = response.result.coordenadores;

          this.gerentes.unshift({
            id: 0,
            nome: 'EXIBIR TODOS',
          });
        }
      });
  }

  classStatusBorder(comissao: IComissaoPagamentos): string {
    let borderClass: string;

    if (comissao.situacao === 1) {
      borderClass = 'border-success';
    } else if (comissao.situacao === 2) {
      borderClass = 'border-secondary';
    } else if (comissao.situacao === 0) {
      borderClass = 'border-primary';
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
      dataProg: null,
      valorComissao: null,
    };
  }

  openModal(template: TemplateRef<any>, lista) {
    this.loadingModal = true;
    this.comissaoSelecionada = lista;
    this.modalRef = this.modalService.show(template, {
      animated: false,
      class: 'modal-lg text-align-center',
    });
  }

  onPagar(index: number, lista: IComissaoPagamentos): void {
    this.confirmPagar()
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) =>
          result ? this.pagarComissao(index, lista) : EMPTY
        ),
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe(
        (success: any) => {
          this.pnotifyService.success();
          this.refreshMainData(lista);
        },
        (error: any) => {
          this.pnotifyService.error();
          this.dadosPagination[index].situacao = 2;
        }
      );
  }

  confirmPagar(): any {
    return this.confirmModalService.showConfirm(
      null,
      null,
      'Deseja realmente confirmar o pagamento da comissão?',
      'Cancelar',
      'Confirmar'
    );
  }

  pagarComissao(index: number, lista: IComissaoPagamentos): Observable<any> {
    this.loaderNavbar = true;
    this.dadosPagination[index].situacao = 1;
    return;
    //return this.materiaisGrupoService.pagarComissao(lista.codComissao);
  }

  hideModal() {
    this.modalRef.hide();
  }

  onProgramar(index: number, lista: IComissaoPagamentos): void {
    this.modalRef.hide();
  }

  refreshMainData(lista: IComissaoPagamentos): void {
    for (let i = 0; i < this.dados.length; i++) {
      if (lista.codComissao === this.dados[i].codComissao) {
        this.dados[i].situacao = lista.situacao;
        return;
      }
    }
  }
}
