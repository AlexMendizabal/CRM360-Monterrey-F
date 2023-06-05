import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';



// ngx-bootstrap
import { PageChangedEvent } from 'ngx-bootstrap/pagination';

// Services
import { ComercialClientesService } from 'src/app/modules/comercial/services/clientes.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { ComercialClientesCadastroDadosFaturamentoFormularioService } from '../cadastro/dados-faturamento/formulario/formulario.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { DetailPanelService } from 'src/app/shared/templates/detail-panel/detal-panel.service';

// Interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { JsonResponse } from 'src/app/models/json-response';

@Component({
  selector: 'comercial-clientes-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class ComercialClientesListaComponent implements OnInit, OnDestroy {
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
    subtitleBorder: true,
  };

  activatedRouteSubscription: Subscription;

  showDetailPanelSubscription: Subscription;
  showDetailPanel = false;

  setorAtividades: any = [
    {
      id: 'T',
      descricao: 'EXIBIR TODOS',
    },
  ];

  dataLoaded = false;
  dadosCadastraisLoaded = false;
  dadosCadastraisEmpty = false;
  contatosLoaded = false;
  contatosEmpty = false;
  searchSubmitted = false;
  showAdvancedFilter = true;

  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  matricula = this.currentUser['info']['matricula'];

  ativos = 0;
  inativos = 0;
  potencial = 0;
  arquivados = 0;

  countoAtivos: number;
  countoInativos: number;
  countoPotencial: number;
  countoArquivados: number;

  formFilter: FormGroup;
  buscandoPor: number;
  pesquisa: string;
  orderBy = 'codCliente';
  orderType = 'desc';

  maxSize = 10;
  itemsPerPage = 50;
  currentPage = 1;
  totalItems = 0;

  clientes: any = [];
  clientesPagination: any = [];

  clienteSelecionado: number;
  dadosCadastrais: any = {};
  contatos: any = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private clientesService: ComercialClientesService,
    private formBuilder: FormBuilder,
    private pnotifyService: PNotifyService,
    private atividadesService: AtividadesService,
    private dadosFaturamentoService: ComercialClientesCadastroDadosFaturamentoFormularioService,
    private titleService: TitleService,
    private detailPanelService: DetailPanelService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit(): void {
    this.registrarAcesso();
    this.getFormFilters();
    this.setFormFilter();
    this.titleService.setTitle('Busqueda de clientes');
    this.onDetailPanelEmitter();
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

        if (this.showDetailPanel === false) {
          this.onCloseDetailPanel();
        }
      }
    );
  }

  getFormFilters(): void {
    this.dadosFaturamentoService
      .getSetorAtividades()
      .pipe(
        finalize(() => {
          this.setorAtividades.unshift({
            id: 'T',
            descricao: 'EXIBIR TODOS',
          });
        })
      )
      .subscribe((response: any) => {
        if (response['responseCode'] === 200) {
          this.setorAtividades = response['result'];
        }
      });
  }

  setFormFilter(): void {
    const formValue = this.checkRouterParams();

    this.formFilter = this.formBuilder.group({
      pesquisa: [formValue['pesquisa']],
      buscarPor: [formValue['buscarPor'], Validators.required],
      situacao: [formValue['situacao'], Validators.required],
      setorAtividade: [formValue['setorAtividade'], Validators.required],
      tipoPessoa: [formValue['tipoPessoa'], Validators.required],
      grupoEconomico: [formValue['grupoEconomico'], Validators.required],
      segurado: [formValue['segurado'], Validators.required],
      carteira: [formValue['carteira'], Validators.required],
      pagina: [formValue['pagina']],
      registros: [formValue['registros'], Validators.required],
      id_group_econ: [formValue['grupoEconomico'], Validators.required], // Se Agrega este campo
    });
  }
  searchInputValue: string;

  checkRouterParams(): Object {
    var aux_cartera;
    if (this.matricula == 1){
      aux_cartera ='T'
    }else{
      aux_cartera = 'S'
    }
    let formValue = {
      pesquisa: this.searchInputValue, // aquí se actualizaría el valor de pesquisa
      buscarPor: 1,
      situacao: 'T',
      setorAtividade: 'T',
      tipoPessoa: 'T',
      grupoEconomico: 'T',
      segurado: 'T',
      carteira: aux_cartera,
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

          if (params['registros']) {
            this.itemsPerPage = params['registros'];
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
        } else {
          this.listStatus();
        }
      }
    );
    this.activatedRouteSubscription.unsubscribe();

    return formValue;
  }

  listStatus(): void {
    this.clientesService.getStatus().subscribe({
      next: (response: any) => {
        if (response['responseCode'] === 200) {
          this.setStatus(response['result']);
        }
      },
      error: (error: any) => {
        this.pnotifyService.error();
      }
    });
  }

  setStatus(status: any): void {
    for (let i = 0; i < status.length; i++) {
      if (status[i]['situacao'] == 'Ativo') {
        this.ativos = status[i]['quantidade'];
      } else if (status[i]['situacao'] == 'Inativo'|| status[i]['situacao'] == null) {
        this.inativos += status[i]['quantidade'];
      } else if (status[i]['situacao'] == 'Potenci') {
        this.potencial = status[i]['quantidade'];
      } else if (status[i]['situacao'] == 'Arquivo') {
        this.arquivados = status[i]['quantidade'];
      }
    }
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
      this.detailPanelService.hide();
      this.clientes = [];
      this.buscandoPor = params['buscarPor'];
      this.pesquisa = params['pesquisa'];

      this.clientesService
        .getClientes(params)
        .pipe(
          finalize(() => {
            this.loaderNavbar = false;
            this.dataLoaded = true;
          })
        )
        .subscribe(
          (response: any) => {
            if (response['responseCode'] === 200) {
              this.clientes = response['result']['analitico'].slice(
                0,
                this.itemsPerPage
              );
              this.totalItems = this.clientes[0]['total'];
              this.setStatus(response['result']['sintetico']);
            } else if (response['responseCode'] === 204) {
              this.ativos = 0;
              this.inativos = 0;
              this.potencial = 0;
              this.arquivados = 0;
            }
          },
          (error: any) => {
            this.pnotifyService.error();
          }
        );
    }
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

  viewRegister(cliente: any): void {
    if (cliente['podeAcessar'] == 1 || cliente['podeAcessar'] == 0) {
      this.router.navigate(['../detalhes', cliente.codCliente], {
        relativeTo: this.activatedRoute,
        
      });
    } else {
      this.pnotifyService.notice('Este cliente no pertenece a su cartera.');
    }
  }

  viewDetails(cliente: any): void {
    this.detailPanelService.loadedFinished(false);

    this.clienteSelecionado = cliente.codCliente;

    this.dadosCadastraisLoaded = false;
    this.dadosCadastraisEmpty = false;

    this.contatosLoaded = false;
    this.contatosEmpty = false;

    this.clientesService
      .getDetalhes(cliente.codCliente)
      .pipe(
        finalize(() => {
          this.dadosCadastraisLoaded = true;
        })
      )
      .subscribe((response: JsonResponse) => {
        if (response.success === true) {
          this.dadosCadastrais = response.data;
        } else {
          this.dadosCadastraisEmpty = true;
        }
      });

    this.clientesService
      .getContatosResumido(cliente.codCliente)
      .subscribe((response: any) => {
        this.contatosLoaded = true;

        if (response['responseCode'] === 200) {
          if (Object.keys(response['result']).length > 0) {
            this.contatos = response['result'];
          } else {
            this.contatosEmpty = true;
          }
        } else {
          this.contatosEmpty = true;
        }
      });
  }

  onCloseDetailPanel() {
    this.resetClienteSelecionado();

    setTimeout(() => {
      this.dadosCadastraisLoaded = false;
      this.dadosCadastraisEmpty = false;
      this.dadosCadastrais = {};

      this.contatosEmpty = false;
      this.contatosLoaded = false;
      this.contatos = [];
    }, 500);
  }

  onPageChanged(event: PageChangedEvent) {
    if (this.formFilter.value['pagina'] != event.page) {
      this.detailPanelService.hide();
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
