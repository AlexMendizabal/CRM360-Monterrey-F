import { ComercialCadastrosMateriaisGrupoService } from './../../../cadastros/materiais/grupos/grupos.service';
import { Kanban } from './../models/kanban';
import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
  AbstractControl,
} from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';

// ngx-bootstrap
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { ptBrLocale } from 'ngx-bootstrap/locale';

defineLocale('pt-br', ptBrLocale);

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialGestaoAssociacoesCoordenadoresEscritoriosService } from './../../../gestao/associacoes/coordenadores-escritorios/coordenadores-escritorios.service';
import { ComercialVendedoresService } from './../../../services/vendedores.service';
import { AuthService } from './../../../../../shared/services/core/auth.service';
import { ComercialService } from './../../../comercial.service';
import { DateService } from './../../../../../shared/services/core/date.service';
import { AtividadesService } from './../../../../../shared/services/requests/atividades.service';
import { ComercialKanbanPedidosService } from './../pedidos.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { EscritoriosService } from 'src/app/shared/services/requests/escritorios.service';

// Interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { JsonResponse } from 'src/app/models/json-response';

@Component({
  selector: 'comercial-kanban-pedidos-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class ComercialKanbanPedidosListaComponent implements OnInit {
  @ViewChild('scrollToFilter', {}) scrollToFilter: ElementRef;

  private user = this.authService.getCurrentUser();

  loaderNavbar = false;
  loaderFullScreen = true;

  profile: any = {};

  breadCrumbTree: Array<Breadcrumb> = [];

  activatedRouteSubscription: Subscription;

  form: FormGroup;

  showDashboard = false;
  showFilter = false;
  showPermissionDenied = false;

  red: boolean = false;
  yellow: boolean = false;
  green: boolean = false;

  codCliente: number;
  coordenadores: Array<any> = [];
  vendedores: Array<any> = [];
  vendedoresTotal: Array<any> = [];
  filteredVendedores: Array<any> = [];
  gerencia: Array<any> = [];
  empresa: Array<any> = [];

  linhas: Array<any> = [];

  emAberto: Array<any> = [];
  transferidos: Array<any> = [];
  emLiberacao: Array<any> = [];
  aguardandoFaturamento: Array<any> = [];
  aguardandoEntrega: Array<any> = [];

  viewVendedor = false;

  idEscritorio: number;
  idVendedor: number;
  nomeVendedor: string;
  nomeEscritorio: string;

  itemsPerPage = 50;
  currentPage = 1;
  maxSize = 10;

  clientesPagination: Array<any> = [];
  detalhes = false;

  dadosLoaded = false;
  dadosEmpty = false;

  orderType;
  orderBy;

  bsConfig: Partial<BsDatepickerConfig>;

  dadosFiltrados: Array<any> = [];

  constructor(
    private router: Router,
    private location: Location,
    private formBuilder: FormBuilder,
    private pnotifyService: PNotifyService,
    private activatedRoute: ActivatedRoute,
    private atividadesService: AtividadesService,
    private kanbanPedidosService: ComercialKanbanPedidosService,
    private dateService: DateService,
    private localeService: BsLocaleService,
    private comercialService: ComercialService,
    private authService: AuthService,
    private comercialVendedoresService: ComercialVendedoresService,
    private gestaoAssociacoesService: ComercialGestaoAssociacoesCoordenadoresEscritoriosService,
    private materiaisGrupoService: ComercialCadastrosMateriaisGrupoService,
    private titleService: TitleService,
    private escritoriosService: EscritoriosService
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
    this.titleService.setTitle('Pedidos');
    this.registrarAcesso();
    this.setFormFilter();
    this.getPerfil();
    this.getFilteredValues();
    this.setBreadCrumb();
    this.loadingFilters();
  }

  setBreadCrumb(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/comercial/home',
        },
        {
          descricao: 'Kanban',
          routerLink: `/comercial/kanban/${params.idSubModulo}`,
        },
        {
          descricao: 'Pedidos',
        },
      ];
    });
  }

  registrarAcesso() {
    this.atividadesService.registrarAcesso().subscribe();
  }

  setFormFilter() {
    const formValue: any = this.checkRouterParams();

    this.form = this.formBuilder.group({
      dataInicial: [
        formValue.dataInicial
          ? formValue.dataInicial
          : this.dateService.getFirstDayMonth(),
        [Validators.required],
      ],
      dataFinal: [
        formValue.dataFinal
          ? formValue.dataFinal
          : this.dateService.getLastDayMonth(),
        [Validators.required],
      ],
      codVendedor: [formValue.codVendedor],
      codGerencia: [formValue.codGerencia],
      codEmpresa: [formValue.codEmpresa],
      codLinha: [formValue.codLinha],
      cliente: [formValue.cliente],
    });

    this.checkValuesGerente();
  }

  checkRouterParams() {
    let formValue = {
      dataInicial: this.dateService.getFirstDayMonth(),
      dataFinal: this.dateService.getLastDayMonth(),
      codEmpresa: '',
      codLinha: '',
      codGerencia: '',
      codVendedor: '',
      cliente: '',
    };

    this.activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (queryParams: any) => {
        if (Object.keys(queryParams).length > 0) {
          let params: any = atob(queryParams['q']);
          params = JSON.parse(params);
          this.search(params);

          this.showFilter = false;
          this.showDashboard = true;

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
          this.showFilter = true;
          this.showDashboard = false;
        }
      }
    );
    this.activatedRouteSubscription.unsubscribe();

    return formValue;
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
    this.dadosFiltrados = [];
    this.dadosLoaded = false;
    this.dadosEmpty = true;

    this.emAberto = [];
    this.transferidos = [];
    this.emLiberacao = [];
    this.aguardandoFaturamento = [];
    this.aguardandoEntrega = [];

    this.kanbanPedidosService
      .getCards(params)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
          this.dadosLoaded = true;
        })
      )
      .subscribe({
        next: (response: any) => {
          console.log(response);
          if (
            response[0].hasOwnProperty('success') &&
            response[0].success === true
          ) {
            this.emAberto = response[0].data;
            this.dadosLoaded = true;
            this.dadosEmpty = false;
          }

          if (
            response[1].hasOwnProperty('success') &&
            response[1].success === true
          ) {
            this.transferidos = response[1].data;
            this.dadosLoaded = true;
            this.dadosEmpty = false;
          }

          if (
            response[2].hasOwnProperty('success') &&
            response[2].success === true
          ) {
            this.emLiberacao = response[2].data;
            this.dadosLoaded = true;
            this.dadosEmpty = false;
          }

          if (
            response[3].hasOwnProperty('success') &&
            response[3].success === true
          ) {
            this.aguardandoFaturamento = response[3].data;
            this.dadosLoaded = true;
            this.dadosEmpty = false;
          }

          if (
            response[4].hasOwnProperty('success') &&
            response[4].success === true
          ) {
            this.aguardandoEntrega = response[4].data;
            this.dadosLoaded = true;
            this.dadosEmpty = false;
          } else if (
            (response[0].hasOwnProperty('success') ||
              response[1].hasOwnProperty('success') ||
              response[2].hasOwnProperty('success') ||
              response[3].hasOwnProperty('success') ||
              response[4].hasOwnProperty('success')) &&
            (response[0].success === false ||
              response[1].success === false ||
              response[2].success === false ||
              response[3].success === false ||
              response[4].success === false)
          ) {
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
  }

  setRouterParams(params: any) {
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
    return _params;
  }

  // Get perfil
  getPerfil() {
    this.comercialService.getPerfil().subscribe({
      next: (response: any) => {
        if (response.responseCode === 200) {
          this.profile = response.result;
          if (
            this.profile.coordenador === true ||
            this.profile.gestor === true
          ) {
            this.getVendedores();
            this.form.controls.codGerencia.setValue('');
            this.form.controls.codGerencia.updateValueAndValidity();
          } else if (
            this.profile.vendedor === true
            // this.profile.hasVinculoOperadores === true
          ) {
            this.viewVendedor == true;
            this.getVinculoOperadores();
            this.form.controls.codVendedor.setValue(
              parseInt(this.user.info.idVendedor)
            );
            this.form.controls.codVendedor.updateValueAndValidity();
            this.form.controls.codGerencia.setValue('');
            this.form.controls.codGerencia.updateValueAndValidity();
            this.showDashboard = true;
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

  onChangeEscritorio(event: any, reset: boolean) {
    if (this.viewVendedor == false) {
      if (reset == true) {
        this.form.controls.codVendedor.reset();
        this.form.controls.codVendedor.setValue('');
        this.vendedores = this.vendedoresTotal;
      }
      this.filteredVendedores = this.vendedores.filter(
        (value: any) => value.idEscritorio == this.form.value.codGerencia
      );

      this.filteredVendedores.unshift({
        id: '',
        nome: 'EXIBIR TODOS',
      });
      this.onChangeVendedores();

      if (this.form.value.codGerencia == '') {
        this.vendedores = this.vendedoresTotal;
      }
    }
  }

  onChangeVendedores(): void {
    this.vendedores = this.filteredVendedores;
  }

  checkValuesGerente(): void {
    if (
      this.form.value.codGerencia !== '' &&
      this.form.value.codGerencia !== null
    ) {
      this.onChangeEscritorio(this.form.value.codGerencia, false);
    }
  }

  getFilteredValues() {
    this.getGestores();
    this.getEmpresas();
    this.getLinhas();
  }

  loadingFilters() {
    this.form.controls.codEmpresa.disable();
    this.form.controls.codLinha.disable();
    this.form.controls.codGerencia.disable();
    this.form.controls.codVendedor.disable();
  }

  // Get Selects
  getLinhas(): void {
    this.materiaisGrupoService.getFilterValues().subscribe((response: any) => {
      if (response[0].responseCode === 200) {
        this.linhas = response[0].result;

        this.linhas.unshift({
          id: '',
          descricao: 'EXIBIR TODOS',
        });
        this.form.controls.codLinha.enable();
      } else {
        this.pnotifyService.error();
        this.location.back();
      }
    });
  }

  getEmpresas() {
    this.comercialService.getEmpresas({ tipo: 'faturamento' }).subscribe({
      next: (response: any) => {
        if (response.responseCode === 200) {
          this.empresa = response.result;

          this.empresa.unshift({
            idEmpresa: '',
            nomeEmpresa: 'EXIBIR TODOS',
          });

          this.form.controls.codEmpresa.enable();
        } else {
          this.pnotifyService.error();
          this.location.back();
        }
      },
      error: (error: any) => {
        this.pnotifyService.error();
        this.location.back();
      }
    });
  }

  getGestores() {
    this.escritoriosService.getEscritorios().subscribe({
      next: (response: any) => {
        if (response.responseCode === 200) {
          this.coordenadores = response.result;

          this.coordenadores.unshift({
            codEscritorio: '',
            nomeEscritorio: 'EXIBIR TODOS',
          });
          this.form.controls.codGerencia.enable();
        } else {
          this.pnotifyService.error();
          this.location.back();
        }
      },
      error: (error: any) => {
        this.pnotifyService.error();
        this.location.back();
      }
    });
  }

  getVendedores() {
    this.comercialVendedoresService
      .getVendedores()
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          this.vendedores = response['result'];
          this.vendedoresTotal = this.vendedores;
          this.vendedores.unshift({
            id: '',
            nome: 'EXIBIR TODOS',
          });
          this.form.controls.codVendedor.enable();
        },
        error: (error: any) => {
          this.pnotifyService.error();
          this.location.back();
        }
      });
  }

  getVinculoOperadores(): void {
    this.comercialVendedoresService
      .getVinculoOperadores()
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe((response: any) => {
        if (response.responseCode === 200) {
          this.vendedores = response.result;
          this.form.controls.codVendedor.enable();
          this.form.controls.codGerencia.disable();
          this.form.controls.codGerencia.setValue('');
          this.form.controls.codGerencia.updateValueAndValidity();
        }
      });
  }

  // Tratamento de erros
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

  handleFormFieldsError() {
    this.pnotifyService.error();
    this.location.back();
  }

  onRefresh() {
    this.setFormFilter();
  }
}
