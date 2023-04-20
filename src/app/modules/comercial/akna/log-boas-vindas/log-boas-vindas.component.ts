import { Component, OnInit, OnDestroy } from '@angular/core';
import { ControladoriaAknaLogBoasVindasService } from './log-boas-vindas.service';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { DateService } from 'src/app/shared/services/core/date.service';
import { ActivatedRoute } from '@angular/router';
import { RouterService } from 'src/app/shared/services/core/router.service';

@Component({
  selector: 'log-boas-vindas',
  templateUrl: './log-boas-vindas.component.html',
  styleUrls: ['./log-boas-vindas.component.scss']
})
export class ComercialAknaLogBoasVindasComponent implements OnInit, OnDestroy {
  spinnerFullScreen: boolean = false;
  loaderNavbar: boolean = false;
  noResult = false;
  dadosEmpty = false;
  logs = [];
  form: FormGroup;
  bsConfig: Partial<BsDatepickerConfig>;
  data: Date = new Date();
  $activateRoutedSubscription: Subscription;

  appTitle = 'Log de Boas Vindas';

  /* Config Table */
  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
  };

  /* Paginação */
  itemsPerPage: number = 10;
  totalItems: number;
  currentPage: number = 1;
  begin: number = 0;
  end: number = 10;

  constructor(
    private LogService: ControladoriaAknaLogBoasVindasService,
    private localeService: BsLocaleService,
    private formBuilder: FormBuilder,
    private dateService: DateService,
    private activatedRoute: ActivatedRoute,
    private routerService: RouterService
  ) {
    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );

    this.form = this.formBuilder.group({
      DT_INCL: [null],
      ID: [null],
      CD_CLIE: [null],
      NOME: [null],
      EMAIL: [null],
      IN_STAT: [null],
      time: [new Date().getTime()],
    });
  }

  ngOnInit() {
    this.getActiveRoute()
  }

  ngOnDestroy() {
    this.$activateRoutedSubscription.unsubscribe();
  }

  getLogBoasVindas(){
    this. spinnerFullScreen= true;
    this.LogService
    .getLogBoasVindas()
    .pipe(
      finalize(() => {
        this.spinnerFullScreen = false;
      })
    )
    .subscribe((response) =>{
      this.logs = response.body['data'];
      this.noResult = true;
      this.totalItems = response.body['data'].length;
    });
  }

  /* Paginação */
  onPageChanged(event: PageChangedEvent): void {
    this.begin = (event.page - 1) * event.itemsPerPage;
    this.end = event.page * event.itemsPerPage;
  }
  /* Paginação */

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

  reenviarEmail(params){
    this. spinnerFullScreen= true;
    this.form.patchValue(params);
    this.LogService
    .postAkna(this.getParams())
    .pipe(
      finalize(() => {
        this.spinnerFullScreen = false;
      })
    )
    .subscribe((response) =>{
      if(response.body['data']['SUCCESS'] == 200)
        this.getLogBoasVindas();
    })
  }

  getActiveRoute() {
    this.$activateRoutedSubscription = this.activatedRoute.queryParams.subscribe(
      (response) => {
        if (Object.keys(response).length > 0) {
          const _response = this.routerService.getBase64UrlParams(response);
          this.form.patchValue(_response);
        }
        this.getLogBoasVindas();
      }
    );
  }
}
