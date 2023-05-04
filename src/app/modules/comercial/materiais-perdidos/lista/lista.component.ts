import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

// ngx-bootstrap
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { ptBrLocale } from 'ngx-bootstrap/locale';

defineLocale('pt-br', ptBrLocale);

// Services
import { ComercialMateriaisPerdidosService } from '../materiais-perdidos.service';
import { ComercialService } from '../../comercial.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { DateService } from 'src/app/shared/services/core/date.service';

// Interfaces
import { MaterialPerdido } from '../models/material-perdido';
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';

@Component({
  selector: 'comercial-materiais-perdidos-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss']
})
export class ComercialMateriaisPerdidosListaComponent implements OnInit {
  @ViewChild('scrollToFilter', {}) scrollToFilter: ElementRef;

  loaderFullScreen = true;
  loaderNavbar: boolean;

  breadCrumbTree: Array<Breadcrumb> = [
    {
      descricao: 'Home',
      routerLink: '/comercial/home'
    },
    {
      descricao: 'Materiais perdidos'
    }
  ];

  bsConfig: Partial<BsDatepickerConfig>;

  tableConfig: Partial<CustomTableConfig> = {
    isResponsive: true
  };

  activatedRouteSubscription: Subscription;

  showAdvancedFilter = true;
  form: FormGroup;
  empresas: any = [];
  orderBy = 'nrProposta';
  orderType = 'DESC';

  maxSize = 10;
  itemsPerPage = 300;
  currentPage = 1;
  totalItems: number;

  dados: Array<MaterialPerdido> = [];
  dadosPagination: Array<MaterialPerdido> = [];
  dadosLoaded = false;
  dadosEmpty = false;

  constructor(
    private localeService: BsLocaleService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private location: Location,
    private formBuilder: FormBuilder,
    private materiaisPerdidosService: ComercialMateriaisPerdidosService,
    private comercialService: ComercialService,
    private pnotifyService: PNotifyService,
    private atividadesService: AtividadesService,
    private titleService: TitleService,
    private dateService: DateService
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
    this.getFormFields();
    this.setFormFilter();
    this.titleService.setTitle('Materiais perdidos');
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  getFormFields(): void {
    this.comercialService
      .getEmpresas({ tipo: 'faturamento' })
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] === 200) {
            this.empresas = response['result'];

            this.empresas.unshift({
              idEmpresa: 0,
              nomeEmpresa: 'EXIBIR TODOS'
            });
          }
        },
        error: (error: any) => {
          this.pnotifyService.error();
          this.location.back();
        }
      });
  }

  setFormFilter(): void {
    const formValue: any = this.checkRouterParams();

    this.form = this.formBuilder.group({
      nomeConcorrente: [formValue.nomeConcorrente],
      codMaterialManetoni: [formValue.codMaterialManetoni],
      nrProposta: [formValue.nrProposta],
      codEmpresa: [formValue.codEmpresa],
      dataCadastroInicio: [formValue.dataCadastroInicio],
      dataCadastroFinal: [formValue.dataCadastroFinal],
      orderBy: [formValue.orderBy],
      orderType: [formValue.orderType],
      pagina: [formValue.pagina],
      registros: [formValue.registros, Validators.required]
    });

    this.checkOrder();
  }

  checkRouterParams(): Object {
    let formValue = {
      nomeConcorrente: null,
      codMaterialManetoni: null,
      nrProposta: null,
      codEmpresa: null,
      dataCadastroInicio: null,
      dataCadastroFinal: null,
      orderBy: this.orderBy,
      orderType: this.orderType,
      pagina: 1,
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
                if (
                  formKey === 'dataCadastroInicio' ||
                  formKey === 'dataCadastroFinal'
                ) {
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

  onFilter(): void {
    this.itemsPerPage = this.form.value.registros;
    this.currentPage = 1;
    this.setRouterParams(this.verificaParams());
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

    if (this.form.value.nomeConcorrente) {
      params.nomeConcorrente = this.form.value.nomeConcorrente;
    }

    if (this.form.value.codMaterialManetoni) {
      params.codMaterialManetoni = this.form.value.codMaterialManetoni;
    }

    if (this.form.value.nrProposta) {
      params.nrProposta = this.form.value.nrProposta;
    }

    if (this.form.value.codEmpresa) {
      params.codEmpresa = this.form.value.codEmpresa;
    }

    if (this.form.value.dataCadastroInicio) {
      params.dataCadastroInicio = this.dateService.convertToUrlDate(
        new Date(this.form.value.dataCadastroInicio)
      );
    }

    if (this.form.value.dataCadastroFinal) {
      params.dataCadastroFinal = this.dateService.convertToUrlDate(
        new Date(this.form.value.dataCadastroFinal)
      );
    }

    params.orderBy = this.form.value.orderBy;
    params.orderType = this.form.value.orderType;

    return params;
  }

  onAdvancedFilter(): void {
    this.showAdvancedFilter = !this.showAdvancedFilter;
  }

  onInput(): void {
    setTimeout(() => {
      if (
        this.form.value.dataCadastroInicio !== null ||
        this.form.value.dataCadastroFinal !== null
      ) {
        this.form.controls.dataCadastroInicio.setValidators([
          Validators.required
        ]);
        this.form.controls.dataCadastroFinal.setValidators([
          Validators.required
        ]);
      } else {
        this.form.controls.dataCadastroInicio.clearValidators();
        this.form.controls.dataCadastroFinal.clearValidators();
      }

      this.form.controls.dataCadastroInicio.updateValueAndValidity();
      this.form.controls.dataCadastroFinal.updateValueAndValidity();
    }, 250);
  }

  onFieldError(field: string) {
    if (this.onFieldInvalid(field)) {
      return 'is-invalid';
    }

    return '';
  }

  onFieldInvalid(field: any) {
    field = this.form.get(field);

    return field.status == 'INVALID' && field.touched;
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

  search(params: any): void {
    this.loaderNavbar = true;
    this.dados = [];
    this.dadosPagination = [];
    this.dadosLoaded = false;
    this.dadosEmpty = false;

    this.materiaisPerdidosService
      .getListaMateriaisPerdidos(params)
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
  }

  onPageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.dadosPagination = this.dados.slice(startItem, endItem);

    this.scrollToFilter.nativeElement.scrollIntoView({
      behavior: 'instant'
    });
  }

  viewRegister(materialPerdido: MaterialPerdido): void {
    this.router.navigate(['../editar', materialPerdido.codAssociacao], {
      relativeTo: this.activatedRoute
    });
  }
}
