import { descricaoTabela } from './../../../vendedores-internos/gestao-comissionamentos/models/tabela-precos';
import { ComercialComissoesVendedoresInternosProgramacaoPagamentosService } from './../../programacao-pagamentos/programacao-pagamentos.service';
import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

// ngx-bootstrap
import { defineLocale } from 'ngx-bootstrap/chronos';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ptBrLocale } from 'ngx-bootstrap/locale';

defineLocale('pt-br', ptBrLocale);

// Services
import { AtividadesService } from './../../../../../../shared/services/requests/atividades.service';
import { ConfirmModalService } from './../../../../../../shared/modules/confirm-modal/confirm-modal.service';
import { PNotifyService } from './../../../../../../shared/services/core/pnotify.service';
import { DateService } from './../../../../../../shared/services/core/date.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { ComercialComissoesVendedoresInternosGestaoComissionamentosService } from '../gestao-comissionamentos.service';
import { ComercialVendedoresService } from 'src/app/modules/comercial/services/vendedores.service';
import { ComercialGestaoAssociacoesCoordenadoresEscritoriosService } from 'src/app/modules/comercial/gestao/associacoes/coordenadores-escritorios/coordenadores-escritorios.service';

// Interfaces
import { CustomTableConfig } from './../../../../../../shared/templates/custom-table/models/config';
import { Breadcrumb } from './../../../../../../shared/modules/breadcrumb/breadcrumb';
import { JsonResponse } from './../../../../../../models/json-response';

@Component({
  selector:
    'comercial-comissoes-vendedores-internos-gestao-comissionamentos-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss'],
})
export class ComercialComissoesVendedoresInternosGestaoComissionamentosFormularioComponent
  implements OnInit
{
  @ViewChild('scrollToFilter', {}) scrollToFilter: ElementRef;

  loaderNavbar = false;
  loaderFullScreen = true;

  appTitle: string;
  breadCrumbTree: Array<Breadcrumb> = [];

  showPermissionDenied = false;

  aprovarAnalista: boolean = true;
  reprovarAnalista: boolean = true;
  aprovarGerente: boolean = true;
  reprovarGerente: boolean = true;
  aprovarDiretor: boolean = true;
  reprovarDiretor: boolean = true;

  dados: any[] = [
    {
      codTabela: 1,
      nomeTabela: 'tabela 1',
      dataInicial: '01/11/2020',
      dataFinal: '30/11/2020',
      situacao: 1,
      nomeUsuario: 'user 1',
      dataCadastro: '01/11/2020',
      vendedor: [
        {
          codVendedor: 1,
          nomeVendedor: 'Vendedor 1',
          escritorio: 1,
          kpi: [
            {
              codKpi: 1,
              descKpi: 'kpi 1',
              porcGanho: 0.075,
              meta: 10,
              totalRealizado: 9,
              porcAlcancado: 90,
              potencialGanho: 0.33, // fixo
              ganhoEfetivo: 0.15,
            },
            {
              codKpi: 2,
              descKpi: 'kpi 2',
              porcGanho: 0.075,
              meta: 20,
              totalRealizado: 20,
              porcAlcancado: 100,
              potencialGanho: 0.33,
              ganhoEfetivo: 0.33,
            },
          ],
        },
        {
          codVendedor: 2,
          nomeVendedor: 'Vendedor 2',
          escritorio: 2,
          kpi: [
            {
              codKpi: 1,
              descKpi: 'kpi 1',
              porcGanho: 0.075,
              meta: 10,
              totalRealizado: 10,
              porcAlcancado: 0,
              potencialGanho: 0.33,
              ganhoEfetivo: 0.15,
            },
            {
              codKpi: 2,
              descKpi: 'kpi 2',
              porcGanho: 0.075,
              meta: 20,
              totalRealizado: 20,
              porcAlcancado: 0,
              potencialGanho: 0.33,
              ganhoEfetivo: 0.15,
            },
          ],
        },
      ],
    },
  ];
  vendedores: any[] = [];
  escritorios: any[] = [];
  vendedorSelecionado: Array<descricaoTabela>;
  profile: any = {};

  dadosLoaded = false;
  dadosEmpty = false;
  programado = false;

  modalRef: BsModalRef;

  grupoSelecionado: any;

  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: false,
    hover: false,
  };

  tableConfigMateriais: Partial<CustomTableConfig> = {
    hover: false,
  };

  activatedRouteSubscription: Subscription;

  form: FormGroup;
  orderBy = 'codPreco';
  orderType = 'ASC';

  bsConfig: Partial<BsDatepickerConfig>;

  maxSize = 10;
  itemsPerPage = 300;
  currentPage = 1;
  totalItems = 0;

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private localeService: BsLocaleService,
    private dateService: DateService,
    private router: Router,
    private pnotifyService: PNotifyService,
    private gestaoComissionamentosService: ComercialComissoesVendedoresInternosGestaoComissionamentosService,
    private atividadesService: AtividadesService,
    private bsModalService: BsModalService,
    private confirmModalService: ConfirmModalService,
    private modalService: BsModalService,
    private titleService: TitleService,
    private escritoriosService: ComercialGestaoAssociacoesCoordenadoresEscritoriosService,
    private vendedoresService: ComercialVendedoresService
  ) {
    this.localeService.use('pt-br');
  }

  ngOnInit(): void {
    this.setFormFilter();
    this.getRegistros();
    this.setBreadCrumb();
    this.registrarAcesso();
    this.getPerfil();
    this.getEscritorio();
    this.getVendedores();
  }

  setBreadCrumb(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.id) {
        this.appTitle = 'Editar tabela';
      } else {
        this.appTitle = 'Nova tabela';
      }

      this.titleService.setTitle(this.appTitle);

      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/comercial/home',
        },
        {
          descricao: 'Comissões',
          routerLink: `/comercial/comissoes/${params['idSubModulo']}`,
        },
        {
          descricao: 'Vendedores Internos',
          routerLink: `/comercial/comissoes/${params['idSubModulo']}/vendedores-internos`,
        },
        {
          descricao: 'Gestão de Comissionamentos',
          routerLink: `/comercial/comissoes/${params['idSubModulo']}/vendedores-internos/gestao-comissionamentos/lista`,
        },
        {
          descricao: this.appTitle,
        },
      ];
    });
  }

  // Formulário
  setFormFilter(): void {
    const formValue: any = this.checkRouterParams();
    console.log(formValue);
    console.log(this.dados);

    this.form = this.formBuilder.group({
      periodo: [formValue.periodo, Validators.required],
      descTabela: [formValue.descTabela, Validators.required],
      escritorio: [formValue.escritorios],
      vendedor: [formValue.vendedores],
      orderBy: [formValue.orderBy],
      orderType: [formValue.orderType],
      pagina: [formValue.pagina],
      registros: [formValue.registros, Validators.required],
    });

    this.checkOrder();
  }

  registrarAcesso() {
    this.atividadesService.registrarAcesso().subscribe();
  }

  checkRouterParams(): Object {
    let formValue = {
      codTabela: null,
      periodo: null,
      codStatus: 2,
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

  // Ordem lista
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

  // Pesquisa
  onFilter(): void {
    if (this.form.valid) {
      this.itemsPerPage = this.form.value.registros;
      this.currentPage = 1;
      this.setRouterParams(this.getParams());
    }
  }

  search(params: any): void {
    this.loaderNavbar = true;
    this.dados = [];
    this.dadosLoaded = false;
    this.dadosEmpty = false;

    /* this.programacaoPagamentosService
      .getProgramacao(params)
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
            this.totalItems = this.dados[0]['total'];
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

  // Verifica Parâmetros
  setRouterParams(params: any): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { q: btoa(JSON.stringify(params)) },
    });
    this.search(params);
  }

  getParams() {
    let _params = {};
    let _obj = this.form.value;
    for (let prop in _obj) {
      if (_obj[prop]) {
        if (_obj[prop] instanceof Date)
          _params[prop] = this.dateService.convertToUrlDate(_obj[prop]);
        else _params[prop] = _obj[prop];
      }
    }
    _params['orderBy'] = this.orderBy;
    _params['orderType'] = this.orderType;
    return _params;
  }

  verificaParams(): Object {
    let params: any = {};

    if (this.form.value.codVendedor) {
      params.codVendedor = this.form.value.codVendedor;
    }

    if (this.form.value.dtInicioVigencia) {
      params.dtInicioVigencia = this.form.value.dtInicioVigencia;
    }

    if (this.form.value.dtFimVigencia) {
      params.dtFimVigencia = this.form.value.dtFimVigencia;
    }

    if (this.form.value.codStatus) {
      params.codStatus = this.form.value.codStatus;
    }

    params.pagina = this.form.value.pagina;
    params.registros = this.form.value.registros;
    params.orderBy = this.form.value.orderBy;
    params.orderType = this.form.value.orderType;

    return params;
  }

  // Get perfil
  getPerfil() {
    this.gestaoComissionamentosService
      .getPermissoesAcesso()
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.success === true) {
            this.profile = response.data;
            console.log(response);
            if (this.profile.analistaMarketing === true) {
              console.log('analistaMarketing');
            } else if (this.profile.gerenteMarketing === true) {
              console.log('gerenteMarketing');
              this.gerenteDisabled();
            } else if (this.profile.gerenteEscritorio === true) {
              console.log('gerenteEscritorio');
              this.escritorioDisabled();
            } else if (this.profile.gerenteFiscal === true) {
              this.fiscalDisabled();
              console.log('gerenteFiscal');
            } else if (this.profile.diretorComercial === true) {
              console.log('diretorComercial');
              this.diretorDisabled();
            }
          }
        },
        error: (error: any) => {
          this.showPermissionDenied = true;
        }
      });
  }

  escritorioDisabled() {
    this.form.get('periodo').disable();

    this.form.get('escritorio').disable();
    this.form.get('codStatus').setValue('1');
    this.form.get('codStatus').disable();
  }

  gerenteDisabled() {
    this.form.get('periodo').disable();
  }

  fiscalDisabled() {
    this.form.get('periodo').disable();
    this.form.get('codStatus').setValue('4');
    this.form.get('codStatus').disable();
  }

  diretorDisabled() {
    this.form.get('periodo').disable();
  }

  // Lógicas de aprovação
  onAprovarAnalista() {
    this.aprovarAnalista = !this.aprovarAnalista;
    console.log('AGUARDANDO GERENTE DE MARKETING');
  }

  onReprovarAnalista() {
    this.reprovarAnalista = !this.reprovarAnalista;
    console.log('AGUARDANDO GERENTE DE ESCRITÓRIO');
  }

  onAprovarGerente() {
    this.aprovarGerente = !this.aprovarGerente;
    console.log('AGUARDANDO GERENTE FISCAL');
  }

  onReprovarGerente() {
    this.reprovarGerente = !this.reprovarGerente;
    console.log('AGUARDANDO GERENTE DE ESCRITÓRIO');
  }

  onAprovarDiretor() {
    this.aprovarDiretor = !this.aprovarDiretor;
    console.log('CONCLUIDO');
  }

  onReprovarDiretor() {
    this.reprovarDiretor = !this.reprovarDiretor;
    console.log('AGUARDANDO GERENTE DE MARKETING');
  }

  /* setVendedorSelecionado(): void {
    this.vendedorSelecionado = {
      codTabela: null,
    };
  }
 */

  // Get e EditarLista
  getRegistros() {
    this.loaderNavbar = true;

    this.dadosLoaded = false;
    this.dadosEmpty = false;

    /* this.programacaoPagamentosService
      .getProgramacao()
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
          this.dadosLoaded = true;
        })
      )
      .subscribe(
        dados => {this.dados = dados; },
        (response: JsonResponse) => {
          if (response.hasOwnProperty('success') && response.success === true) {
            this.dados = response.data;

            this.totalItems = this.dados[0]['total'];
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
        // (error: any) => {
        //   this.dadosEmpty = true;

        //   if (error.error.hasOwnProperty('mensagem')) {
        //     this.pnotifyService.error(error.error.mensagem);
        //   } else {
        //     this.pnotifyService.error();
        //   }
        // }
      ); */
  }

  onEdit(item: any): void {
    this.router.navigate(['../editar', item.codPreco], {
      relativeTo: this.activatedRoute,
    });
  }

  // Outros
  onPageChanged(event: PageChangedEvent) {
    if (this.form.value.pagina != event.page) {
      this.form.value.pagina = event.page;
      this.onFilter();

      this.scrollToFilter.nativeElement.scrollIntoView({
        behavior: 'instant',
      });
    }
  }

  refreshMainData(lista: any): void {
    for (let i = 0; i < this.dados.length; i++) {
      if (lista.codTabela === this.dados[i].codTabela) {
        this.dados[i].situacao = lista.situacao;
        return;
      }
    }
  }

  //modal
  openModal(template: TemplateRef<any>, index) {
    this.modalRef = this.bsModalService.show(template, index);
  }

  // Tratamento de erros
  onFieldError(field: string) {
    if (this.onFieldInvalid(field)) {
      return 'is-invalid';
    }

    return '';
  }

  onFieldInvalid(field: any) {
    field = this.form.get(field);

    if (field.errors != null) {
      if (field.errors.hasOwnProperty('required') && field.touched) {
        return 'required';
      }
    }

    return '';
  }

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

  getEscritorio(): void {
    this.escritoriosService
      .getListaCoordenadoresEscritorios()
      .subscribe((response: any) => {
        if (response.responseCode === 200) {
          this.escritorios = response.result.coordenadores;

          this.escritorios.unshift({
            id: 0,
            nome: 'EXIBIR TODOS',
          });
        }
      });
  }
}
