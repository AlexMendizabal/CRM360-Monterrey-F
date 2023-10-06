import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { DateService } from 'src/app/shared/services/core/date.service';
import { BsDatepickerConfig, BsDaterangepickerConfig, /* BsDaterangepickerInlineConfig, */ BsLocaleService } from 'ngx-bootstrap/datepicker';
import { finalize } from 'rxjs/operators';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { XlsxService } from 'src/app/shared/modules/xlsx/xlsx.service';
import { SulFluminenseEstoqueAvancadoGenericService } from '../services/generic.service';
import { SulFluminenseEstoqueAvancadoMateriaisEmLoteService } from '../services/materiais-em-lote.service';

@Component({
  selector: 'materiais-em-lote',
  templateUrl: './materiais-em-lote.component.html',
  styleUrls: ['./materiais-em-lote.component.scss']
})
export class SulFluminenseEstoqueAvancadoMateriaisEmLoteComponent implements OnInit, OnDestroy {

  spinnerFullScreen: boolean = false;
  loaderNavbar: boolean = false;
  breadCrumbTree: any = [];
  data: Date = new Date();
  bsConfig: Partial<BsDaterangepickerConfig>;
  form: FormGroup;
  idSubModulo: any;
  linhas: any;
  classes: any;
  materiais: any;
  listas: any = [];
  compararData: boolean = false;
  noResult = false;
  dadosEmpty = false;
  idApoio = '82D92286-40A1-4642-98F8-0611092600F3';
  teste = [];

  $activateRoutedSubscription: Subscription;

  appTitle = 'Auditoria Materiais em Lote';

  /* Paginação */
  itemsPerPage: number = 100;
  totalItems: number;
  currentPage: number = 1;
  begin: number = 0;
  end: number = 100;

  /* Config Table */
  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: false,
  };

  numerico: any = {
    align: "left",
    allowNegative: false,
    decimal: "",
    precision: 0,
    prefix: "",
    suffix: "",
    thousands: ""
  }

  constructor(
    private service: SulFluminenseEstoqueAvancadoMateriaisEmLoteService,
    private genericService: SulFluminenseEstoqueAvancadoGenericService,
    private activatedRoute: ActivatedRoute,
    private routerService: RouterService,
    private formBuilder: FormBuilder,
    private dateService: DateService,
    private localeService: BsLocaleService,
    private route: Router,
    private xlsxService: XlsxService,
    private notice: PNotifyService
  ) {
    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false },
      { showPreviousMonth: true }
    );

    this.form = this.formBuilder.group({
      DT_INIC: [this.dateService.getFirstDayMonth(), Validators.required],
      DT_FINA: [this.data, Validators.required],
      ID_LINH: [null],
      ID_CLAS: [null],
      ID_MATE: [null],
      CD_LOTE: [null],
      ID_APOI_TIPO_MATE: [this.idApoio],
      time: [new Date().getTime()]
    })
   }

  ngOnInit(): void {
    this.setBreadCrumb();
    this.getActiveRoute();
    this.getLinhas();
    this.form.get('ID_CLAS').disable();
    this.form.get('ID_MATE').disable();
  }

  ngOnDestroy() {
    this.$activateRoutedSubscription.unsubscribe();
  }

  setBreadCrumb() {
    this.activatedRoute.params.subscribe((param: any) => {
      this.idSubModulo = param['idSubModulo']
      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/sul-fluminense/home'
        },
        {
          descricao: 'Estoque Avançado',
          routerLink: `/sul-fluminense/estoque-avancado/${this.idSubModulo}`
        },
        {
          descricao: this.appTitle,
        },
      ];
    });
  }

  exportarExcel() {
    this.xlsxService.exportFile(this.listas, 'estoque-por-lote');
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

  getParams() {
    let _params = {};
    let _obj = this.form.value;

    for (let prop in _obj) {
      if (_obj[prop]) {
        if (_obj[prop] instanceof Date)
          _params[prop] = this.dateService
            .convertToBrazilianDate(_obj[prop])
            .substring(0, 10);
        else _params[prop] = _obj[prop];
      }
    }

    return _params;
  }

  onFilter() {
    this.form.get('time').setValue(new Date().getTime());
    this.route.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams()),
    });
  }

  getActiveRoute() {
    this.$activateRoutedSubscription = this.activatedRoute.queryParams.subscribe(
      (response) => {
        if (Object.keys(response).length > 0) {
          const _response = this.routerService.getBase64UrlParams(response);
          this.form.patchValue(_response);
          console.log(_response)
          this.getLista(_response);
        }
      }
    );
  }

  /* Paginação */
  onPageChanged(event: PageChangedEvent): void {
    this.begin = (event.page - 1) * event.itemsPerPage;
    this.end = event.page * event.itemsPerPage;
  }
  /* Paginação */

  getLinhas() {
    this.genericService.getLinhas()
    .subscribe((response) => {
      this.linhas = response.body['result']
    })
  }

  getClasses() {
    this.loaderNavbar = true
    this.genericService.getClasses(this.getParams())
    .pipe(
      finalize(() => {
        this.loaderNavbar = false;
      })
    )
    .subscribe((response) => {
      this.classes = response.body['result']
    })
  }

  getMateriais() {
    this.loaderNavbar = true
    this.genericService.getMateriais(this.getParams())
    .pipe(
      finalize(() => {
        this.loaderNavbar = false;
      })
    )
    .subscribe((response) => {
      this.materiais = response.body['result']
    })
  }

  getLista(params) {
    this.spinnerFullScreen = true;
    this.service.getLista(params)
    .pipe(
      finalize(() => {
        this.spinnerFullScreen = false;
      })
    )
    .subscribe(
      (response) => {
        if (response.status === 204) {
          this.notice.notice('Não há informações para esse período.');
          this.dadosEmpty = true;
          this.noResult = false;
        } else {
          this.listas = response.body['data'];
          this.totalItems = response.body['data'].length;
          this.listas.forEach((element, i) => {
            element.INDICE = i + 1;
          });
          this.dadosEmpty = false;
          this.noResult = true;
        }
      },
      (error) => this.notice.error()
    );
  }

  validaCampo() {
    if (this.form.value['ID_LINH'] != null)
      this.form.get('ID_CLAS').enable();
    else {
      this.form.get('ID_CLAS').disable();
      this.form.get('ID_MATE').disable();
    }

    if (this.form.value['ID_CLAS'] != null)
      this.form.get('ID_MATE').enable();
    else {
      this.form.get('ID_MATE').disable();
    }
    
  }

}
