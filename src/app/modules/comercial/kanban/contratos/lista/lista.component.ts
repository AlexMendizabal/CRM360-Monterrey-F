import { ComercialCadastrosMateriaisGrupoService } from './../../../cadastros/materiais/grupos/grupos.service';
import { Contratos } from './../models/contratos';
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
import { ComercialKanbanContratosService } from './../contratos.service';

// Interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { JsonResponse } from 'src/app/models/json-response';

@Component({
  selector: 'comercial-kanban-contratos-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class ComercialKanbanContratosListaComponent implements OnInit {
  @ViewChild('scrollToFilter', {}) scrollToFilter: ElementRef;

  private user = this.authService.getCurrentUser();

  currentUser: any = JSON.parse(localStorage.getItem('currentUser'));
  idUsuario: any = this.currentUser['info']['id'];

  loaderNavbar = false;
  loaderFullScreen = true;

  profile: any = {};

  breadCrumbTree: Array<Breadcrumb> = [];

  activatedRouteSubscription: Subscription;

  form: FormGroup;

  showDashboard = false;
  showFilter = false;
  showPermissionDenied = false;

  codCliente: number;
  coordenadores: Array<any> = [];
  vendedores: Array<any> = [];
  unidades: Array<any> = [];

  linhas: Array<any> = [];
  contratos: Array<any> = [];
  faturados: Array<any> = [];
  pendentes: Array<any> = [];

  idEscritorio: number;
  idVendedor: number;
  nomeVendedor: string;
  nomeEscritorio: string;

  itemsPerPage = 50;
  currentPage = 1;
  maxSize = 10;

  clientesPagination: Array<any> = [];
  detalhes = false;

  red: boolean = false;
  yellow: boolean = false;
  green: boolean = false;

  dadosLoaded = false;
  dadosEmpty = false;

  orderType;
  orderBy;

  dadosFiltrados: Array<any> = [];

  constructor(
    private router: Router,
    private location: Location,
    private formBuilder: FormBuilder,
    private pnotifyService: PNotifyService,
    private activatedRoute: ActivatedRoute,
    private atividadesService: AtividadesService,
    private kanbanContratosService: ComercialKanbanContratosService,
    private dateService: DateService,
    private localeService: BsLocaleService,
    private comercialService: ComercialService,
    private authService: AuthService,
    private comercialVendedoresService: ComercialVendedoresService,
    private gestaoAssociacoesService: ComercialGestaoAssociacoesCoordenadoresEscritoriosService,
    private materiaisGrupoService: ComercialCadastrosMateriaisGrupoService
  ) {
    this.pnotifyService.getPNotify();
    this.localeService.use('pt-br');
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
          descricao: 'Kanban Contratos',
        },
      ];
    });
  }

  ngOnInit() {
    this.registrarAcesso();
    this.setFormFilter();
    this.getPerfil();
    this.getVendedores();
    this.getGestores();
    this.setBreadCrumb();
    this.getFilterValues();
  }

  registrarAcesso() {
    this.atividadesService.registrarAcesso().subscribe();
  }

  setFormFilter(): void {
    this.form = this.formBuilder.group({
      dataInicial: [this.dateService.getFirstDayMonth()],
      dataFinal: [this.dateService.getToday()],
      codSituacao: '1',
      codVendedor: [null],
      codGerencia: [null],
      codLinha: [null],
      orderBy: [null],
      orderType: [null],
      pagina: [null],
      // registros: [null, Validators.required],
    });
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
    this.loaderNavbar = false;
    this.dadosFiltrados = [];
    this.dadosLoaded = false;
    this.dadosEmpty = false;

    this.kanbanContratosService
      .getCards(params)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
          this.dadosLoaded = true;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (
            response[0].hasOwnProperty('success') &&
            response[0].success === true
          ) {
            this.contratos = response[0].data;
            this.dadosEmpty = true;
          }

          if (
            response[0].hasOwnProperty('success') &&
            response[0].success === true
          ) {
            this.faturados = response[1].data;
            this.dadosEmpty = true;
          }

          if (
            response[0].hasOwnProperty('success') &&
            response[0].success === true
          ) {
            this.pendentes = response[2].data;
            this.dadosEmpty = true;
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
  }

  getFilterValues(): void {
    this.materiaisGrupoService
      .getFilterValues()
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe((response: any) => {
        if (response[0].responseCode === 200) {
          this.linhas = response[0].result;
        } else {
          this.pnotifyService.error();
          this.location.back();
        }
      });
  }

  setRouterParams(params: any) {
    if (params === null) {
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
      });
    } else {
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: { q: btoa(JSON.stringify(params)) },
        queryParamsHandling: 'merge',
      });
    }
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

  // Get perfil
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
            if (
              this.profile.coordenador === true ||
              this.profile.gestor === true ||
              (this.profile.vendedor === true &&
                this.profile.coordenador === false &&
                this.profile.gestor === false &&
                this.profile.hasVinculoOperadores === true)
            ) {
              this.checkRouterParams();
            } else if (
              this.profile.vendedor === true &&
              this.profile.coordenador === false &&
              this.profile.gestor === false &&
              this.profile.hasVinculoOperadores === false
              // this.profile.hasVinculoOperadores === true
            ) {
              this.setRouterParams([]);
              this.profileDisabled();
              this.idVendedor = this.user.info.idVendedor;
              this.idEscritorio = this.user.info.idEscritorio;
              this.form
                .get('codVendedor')
                .setValue(parseInt(this.user.info.idVendedor));
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

  profileDisabled() {
    this.form.get('codVendedor').disable();
    this.form.get('codGerencia').disable();
    this.form.get('codUnidade').disable();
  }

  checkRouterParams() {
    let formValue = {
      idEscritorio: null,
      idVendedor: null,
      nomeEscritorio: null,
      nomeVendedor: null,
    };

    this.activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (queryParams: any) => {
        if (Object.keys(queryParams).length > 0) {
          let params: any = atob(queryParams['q']);
          params = JSON.parse(params);

          this.idEscritorio = parseInt(params.idEscritorio);
          this.idVendedor = parseInt(params.idVendedor);
          this.nomeEscritorio = params.nomeEscritorio;
          this.nomeVendedor = params.nomeVendedor;

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
  }

  getGestores() {
    this.gestaoAssociacoesService.getListaCoordenadoresEscritorios().subscribe({
      next: (response: any) => {
        if (response['responseCode'] === 200) {
          this.coordenadores = response['result']['coordenadores'];
          this.unidades = response['result']['escritorios'];
          // this.setFormBuilder();
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
        },
        error: (error: any) => {
          this.pnotifyService.error();
          this.location.back();
        }
      });
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

  handleFormFieldsError() {
    this.pnotifyService.error();
    this.location.back();
  }

  onRefresh() {
    // location.reload()

    this.onFilter();
  }
}
