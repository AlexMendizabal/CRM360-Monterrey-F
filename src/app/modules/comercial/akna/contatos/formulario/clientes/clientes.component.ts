import { ComercialVendedoresService } from './../../../../services/vendedores.service';
import { ComercialCadastrosAssociacaoLinhasService } from './../../../../cadastros/associacao-linhas/associacao-linhas.service';
import { event } from './../../../../../admin/perfis/models/event';
import { ComercialAknaContatosService } from './../../contatos.service';
import { Breadcrumb } from './../../../../../../shared/modules/breadcrumb/breadcrumb';
import { TitleService } from './../../../../../../shared/services/core/title.service';
import { ComercialClientesCadastroDadosFaturamentoFormularioService } from './../../../../clientes/cadastro/dados-faturamento/formulario/formulario.service';
import { AtividadesService } from './../../../../../../shared/services/requests/atividades.service';
import { JsonResponse } from './../../../../../../models/json-response';
import { ComercialClientesService } from './../../../../services/clientes.service';
//angular
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

//services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
//rxjs
import { finalize, map } from 'rxjs/operators';
import { Subscription } from 'rxjs';

//interfaces
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';

@Component({
  selector: 'comercial-akna-contatos-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss'],
})
export class ComercialAknaContatosClientesComponent implements OnInit {
  loaderNavbar = false;

  breadCrumbTree: Array<Breadcrumb> = [
    {
      descricao: 'Home',
      routerLink: '/comercial/home',
    },
    {
      descricao: 'Busqueda de clientes',
    },
  ];

  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: false,
  };

  activatedRouteSubscription: Subscription;
  $subscriptions: Subscription[] = [];
  linhas: any = [];
  vendedores: any = [];

  idLista: number;
  dataLoaded = false;
  dadosCadastraisLoaded = false;
  dadosCadastraisEmpty = false;
  contatosLoaded = false;
  contatosEmpty = false;
  toggleAll = false;
  searchSubmitted = false;
  showAdvancedFilter = true;

  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  matricula = this.currentUser['info']['matricula'];
  bsConfig: Partial<BsDatepickerConfig>;
  ativos = 0;
  inativos = 0;
  potencial = 0;
  arquivados = 0;

  formFilter: FormGroup;
  buscandoPor: number;
  tiposDatas: number;
  pesquisa: string;
  orderBy = 'codCliente';
  orderType = 'desc';

  maxSize = 10;
  itemsPerPage = 50;
  currentPage = 1;
  totalClientes = 0;
  gerentes: any = [];
  clientes: any = [];
  tipos_cliente: any = [];
  allClientes: any = [];
  clientesPagination: any = [];

  clienteSelecionado: number;
  dadosCadastrais: any = {};
  contatos: any = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private contatosService: ComercialAknaContatosService,
    private clientesService: ComercialClientesService,
    private formBuilder: FormBuilder,
    private pnotifyService: PNotifyService,
    private atividadesService: AtividadesService,
    private localeService: BsLocaleService,
    private comercialService: ComercialVendedoresService,
    private setoresLinhaService: ComercialCadastrosAssociacaoLinhasService,
    private titleService: TitleService
  ) {
    {
      this.localeService.use('pt-br');
      this.bsConfig = Object.assign(
        {},
        { containerClass: 'theme-dark-blue' },
        { adaptivePosition: true },
        { showWeekNumbers: false }
      );
    }
    this.pnotifyService.getPNotify();
  }

  ngOnInit(): void {
    this.registrarAcesso();
    this.onEventSubscription();
    this.getFormFilters();
    this.setFormFilter();
    this.titleService.setTitle('Busqueda de clientes');
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  getFormFilters(): void {
    if (!this.idLista) {
      this.setoresLinhaService
        .getLinhas()
        .pipe(finalize(() => {}))
        .subscribe((response) => {
          if (response.status === 200) {
            this.linhas = response.body['data'];
          }
        });
      this.comercialService
        .getVendedores()
        .pipe()
        .subscribe((response: any) => {
          if (response.responseCode === 200) {
            this.vendedores = response.result;
          }
        });
    }
  }

  setFormFilter(): void {
    const formValue = this.checkRouterParams();
    this.formFilter = this.formBuilder.group({
      pesquisa: [formValue['pesquisa']],
      linha: [formValue['linha']],
      gerente: [formValue['gerente']],
      dataFinal: [formValue['dataFinal']],
      dataInicio: [formValue['dataInicio']],
      vendedor: [formValue['vendedor']],
      tipoPessoa: [formValue['tipoPessoa'], Validators.required],
      buscarPor: [formValue['buscarPor'], Validators.required],
      tipoData: [formValue['tipoData'], Validators.required],
      situacao: [formValue['situacao'], Validators.required],
      pagina: [formValue['pagina']],
      registros: [formValue['registros'], Validators.required],
    });
  }

  checkRouterParams(): Object {
    let formValue = {
      pesquisa: null,
      buscarPor: 1,
      tipoData: 1,
      situacao: 'Ativo',
      tipoPessoa: 'T',
      pagina: 1,
      linha: null,
      registros: this.itemsPerPage,
    };
    const queryParams = this.activatedRoute.snapshot.queryParams;
    if (Object.keys(queryParams).length > 0) {
      let params = atob(queryParams['q']);
      params = JSON.parse(params);
      this.setSubmittedSearch();
      this.search(params);

      if (params['registros']) {
        this.itemsPerPage = params['registros'];
      }

      Object.keys(formValue).forEach((formKey) => {
        Object.keys(params).forEach((paramKey) => {
          if (formKey == paramKey && formValue[formKey] != params[paramKey]) {
            if (!isNaN(Number(params[paramKey]))) {
              formValue[formKey] = Number(params[paramKey]);
            } else {
              formValue[formKey] = params[paramKey];
            }
          }
        });
      });
    }

    const params = this.activatedRoute.snapshot.params;
    if (params.hasOwnProperty('id')) {
      this.idLista = params.id;
    }

    return formValue;
  }

  setOrderBy(column: string): void {
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
    this.onFilter();
  }

  onAdvancedFilter(): void {
    this.showAdvancedFilter = !this.showAdvancedFilter;
  }

  filterByStatus(status: string): void {
    this.formFilter.get('situacao').setValue(status);
    this.onFilter();
  }

  onFilter(): void {
    this.contatosService.onEventLoading(true);
    let params = this.formFilter.value;
    params['orderBy'] = this.orderBy;
    params['orderType'] = this.orderType;

    this.itemsPerPage = this.formFilter.value['registros'];
    this.currentPage = 1;
    this.setRouterParams(params);
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

  search(params: any): void {
    if (this.searchSubmitted) {
      this.loaderNavbar = true;
      this.dataLoaded = false;
      this.clientes = [];
      this.buscandoPor = params['buscarPor'];
      this.tiposDatas = params['tipoData'];
      this.pesquisa = params['pesquisa'];

      this.clientesService
        .getClientes(params)
        .pipe(
          finalize(() => {
            this.loaderNavbar = false;
            this.dataLoaded = true;
          })
        )
        .subscribe({
          next: (response: any) => {
            if (response['responseCode'] === 200) {
              const clientes = response.result.analitico;
              // clientes.map(function (el: any) {
              //   el.checked = 0;
              // });
              this.clientes = clientes.slice(0, this.itemsPerPage);
              this.allClientes =
                response['result']['sintetico'][1]['quantidade'];
              this.totalClientes = this.clientes[0]['total'];
            } else if (response['responseCode'] === 204) {
              this.ativos = 0;
              this.inativos = 0;
              this.potencial = 0;
              this.arquivados = 0;
              this.pnotifyService.notice('Nenhum registro encontrado!');
            }
          },
          error: (error: any) => {
            this.pnotifyService.error();
          }
        });
    }
  }

  onToggleAll() {
    this.toggleAll = !this.toggleAll;
    this.clientes.map((cliente) => (cliente.checked = this.toggleAll));
    this.postVinculoAllClientes();
  }

  onCheckClientes(cliente: any): void {
    cliente.checked = !cliente.checked;
    this.postVinculoClientes(cliente);
  }

  postVinculoAllClientes(cliente?) {
    let _params = {};
    this.contatosService.onEventLoading(true);
    _params['filtros'] = this.formFilter.value;
    _params['idLista'] = this.idLista;
    if (this.toggleAll) {
      _params['selectAll'] = '1';
    } else {
      _params['selectAll'] = '0';
    }
    this.contatosService
      .postVinculoClientes(_params)
      .pipe(
        finalize(() => {
          this.contatosService.onEventLoading(false);
        })
      )
      .subscribe({
        next: (response: any) => {
          this.pnotifyService.success();
        },
        error: (error) => {
          this.pnotifyService.error();
        }
      });
  }
  postVinculoClientes(cliente?) {
    let _params = {};
    this.contatosService.onEventLoading(true);
    _params['situacao'] = cliente.checked == true ? 1 : 0;
    _params['codCliente'] = cliente.codCliente;
    _params['idLista'] = this.idLista;
    this.contatosService
      .postVinculoClientes(_params)
      .pipe(
        finalize(() => {
          this.contatosService.onEventLoading(false);
        })
      )
      .subscribe({
        next: (response: any) => {
          this.pnotifyService.success();
        },
        error: (error) => {
          this.pnotifyService.error();
        }
      });
  }

  classStatusBorder(status: string): string {
    let borderClass: string;

    if (status == 'Ativo') {
      borderClass = 'border-success';
    } else if (status == 'Inativo') {
      borderClass = 'border-danger';
    } else if (status == 'Potenci') {
      borderClass = 'border-primary';
    } else if (status == 'Arquivo') {
      borderClass = 'border-secondary';
    }

    return borderClass;
  }

  onEventSubscription() {
    this.$subscriptions[2] = this.contatosService.event.subscribe(
      (response: event) => {
        if (response.filter === true) {
          this.onFilter();
        }
      }
    );
  }

  onPageChanged(event: PageChangedEvent) {
    if (this.formFilter.value['pagina'] != event.page) {
      this.resetClienteSelecionado();
      this.formFilter.value['pagina'] = event.page;
      this.onFilter();
    }
  }

  onPreCadastroCpfCnpj() {
    let pesquisa = this.pesquisa.replace(/\D/g, '');

    if (pesquisa.length === 11) {
      return { cpf: pesquisa };
    } else if (pesquisa.length === 14) {
      return { cnpj: pesquisa };
    }

    return {};
  }

  handleCounter(value: any) {
    return value.toFixed(0);
  }

  resetClienteSelecionado() {
    this.clienteSelecionado = null;
  }
}
