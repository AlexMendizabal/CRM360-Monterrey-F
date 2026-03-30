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
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { LogisticaEntregaFusionService } from '../../../services/fusion.service';
import { LogisticaSteellogService } from '../../../../services/steellog.service';
import { ILogisticaSteelLogTipoTransporte } from '../../../../models/steellog/tipoTransporte';
import { ILogisticaSteelLogEmpresa } from '../../../../models/steellog/empresa';

@Component({
  selector: 'logistica-entrega-monitores-fusion-steellog-romaneios',
  templateUrl: './steellog.component.html',
  styleUrls: ['./steellog.component.scss']
})
export class LogisticaEntregaMonitoresFusionSteelLogRomaneiosComponent implements OnInit, OnDestroy {

  @ViewChild('template', { static: false }) template: TemplateRef<any>;
  @ViewChild('txtMotivoCancelamento', { static: false }) txtMotivoCancelamento: ElementRef;

  appTitle = 'MONITOR DE INTEGRACIÓN';

  modalRef: BsModalRef;

  form: FormGroup;

  loading = true;
  loaderNavbar = false;
  showAdvancedFilter = true;

  isDisabled = true;

  breadCrumbTree: Array<Breadcrumb>;

  tipoTransporte: Array<ILogisticaSteelLogTipoTransporte> = new Array();
  loadingTipoTransporte = false;

  items = [];
  totalItems = 0;
  itemsPerPage = 100;
  currentPage = 1;
  begin = 0;
  end = this.itemsPerPage - 1;

  $activatedRouteSubscription: Subscription;

  qtItensIntegrados = 0;
  qtItensComErro = 0;
  qtItensNaoIntegrados = 0;

  empresas: Array<ILogisticaSteelLogEmpresa>;
  loadingEmpresas: boolean;

  bsConfig: Partial<BsDatepickerConfig>;

  constructor(
    private fusionService: LogisticaEntregaFusionService,
    private formBuilder: FormBuilder,
    private pnotify: PNotifyService,
    private dateService: DateService,
    private localeService: BsLocaleService,
    private route: Router,
    private activatedRoute: ActivatedRoute,
    private modalService: BsModalService,
    private atividadesService: AtividadesService,
    private routerService: RouterService,
    private steellogService: LogisticaSteellogService
  ) {

    this.form = this.formBuilder.group({
      DT_INIC: [new Date()],
      DT_FINA: [new Date()],
      NR_MANI: [null],
      CD_TRAN: [null],
      CD_EMPR: [209],
      CD_STAT_INTE: ["1"],
      PAGI: [1],
      TT_REGI_PAGI: [this.itemsPerPage],
      TIME: [null]
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
    this.registraAcesso();
    this.setBreadCrumb();
    this.onActivatedRoute();
    this.getTipoTransporte();
    this.getEmpresas();
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
          if (Object.keys(response).length > 0) {
            this.form.patchValue(this.routerService.getBase64UrlParams(response));
            this.getManifestos(this.getParams());
          } else {
            this.loading = false;
          }
        }
      )
  }

  setBreadCrumb() {
    this.breadCrumbTree = [
      {
        descricao: 'Logistica'
      },
      {
        descricao: 'GESTIÓN DE ENTREGAS',
        routerLink: '../../'
      },
      {
        descricao: this.appTitle
      }
    ];
  }

  onSearch() {

    this.form.get("TIME").setValue((new Date()).getTime());

    this.route.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams()),
      queryParamsHandling: 'merge'
    });

  }

  /* Paginação */
  onPageChanged(event: PageChangedEvent): void {
    this.begin = (event.page - 1) * event.itemsPerPage;
    this.end = event.page * event.itemsPerPage;
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

  getManifestos(params) {

    if (!this.loading)
      this.loaderNavbar = true;

    this.fusionService
      .getManifestos(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loaderNavbar = false;
        })
      )
      .subscribe(
        response => {
          if (response.status === 200) {
            this.items = response.body["data"]['itens'];
            this.qtItensIntegrados = response.body["data"]["qtItensIntegrados"];
            this.qtItensNaoIntegrados = response.body["data"]["qtItensNaoIntegrados"];
            this.qtItensComErro = response.body["data"]["qtItensComErro"];
            this.totalItems = response.body["data"]["qtItens"];
          } else if (response.status === 204) {
            this.pnotify.notice('Nenhum registro localizado');
            this.items = [];
          } else {
            this.pnotify.error();
            this.items = [];
          }
        }, error => {
          this.pnotify.error();
          this.items = [];
        }
      )
  }

  onResetForm() {
    this.form.reset();
  }

  setItensPerPage(ev): number {
    this.itemsPerPage = ev.itemsPerPage;
    this.end = ev.itemsPerPage;
    return this.itemsPerPage;
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

  integraManifesto(item) {

    item.loading = true;

    this.fusionService
      .postManifesto(item)
      .pipe(
        finalize(() => {
          item.loading = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.pnotify.success();
            item.DT_INTE = new Date();

            if (item.IN_INTE == 'N')
              this.qtItensNaoIntegrados--

            if (item.IN_INTE == 'E')
              this.qtItensComErro--

            item.IN_INTE = 'I';
            this.qtItensIntegrados++;

          } else {
            this.pnotify.error();
          }
        },
        (error) => {
          this.pnotify.error();
        }
      )
  }

  getTipoTransporte() {
    this.loadingTipoTransporte = true;
    this.steellogService
      .getTipoTransporte()
      .pipe(
        finalize(() => {
          this.loadingTipoTransporte = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.tipoTransporte = response.body['data'];
          }
        }
      )
  }

  getEmpresas() {
    this.loadingEmpresas = true;
    this.steellogService
      .getEmpresas()
      .pipe(
        finalize(() => {
          this.loadingEmpresas = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.empresas = response.body['data'];
          }
        }
      )
  }

  setDate(event, item): void {

    let datetime = event.target.value;
    const regex = new RegExp(/^\d{1,2}\/\d{2}\/\d{4}\s\d{2}(:)\d{2}/g);

    if (regex.test(datetime)) {

      const date = (datetime.split(" ")[0]).split("/")
      const time = (datetime.split(" ")[1]).split(":")

      datetime = new Date(
        date[2], parseInt(date[1]) - 1, date[0],
        time[0], time[1])

      item.DT_PREV_SAID = datetime;

    }
  }

}
