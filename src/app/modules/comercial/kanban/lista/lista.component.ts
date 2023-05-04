import { ComercialControleEntregasService } from './../../controle-entregas/controle-entregas.service';
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
import { ComercialKanbanComercialService } from '../kanban-comercial.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { DateService } from './../../../../shared/services/core/date.service';
import { ComercialService } from './../../comercial.service';
import { AuthService } from './../../../../shared/services/core/auth.service';
import { ComercialVendedoresService } from './../../services/vendedores.service';
import { ComercialGestaoAssociacoesCoordenadoresEscritoriosService } from './../../gestao/associacoes/coordenadores-escritorios/coordenadores-escritorios.service';

// Interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { JsonResponse } from 'src/app/models/json-response';

@Component({
  selector: 'comercial-kanban-comercial-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class ComercialKanbanComercialListaComponent implements OnInit {
  @ViewChild('scrollToFilter', {}) scrollToFilter: ElementRef;

  private user = this.authService.getCurrentUser();

  currentUser: any = JSON.parse(localStorage.getItem('currentUser'));
  idUsuario: any = this.currentUser['info']['id'];

  loaderNavbar = false;
  loaderFullScreen = true;

  profile: any = {};

  breadCrumbTree: Array<Breadcrumb> = [
    {
      descricao: 'Home',
      routerLink: '/comercial/home',
    },
    {
      descricao: 'Kanban',
    },
  ];

  subtitles: Array<Subtitles> = [
    {
      text: 'Estoque suspenso',
      color: 'red',
    },
  ];

  activatedRouteSubscription: Subscription;

  form: FormGroup;

  showDashboard = false;
  showFilter = false;
  showPermissionDenied = false;

  codCliente: number;
  coordenadores: Array<any> = [];
  vendedores: Array<any> = [];
  unidades: Array<any> = [];

  emAberto: Array<Kanban> = [];
  transferidos: Array<Kanban> = [];
  emLiberacao: Array<Kanban> = [];
  aguardandoFaturamento: Array<Kanban> = [];
  aguardandoEntrega: Array<Kanban> = [];

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

  dados = [
    {
      cliente: 'MANETONI',
      vendedor: 'BARRA FUNDA CC - ALEX PIO',
      pedido: 1,
      valor: 30,
      linha: 'MALHA DE AÇO',
      peso: 600,
      unidade: 'ESC BARRA FUNDA',
      dataInicial: '01/10/2020',
      dataFInal: '30/10/2020',
      tempo: 8,
    },
    {
      cliente: 'STEEL AÇO',
      vendedor: 'BARRA FUNDA REPRES - MARCELO S',
      pedido: 2,
      valor: 30,
      linha: 'MALHA DE AÇO',
      peso: 500,
      unidade: 'ESC RIO DE JANEIRO',
      dataInicial: '15/10/2020',
      dataFInal: '30/10/2020',
      tempo: 2,
    },

    {
      cliente: 'ARCELOR MITTAL',
      vendedor: 'MTC CC - NATALIA MACEDO',
      pedido: 3,
      valor: 50,
      linha: 'MALHA DE AÇO',
      peso: 400,
      unidade: 'ESC TIETE',
      dataInicial: '20/10/2020',
      dataFInal: '25/10/2020',
      tempo: 11,
    },
  ];

  constructor(
    private router: Router,
    private location: Location,
    private formBuilder: FormBuilder,
    private pnotifyService: PNotifyService,
    private activatedRoute: ActivatedRoute,
    private atividadesService: AtividadesService,
    private kanbanComercialService: ComercialKanbanComercialService,
    private dateService: DateService,
    private localeService: BsLocaleService,
    private comercialService: ComercialService,
    private authService: AuthService,
    private comercialVendedoresService: ComercialVendedoresService,
    private gestaoAssociacoesService: ComercialGestaoAssociacoesCoordenadoresEscritoriosService
  ) {
    this.pnotifyService.getPNotify();
    this.localeService.use('pt-br');
  }

  ngOnInit() {
    this.registrarAcesso();
    this.setFormFilter();
    this.getPerfil();
    this.getVendedores();
    this.getGestores();
  }

  registrarAcesso() {
    this.atividadesService.registrarAcesso().subscribe();
  }

  setFormFilter(): void {
    this.form = this.formBuilder.group({
      dataInicial: [this.dateService.getFirstDayMonth()],
      dataFinal: [this.dateService.getLastDayMonth()],
      codVendedor: [null],
      codGerencia: [null],
      codProposta: [null],
      codUnidade: [null],
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

    this.kanbanComercialService
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
            this.emAberto = response[0].data;
            this.dadosEmpty = true;
          }

          if (
            response[1].hasOwnProperty('success') &&
            response[1].success === true
          ) {
            this.transferidos = response[1].data;
            this.dadosEmpty = true;
          }

          if (
            response[2].hasOwnProperty('success') &&
            response[2].success === true
          ) {
            this.emLiberacao = response[2].data;
            this.dadosEmpty = true;
          }

          if (
            response[3].hasOwnProperty('success') &&
            response[3].success === true
          ) {
            this.aguardandoFaturamento = response[3].data;
            this.dadosEmpty = true;
          }

          if (
            response[4].hasOwnProperty('success') &&
            response[4].success === true
          ) {
            this.aguardandoEntrega = response[4].data;
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
