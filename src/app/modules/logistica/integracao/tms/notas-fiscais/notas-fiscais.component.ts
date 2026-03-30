// angular
import { Component, OnInit, ViewChild, ElementRef, TemplateRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

// services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { DateService } from 'src/app/shared/services/core/date.service';
import { RouterService } from 'src/app/shared/services/core/router.service';

// rxjs
import { finalize, delay } from 'rxjs/operators';
import { Subscription } from 'rxjs';

// ngx
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { PageChangedEvent, BsModalService, BsModalRef } from 'ngx-bootstrap';

// models
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { LogisticaIntegracoesTMSService } from '../services/notas-fiscais.service';
import { ILogisticaIntegracoesTMSTIDNotaFiscal } from '../models/logisticaIntegracoesTMSTIDNotaFiscal';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';

@Component({
  selector: 'logistica-integracoes-tms-tid-notas-fiscais',
  templateUrl: './notas-fiscais.component.html',
  styleUrls: ['./notas-fiscais.component.scss']
})
export class LogisticaIntegracaoTMSNotasFiscaisComponent implements OnInit, OnDestroy {

  appTitle = 'Monitor de Integrações';

  form: FormGroup;

  loading = true;
  loaderNavbar = false;
  showAdvancedFilter = true;

  isDisabled = true;

  breadCrumbTree: Array<Breadcrumb>;

  totalItems = 0;
  itemsPerPage = 100;
  currentPage = 1;

  $activatedRouteSubscription: Subscription;

  qtItensIntegrados = 0;
  qtItensComErro = 0;
  qtItensNaoIntegrados = 0;

  items: Array<any> = [];

  bsConfig: Partial<BsDatepickerConfig>;
  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true
  };

  orderBy = 'NR_NOTA_FISC';
  orderType = 'DESC';

  constructor(
    private formBuilder: FormBuilder,
    private pnotify: PNotifyService,
    private dateService: DateService,
    private localeService: BsLocaleService,
    private route: Router,
    private activatedRoute: ActivatedRoute,
    private modalService: BsModalService,
    private atividadesService: AtividadesService,
    private routerService: RouterService,
    private tmsService: LogisticaIntegracoesTMSService
  ) {

    this.form = this.formBuilder.group({
      ID_LOGI_SENI_INTE_TID_NOTA_FISC: [null],
      NM_ARQU: [null],
      LOCA_ARQU: [null],
      NR_NOTA_FISC: [null],
      NR_CHAV_ACES: [null],
      IN_IMPO: [null],
      DT_INIC: [new Date()],
      DT_FINA: [new Date()],
      PAGI: 1,
      TT_REGI_PAGI: [100],
      ORDE_BY: [this.orderBy],
      ORDE_TYPE: [this.orderType],
      TIME: [new Date().getTime()],
    });

    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );

    this.modalService.config = {
      backdrop: 'static',
      animated: false
    };

  }

  ngOnInit() {
    this.setBreadCrumb();
    this.registraAcesso();
    this.onActivatedRoute();
  }

  ngOnDestroy() {
    this.$activatedRouteSubscription.unsubscribe();
  }

  registraAcesso() {
    this.atividadesService.registrarAcesso().subscribe();
  }

  onActivatedRoute() {
    this.$activatedRouteSubscription = this.activatedRoute.queryParams
      .subscribe(
        (response) => {

          if (Object.keys(response).length > 0)
            this.form.patchValue(this.routerService.getBase64UrlParams(response));

          this.getNotasFiscais(this.getParams());
        }
      )
  }

  setBreadCrumb() {
    this.breadCrumbTree = [
      {
        descricao: 'Home'
      },
      {
        descricao: this.appTitle
      }
    ];
  }

  onSearch() {
    this.form.get("PAGI").setValue(1);
    this.onFilter();
  }

  onFilter() {
    this.form.get("TIME").setValue((new Date()).getTime());

    this.route.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams()),
      queryParamsHandling: 'merge'
    });
  }

  /* Paginação */
  onPageChanged(event: PageChangedEvent): void {
    this.form.get("PAGI").setValue(event.page);
    this.onFilter();
  }
  /* Paginação */


  getParams() {

    let _params = {};
    let _obj = this.form.value;

    for (let prop in _obj) {
      if (_obj[prop]) {
        if (_obj[prop] instanceof Date)
          _params[prop] = this.dateService.convertToUrlDate(_obj[prop])
        else
          _params[prop] = _obj[prop]
      }
    }

    return _params;

  }

  onResetForm() {
    this.form.reset();
  }

  // Validação de formulário
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
  // Validação de formulário

  getNotasFiscais(params?) {

    if (!this.loading) this.loaderNavbar = true

    this.tmsService
      .getNotasFiscaisTID(params)
      .pipe(
        delay(1000),
        finalize(() => {
          this.loading = false;
          this.loaderNavbar = false;
        })

      )
      .subscribe(
        response => {
          if (response.status === 200) {
            this.items = response.body['data']['registros'];
            this.totalItems = response.body['data']['qtRegistros'];
            this.getDadosIntegracao();
          } else {
            this.items = [];
            this.pnotify.notice("Nenhum registro localizado.");
          }
        },
        error => {
          this.pnotify.error()
        }
      )
  }

  getDadosIntegracao() {
    this.qtItensIntegrados = this.items[0]['TT_REGI_INTE'];
    this.qtItensNaoIntegrados = this.items[0]['TT_REGI_NAO_INTE'];
  }

  getBorder(item: ILogisticaIntegracoesTMSTIDNotaFiscal) {
    if (item.IN_IMPO == '1')
      return 'border-success';

    return 'border-warning';
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

    this.form.get("ORDE_BY").setValue(this.orderBy);
    this.form.get("ORDE_TYPE").setValue(this.orderType);

    this.onSearch();
  }

  setItemsPerPage() {
    this.itemsPerPage = this.form.get("TT_REGI_PAGI").value;
  }

}
