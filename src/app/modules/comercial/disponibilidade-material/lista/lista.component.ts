import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl
} from '@angular/forms';
import { finalize, take, switchMap } from 'rxjs/operators';
import { Subscription, EMPTY } from 'rxjs';

// ngx-bootstrap
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { ptBrLocale } from 'ngx-bootstrap/locale';
defineLocale('pt-br', ptBrLocale);

// Interfaces
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialDisponibilidadeMaterialService } from '../disponibilidade-material.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { AuthService } from 'src/app/shared/services/core/auth.service';
import { DateService } from 'src/app/shared/services/core/date.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';

// Interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { JsonResponse } from 'src/app/models/json-response';
import { DisponibilidadeMaterial } from '../models/disponibilidade-material';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';

@Component({
  selector: 'comercial-disponibilidade-material-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss']
})
export class ComercialDisponibilidadeMaterialListaComponent implements OnInit {
  @ViewChild('scrollToFilter', {}) scrollToFilter: ElementRef;

  loaderNavbar = false;
  loaderFullScreen = true;

  breadCrumbTree: Array<Breadcrumb> = [
    {
      descricao: 'Home',
      routerLink: '/comercial/home'
    },
    {
      descricao: 'Disponibilidade de material'
    }
  ];

  subtitles: Array<Subtitles> = [
    {
      id: 1,
      text: 'Ativo',
      color: 'green'
    },
    {
      id: 2,
      text: 'Inativo',
      color: 'red'
    }
  ];

  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true
  };

  activatedRouteSubscription: Subscription;

  form: FormGroup;

  depositos: any = [];
  vendedores: any = [];
  situacoes: any = [];

  dados: any = [];
  dadosPagination: any = [];
  dadosEmpty: boolean;
  dadosLoaded = false;

  currentPage = 1;
  maxSize: number = 10;
  totalItems: number;
  itemsPerPage: number = 10;

  orderBy = 'nomeMaterial';
  orderType = 'asc';

  bsConfig: Partial<BsDatepickerConfig>;

  constructor(
    private router: Router,
    private location: Location,
    private formBuilder: FormBuilder,
    private pnotifyService: PNotifyService,
    private activatedRoute: ActivatedRoute,
    private localeService: BsLocaleService,
    private atividadesService: AtividadesService,
    private disponibilidadeMaterialService: ComercialDisponibilidadeMaterialService,
    private titleService: TitleService,
    private authService: AuthService,
    private dateService: DateService,
    private confirmModalService: ConfirmModalService
  ) {
    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false },
      { dateInputFormat: 'DD/MM/YYYY' }
    );
    this.pnotifyService.getPNotify();
  }

  ngOnInit(): void {
    this.registrarAcesso();
    this.getFilterValues();
    this.setFormFilter();
    this.titleService.setTitle('Disponibilidade de material');
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  getFilterValues(): void {
    this.disponibilidadeMaterialService
      .getFiltros()
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response[0].responseCode == 200) {
            this.depositos = response[0].result;

            this.depositos.unshift({
              idDeposito: 0,
              nomeDeposito: 'EXIBIR TODOS'
            });
          }

          if (response[1].responseCode == 200) {
            this.vendedores = response[1].result;
          }

          if (
            response[2].hasOwnProperty('success') &&
            response[2].success === true
          ) {
            this.situacoes = response[2].data;

            this.situacoes.unshift({
              id: 0,
              descricao: 'EXIBIR TODOS'
            });
          }
        },
        error: (error: any) => {
          this.handleError('Ocorreu um erro ao carregar filtros.');
        }
      });
  }

  setFormFilter(): void {
    const formValue: any = this.checkRouterParams();

    this.form = this.formBuilder.group({
      tipoData: [formValue.tipoData, [Validators.required]],
      dataInicial: [formValue.dataInicial, [Validators.required]],
      dataFinal: [formValue.dataFinal, [Validators.required]],
      material: [formValue.material],
      codDeposito: [formValue.codDeposito],
      cliente: [formValue.cliente],
      vendedor: [formValue.vendedor],
      situacao: [formValue.situacao],
      registros: [formValue.registros]
    });
  }

  checkRouterParams(): Object {
    let formValue = {
      tipoData: 1,
      dataInicial: this.dateService.getFirstDayMonth(),
      dataFinal: this.dateService.getLastDayMonth(),
      codDeposito: 0,
      cliente: null,
      material: null,
      vendedor: this.authService.getCurrentUser().info.idVendedor,
      situacao: 0,
      registros: this.itemsPerPage
    };

    this.activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (queryParams: any) => {
        if (Object.keys(queryParams).length > 0) {
          let params = atob(queryParams['q']);
          params = JSON.parse(params);
          this.search(params);

          Object.keys(formValue).forEach(formKey => {
            Object.keys(params).forEach(paramKey => {
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

  onFieldRequired(field: string): string {
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

  onFilter(): void {
    if (this.form.valid) {
      this.setRouterParams(this.verificaParams());
      this.itemsPerPage = this.form.value.registros;
      this.currentPage = 1;

      this.scrollToFilter.nativeElement.scrollIntoView({
        behavior: 'instant'
      });
    }
  }

  setRouterParams(params: any): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { q: btoa(JSON.stringify(params)) }
    });
    this.search(params);
  }

  verificaParams(): Object {
    let params: any = {};

    if (this.form.value.tipoData) {
      params.tipoData = this.form.value.tipoData;
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

    if (this.form.value.codDeposito) {
      params.codDeposito = this.form.value.codDeposito;
    }

    if (this.form.value.cliente) {
      params.cliente = this.form.value.cliente;
    }

    if (this.form.value.material) {
      params.material = this.form.value.material;
    }

    if (this.form.value.vendedor) {
      params.vendedor = this.form.value.vendedor;
    }

    if (this.form.value.situacao) {
      params.situacao = this.form.value.situacao;
    }

    params.orderBy = this.orderBy;
    params.orderType = this.orderType;

    return params;
  }

  search(params: any): void {
    this.loaderNavbar = true;
    this.dados = [];
    this.dadosPagination = [];
    this.totalItems = 0;
    this.dadosLoaded = false;
    this.dadosEmpty = false;

    this.disponibilidadeMaterialService
      .getSolicitacoes(params)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.hasOwnProperty('success') && response.success === true) {
            this.dados = response.data;
            this.dadosPagination = this.dados.slice(0, this.itemsPerPage);
            this.totalItems = this.dados.length;
            this.dadosLoaded = true;
          } else if (
            response.hasOwnProperty('success') &&
            response.success === false
          ) {
            this.pnotifyService.notice(response.mensagem);
            this.dadosEmpty = true;
          } else {
            this.pnotifyService.error();
          }
        },
        error: (error: any) => {
          if (error.error.hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
      });
  }

  classStatusBorder(status: string): string {
    let borderClass: string;

    if (status == 'Ativo') {
      borderClass = 'border-success';
    } else if (status == 'Inativo') {
      borderClass = 'border-danger';
    }

    return borderClass;
  }

  onPageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.dadosPagination = this.dados.slice(startItem, endItem);
    this.scrollToFilter.nativeElement.scrollIntoView({
      behavior: 'instant'
    });
  }

  onEdit(data: any) {
    if (data.situacao == 'Ativo') {
      this.router.navigate(['../editar', data['codigo']], {
        relativeTo: this.activatedRoute
      });
    }
  }

  onCancel(disponibilidadeMaterial: DisponibilidadeMaterial) {
    if (disponibilidadeMaterial.situacao == 'Ativo') {
      let confirm$ = this.confirmModalService.showConfirm(
        'delete',
        'Confirmar cancelamento',
        'Deseja realmente prosseguir com o cancelamento da solicitação?',
        'Cancelar',
        'Confirmar'
      );

      confirm$
        .asObservable()
        .pipe(
          take(1),
          switchMap(result =>
            result
              ? this.disponibilidadeMaterialService.deleteSolicitacao(
                  disponibilidadeMaterial
                )
              : EMPTY
          )
        )
        .subscribe({
          next: (response: any) => {
            if (
              response.hasOwnProperty('success') &&
              response.success === true
            ) {
              this.onFilter();
              this.pnotifyService.success(response.mensagem);
            } else if (
              response.hasOwnProperty('success') &&
              response.success === false
            ) {
              this.pnotifyService.error(response.mensagem);
            } else {
              this.pnotifyService.error();
            }
          },
          error: (error: any) => {
            this.pnotifyService.error();
          }
        });
    }
  }

  onResetForm() {
    this.form.reset();

    this.dadosPagination = [];
    this.dadosLoaded = false;
    this.form.controls.codDeposito.setValue(0);
    this.form.controls.vendedor.setValue(
      this.authService.getCurrentUser()['info']['idVendedor']
    );
    this.form.controls.situacao.setValue(0);
    this.form.controls.registros.setValue(100);
  }

  handleError(message: string = null): void {
    this.pnotifyService.error(message);
    this.location.back();
  }
}
