import { ComercialComissoesGestaoComissionamentosService } from './../../../comissoes/representantes/gestao-comissionamentos/gestao-comissionamentos.service';
import { JsonResponse } from './../../../../../models/json-response';

import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { DateService } from 'src/app/shared/services/core/date.service';
import { Breadcrumb } from './../../../../../shared/modules/breadcrumb/breadcrumb';
import { ActivatedRoute, Router } from '@angular/router';
import { PdfService } from 'src/app/shared/services/core/pdf.service';
import { ComercialRelatoriosComissoesRepresentantesService } from './../comissoes-representantes.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
} from '@angular/forms';

import { defineLocale, listLocales } from 'ngx-bootstrap/chronos';
import { ptBrLocale } from 'ngx-bootstrap/locale';
import {
  BsDatepickerConfig,
  BsDatepickerViewMode,
  BsLocaleService,
} from 'ngx-bootstrap/datepicker';
defineLocale('pt-br', ptBrLocale);

@Component({
  selector: 'financeiro/relatorios/comissoes-representantes-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class ComercialRelatoriosComissoesRepresentantesComponent
  implements OnInit
{
  locale = 'pt-br';
  locales = listLocales();

  excecoes: any = [];
  loaderFullScreen: boolean = true;
  loaderNavbar: boolean = true;
  codCliente: number = 1;

  dateToday: Date;

  dados: Array<any> = [];

  activatedRouteSubscription: Subscription;

  form: FormGroup;

  showDashboard = false;
  showFilter = false;
  showPermissionDenied = false;

  bsConfig: Partial<BsDatepickerConfig>;
  minMode: BsDatepickerViewMode = 'month';

  representantes: Array<any> = [];
  representanteTotal: Array<any> = [];
  empresa: Array<any> = [];

  dadosLoaded = false;
  dadosEmpty = false;
  submittingFilter = false;

  disabledDownload = false;

  breadCrumbTree: Array<Breadcrumb> = [];

  constructor(
    private comissoesRepresentantesService: ComercialRelatoriosComissoesRepresentantesService,
    private pnotifyService: PNotifyService,
    private pdfService: PdfService,
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private dateService: DateService,
    private formBuilder: FormBuilder,
    private atividadesService: AtividadesService,
    private router: Router,
    private localeService: BsLocaleService,
    private gestaoComissionamentosService: ComercialComissoesGestaoComissionamentosService
  ) {
    localeService.use('pt-br');
  }

  ngOnInit() {
    this.setBreadCrumb();
    this.getRepresentantes();
    this.setFormFilter();
  }

  setBreadCrumb(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/comercial/home',
        },
        {
          descricao: 'Relatórios',
          routerLink: `/comercial/relatorios/${params.idSubModulo}`,
        },
        {
          descricao: 'Comissões de Representantes',
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
      // dataInicial: [formValue.dataInicial],
      // dataFinal: [formValue.dataFinal],
      periodo: [this.dateService.getFirstDayMonth(), [Validators.required]],
      codRepresentante: [formValue.codRepresentante, [Validators.required]],
    });
  }

  checkRouterParams() {
    let formValue = {
      // dataInicial: this.dateService.getFirstDayMonth(),
      // dataFinal: this.dateService.getLastDayMonth(),
      periodo: this.dateService.getFirstDayMonth(),
      codRepresentante: null,
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
      this.setRouterParams(this.getParams());
    }
  }

  search(params: any): void {
    this.loaderNavbar = true;
    this.dadosEmpty = false;

    this.comissoesRepresentantesService
      .getDadosRepresentante(params)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.success === true) {
            this.dados = response.data;
            this.dateToday = this.dateService.getToday();
          } else {
            this.dadosEmpty = true;
          }
        },
        error: (error: any) => {
          this.dadosEmpty = true;
          this.pnotifyService.error();

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

  onDownload() {
    this.loaderNavbar = true;
    this.disabledDownload = true;
    this.pdfService.download(
      'comissoes-representantes',
      `${this.codCliente}_ComissõesRepresentante`
    );

    setTimeout(() => {
      this.loaderNavbar = false;
      this.disabledDownload = false;
    }, 12000);
  }

  getRepresentantes() {
    this.gestaoComissionamentosService
      .getRepresentantes(0)
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
          this.loaderNavbar = false;
        })
      )
      .subscribe(
        (response: any) => {
          if (response.success === true) {
            this.representantes = response.data;

            // this.representantes.unshift({
            //   codRepresentante: 0,
            //   nomeRepresentante: 'EXIBIR TODOS',
            // });
          } else {
            this.pnotifyService.error();
          }
        },
        (error: any) => {
          this.pnotifyService.error();
        }
      );
  }

  onRefresh() {
    this.setFormFilter();
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

    // && this.assocMateriais.controls['controls'][field].validator
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
}
