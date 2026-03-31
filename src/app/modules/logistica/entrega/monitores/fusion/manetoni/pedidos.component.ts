// angular
import { Component, OnInit, ViewChild, ElementRef, TemplateRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

// services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { DateService } from 'src/app/shared/services/core/date.service';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { LogisticaEntregaFusionService } from '../../../services/fusion.service';

// rxjs
import { finalize, delay } from 'rxjs/operators';
import { Subscription } from 'rxjs';

// ngx
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { PageChangedEvent, BsModalService, BsModalRef } from 'ngx-bootstrap';

// models
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { ILogisticaEntregaColeta } from '../../../coletas/models/coleta';
import { LogisticaFiliaisService } from 'src/app/modules/logistica/cadastros/filiais/services/filiais.service';

@Component({
  selector: 'logistica-entregas-monitores-fusion-manetoni-pedidos',
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.scss']
})
export class LogisticaEngregasMonitoresFusionManetoniPedidosComponent implements OnInit {

  @ViewChild('template', { static: false }) template: TemplateRef<any>;
  @ViewChild('txtMotivoCancelamento', { static: false }) txtMotivoCancelamento: ElementRef;

  appTitle = 'MONITOR DE INTEGRACIÓN';

  modalRef: BsModalRef;

  form: FormGroup;

  loading = true;
  loaderNavbar = false;
  loadingFiliais = false;
  showAdvancedFilter = true;

  isDisabled = true;
  compressedTable = true;

  pedido;
  indice;

  breadCrumbTree: Array<Breadcrumb>;

  items = [];
  totalItems = 0;
  itemsPerPage = 100;
  currentPage = 1;
  begin = 0;
  end = this.itemsPerPage - 1;

  $activatedRouteSubscription: Subscription;
  $serviceSubscription: Subscription;

  qtItensIntegrados = 0;
  qtItensComErro = 0;
  qtItensNaoIntegrados = 0;

  orderBy = ' CD_PEDI ';
  orderType = ' DESC ';

  pedidoEditavel: ILogisticaEntregaColeta;

  tableConfig: Partial<CustomTableConfig> = {
    isFixed: true
  };

  filiais;

  statusIntegracao = [
    {
      "id": "T",
      "nome": "TODOS"
    },
    {
      "id": "I",
      "nome": "INTEGRADO"
    },
    {
      "id": "N",
      "nome": "NÃO INTEGRADO"
    },
    {
      "id": "E",
      "nome": "COM ERRO"
    }
  ];

  bsConfig: Partial<BsDatepickerConfig>;

  constructor(
    private fusionService: LogisticaEntregaFusionService,
    private filiaisService: LogisticaFiliaisService,
    private formBuilder: FormBuilder,
    private pnotify: PNotifyService,
    private dateService: DateService,
    private localeService: BsLocaleService,
    private route: Router,
    private activatedRoute: ActivatedRoute,
    private modalService: BsModalService,
    private atividadesService: AtividadesService,
    private routerService: RouterService
  ) {

    this.form = this.formBuilder.group({
      CD_FILI: [null],
      CD_PEDI: [null],
      DT_PEDI: [null],
      NOTA_FISC: [null],
      IN_INTE: ['T'],
      DS_INTE: [null],
      DT_INIC: [new Date()],
      DT_FINA: [new Date()],
      DS_CLIE: [null],
      PAGI: [1],
      TT_REGI_PAGI: [100],
      ORDE_BY: ['1'],
      ORDE_TYPE: ['ASC'],
      TIME: (new Date()).getTime()
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
    this.getFiliais();
  }

  getFiliais() {
    this.loadingFiliais = true;
    this.filiaisService.getFiliais({ status: '1' })
      .pipe(
        finalize(() => {
          this.loadingFiliais = false;
        })
      )
      .subscribe({
        next: response => {
          this.filiais = response.body['data'];
        },
        error: () => {
          this.pnotify.error();
        }
      })
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

          let _response = this.routerService.getBase64UrlParams(response);

          if (Object.keys(_response).length > 0) {

            _response['CD_FILI'] = _response?.CD_FILI ? _response?.CD_FILI?.split(',') : [];
            this.form.patchValue(_response);
            this.getPedidos(this.getParams());
          } else {
            this.loading = false;
          }

          console.log(_response)
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
        routerLink: './../../../'
      },
      {
        descricao: this.appTitle
      }
    ];
  }

  getPedidos(params?) {

    if (!this.loading) {
      this.loaderNavbar = true;
    }

    this.$serviceSubscription?.unsubscribe();

    this.$serviceSubscription = this.fusionService
      .getPedidos(params)
      .pipe(
        delay(1000),
        finalize(() => {
          this.loading = false;
          this.loaderNavbar = false;
        })

      )
      .subscribe(
        (response: any) => {
          this.items = [];
          if (response.status !== 200) {
            this.pnotify.notice("Nenhum pedido localizado");
            return
          }

          this.items = response.body["data"];
          this.qtItensIntegrados = response.body["counters"]["integrados"];
          this.qtItensNaoIntegrados = response.body["counters"]["naoIntegrados"];
          this.qtItensComErro = response.body["counters"]["comErro"];
          this.totalItems = response.body["total"];

        }, (error: any) => {
          this.pnotify.error();
        }
      )
  }

  onSearch() {
    this.form.get('PAGI').setValue(1);
    this.form.get("TIME").setValue((new Date()).getTime());

    this.route.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams()),
      queryParamsHandling: 'merge'
    });

  }

  /* Paginação */
  onPageChanged(event: PageChangedEvent): void {
    this.form.get('PAGI').setValue(event.page);
    this.form.get("TIME").setValue((new Date()).getTime());

    this.route.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams()),
      queryParamsHandling: 'merge'
    });
  }
  /* Paginação */


  getParams() {

    let _params = {};
    let _obj = this.form.value;

    for (let prop in _obj) {
      if (_obj[prop]) {
        if (_obj[prop] instanceof Date)
          _params[prop] = this.dateService.convertToUrlDate(_obj[prop])
        else if (Array.isArray(_obj[prop]))
          _params[prop] = _obj[prop].toString()
        else
          _params[prop] = _obj[prop]
      }
    }

    return _params;

  }

  onResetForm() {
    this.form.reset();
    this.form.patchValue({
      dtInicial: (new Date()),
      dtFinal: (new Date()),
      pagina: 1,
      itemsPerPage: 100,
    });
  }


  integraPedido(item) {

    item.loading = true;

    let params = {
      CD_FILI: item?.CD_FILI,
      CD_PEDI: item?.CD_PEDI,
    }

    this.fusionService
      .integraPedidoFusion(params)
      .pipe(
        finalize(() => {
          item.loading = false
        })
      )
      .subscribe(
        (response) => {
          if (response.status !== 200) {
            return
          }

          this.pnotify.success();

          if (item["DS_INTE"] == "I") {
            return
          }

          this.qtItensIntegrados++;

          if (item["DS_INTE"] == "E") {
            this.qtItensComErro--;
          } else if (item["DS_INTE"] == "N") {
            this.qtItensNaoIntegrados--;
          }

          item["DS_INTE"] = "I";
          item["DT_INTE"] = new Date();

        },
        (error) => {
          const message = error?.error?.message;
          message ? this.pnotify.error(message) : this.pnotify.error();
        }
      );
  }

  onDetails(boo, pedido?): void {
    this.pedido = pedido;
    this.compressedTable = boo;
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

  onEdit(pedido) {

    this.route.navigate(['./../../../coletas/novo'], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(pedido)
    })

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

}
