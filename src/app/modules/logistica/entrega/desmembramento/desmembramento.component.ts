import { LogisticaEntregaPedidosService } from './../coletas/services/pedidos.service';
import { LogisticaEntregaFusionService } from './../services/fusion.service';
// angular
import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// rxjs
import { EMPTY, Subscription } from 'rxjs';

// services
import { RouterService } from 'src/app/shared/services/core/router.service';
import { DateService } from 'src/app/shared/services/core/date.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';

// ngx
import { BsLocaleService, BsDatepickerConfig, PageChangedEvent, BsModalRef, BsModalService } from 'ngx-bootstrap';

// interfaces
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { finalize, switchMap, take } from 'rxjs/operators';
import { LogisticaEntregaDesmembramentoService } from './services/desmembramento.service';
import { LogisticaFiliaisService } from '../../cadastros/filiais/services/filiais.service';

@Component({
  selector: 'logistica-entrega-desmembramento',
  templateUrl: './desmembramento.component.html',
  styleUrls: ['./desmembramento.component.scss']
})
export class LogisticaEntregaDesmembramentoComponent implements OnInit {

  form: FormGroup;
  breadCrumbTree: any = [];
  bsConfig: Partial<BsDatepickerConfig>;
  pedidos = [];
  filiais = [];
  modalRef: BsModalRef;
  pedidoSelecionado = [];

  tipoOperacao = [];

  //CARDS
  integrados: number = 0;
  integradosEmpty: boolean = false;

  noIntegrados: number = 0;
  noIntegradosEmpty: boolean = false;

  InErros: number = 0;
  InErrosEmpty: boolean = false;

  countoIntegrados: number;
  countoNoIntegrados: number;
  countoInErros: number;

  /* Pagination */
  itemsPerPage: number = 100;
  currentPage: number = 1;
  totalItems: any = 0;
  begin: number = 0;
  end: number = this.itemsPerPage;
  /* Pagination */

  tipos = [
    {
      cod: '1',
      nome: 'Orden de venta principal',
    },
    {
      cod: '2',
      nome: 'Orden de venta secundaria',
    },
    {
      cod: '0',
      nome: 'Orden no fragmentado',
    },
  ];

  inSaldo = [
    {
      cod: '1',
      nome: 'Registros con saldo',
    },
    {
      cod: '0',
      nome: 'Registros que no tienen saldo',
    },
    {
      cod: '',
      nome: 'Todos los registros',
    },
  ];

  integracion = [
    {
      cod: 'I',
      nome: 'Integrado',
    },
    {
      cod: 'N',
      nome: 'No integrado',
    },
    {
      cod: 'E',
      nome: 'Con error',
    },
    {
      cod: '',
      nome: 'Todos los registros',
    },
  ];

  subtitles: Array<Subtitles> = [
    {
      id: 1,
      text: 'Activo',
      color: 'green',
    },
    {
      id: 2,
      text: 'Inactivo',
      color: 'red',
    },
  ];

  /*loading*/
  loading = true;
  loadingNavBar = false;
  loadingFiliais = false;
  noResult = true;
  /*loading*/

  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true
  };


  $activatedRouteSubscription: Subscription;
  $service: Subscription;



  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private fusionService: LogisticaEntregaFusionService,
    private routerService: RouterService,
    private localeService: BsLocaleService,
    private dateService: DateService,
    private modalService: BsModalService,
    private atividadesService: AtividadesService,
    private filiaisService: LogisticaFiliaisService,
    private pnotify: PNotifyService,
    private confirmModalService: ConfirmModalService,
    private desmembramentoService: LogisticaEntregaDesmembramentoService
  ) {
    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );
  }

  ngOnInit(): void {
    this.buildForm();
    this.registraAcesso()
    this.setBreadCrumb();
    this.onActivatedRoute();
    this.getFiliais();
    this.getTipoOperacao();
  }

  ngOnDestroy() {
    this.$activatedRouteSubscription.unsubscribe();
  }

  onActivatedRoute() {
    this.$activatedRouteSubscription = this.activatedRoute.queryParams
      .subscribe(
        (response) => {

          let _response = this.routerService.getBase64UrlParams(response);


          if (Object.keys(_response).length > 0) {

            _response['CD_FILI'] = _response?.CD_FILI
              ? _response?.CD_FILI?.split(',')
              : [];

            _response['IN_DESM'] = _response?.IN_DESM
              ? _response?.IN_DESM?.split(',')
              : [];

            _response['TP_OPER'] = _response?.TP_OPER
              ? _response?.TP_OPER?.split(',')
              : [];

            this.form.patchValue(_response);
            this.getPedidos(this.getParams());

          } else {
            this.loading = false;
          }
        }
      )
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

  buildForm() {
    this.form = this.formBuilder.group({
      CD_PEDI: [null],
      CD_FILI: [null, Validators.required],
      ID_LOGI_FUSI_PEDI: [null],
      DS_CLIE: [null],
      TP_OPER: [['DEMEMBRAMENTO', 'FACTURA']],
      IN_SALD: [''],
      CD_ROMA: [null],
      DS_INTE: [''],
      IN_DESM: [['1', '0']],
      DT_INIC: [new Date()],
      DT_FINA: [new Date()],
      TT_REGI_PAGI: [100],
      PAGI: [1],
      TIME: [(new Date()).getTime()]
    })
  }

  registraAcesso() {
    this.atividadesService.registrarAcesso().subscribe();
  }

  setBreadCrumb() {

    const submoduloId = this.activatedRoute.snapshot.params?.idSubModulo;

    this.breadCrumbTree = [
      {
        descricao: 'Logistica'
      },
      {
        descricao: 'Gestíon de Entregas',
        routerLink: `/logistica/entrega/${submoduloId}`
      },
      {
        descricao: 'LISTA DE DESMEMBRAMIENTO'
      }
    ];
  }



  setItensPerPage(ev): number {
    this.itemsPerPage = ev.itensPorPagina;
    return this.itemsPerPage;
  }

  openRegister(item?) {
    const queryParams = item ? this.routerService.setBase64UrlParams({ ID_LOGI_FUSI_PEDI: item["ID_LOGI_FUSI_PEDI"] }) : {};
    this.route.navigate([`../cadastro`], {
      relativeTo: this.activatedRoute,
      queryParams: queryParams
    });
  }

  openModal(template: TemplateRef<any>, pedido) {
    this.pedidoSelecionado = pedido;
    this.modalRef = this.modalService.show(template, {
      animated: false,
      class: 'modal-xl',
    });
  }

  hideModal() {
    this.modalRef.hide();
  }


  /* Paginação */
  /* Paginação */
  onPageChanged(event: PageChangedEvent): void {
    this.form.get('TIME').setValue(new Date().getTime());
    this.form.get('PAGI').setValue(event.page);
    this.route.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams()),
    });
  }
  /* Paginação */
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

  onSearch() {
    this.form.get("TIME").setValue((new Date()).getTime());
    this.route.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams())
    })
  }

  getTipoOperacao(params?) {

    this.desmembramentoService
      .getTipoOperacao(params)
      .subscribe(
        (response) => {
          if (response.status !== 200) {
            return
          }

          this.tipoOperacao = response.body['data'];
        },
        (error) => {

        }
      )
  }

  getPedidos(params?) {

    this.$service?.unsubscribe();

    if (!this.loading) {
      this.loadingNavBar = true;
    }

    this.$service = this.fusionService
      .getPedidos(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.noResult = false;
            this.integrados = response.body['counters']['integrados'];
            this.noIntegrados = response.body['counters']['naoIntegrados'];
            this.InErros = response.body['counters']['comErro'];
            this.pedidos = response.body['data'];
            this.totalItems = ++response.body['total'];
            this.itemsPerPage = this.form.get('TT_REGI_PAGI').value;
          } else {
            this.noResult = true;
            this.pedidos = []
            this.pnotify.notice("Ningún órdenes de venta situado")
          }
        },
        (error) => {
          this.pedidos = []
          this.noResult = true;
          this.pnotify.error();
        }
      )
  }

  onReset() {
    this.form.reset();
    this.form.updateValueAndValidity();
    this.form.get("TT_REGI_PAGI").setValue(100);
    this.noResult = true;
    this.route.navigate([]);
    this.pedidos = []
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

  integraPedido(item) {

    item.loading = true;

    let params = {
      /* CD_FILI: item?.CD_FILI,
      CD_PEDI: item?.CD_PEDI, */
      ID_LOGI_FUSI_PEDI: item.ID_LOGI_FUSI_PEDI
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

          this.integrados++;

          if (item["DS_INTE"] == "E") {
            this.noIntegrados--;
          } else if (item["DS_INTE"] == "N") {
            this.InErros--;
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

  onMarcarRetira(pedido) {

    pedido.retiraLoading = true;

    let _params = {
      'ID_LOGI_FUSI_PEDI': pedido?.ID_LOGI_FUSI_PEDI,
      'TP_OPER': 'RETIRA'
    }

    this.desmembramentoService
      .put(_params)
      .subscribe(
        response => {
          if (response.status != 200) {
            return
          }

          pedido.TP_OPER = 'RETIRA';

          if (pedido.IN_INTE == 0) {
            pedido.retiraLoading = false;
            return;
          }

          this.fusionService
            .integraPedidoFusion(_params)
            .pipe(
              finalize(() => {
                pedido.retiraLoading = false;
              })
            )
            .subscribe(
              response => {
                if (response.status !== 200) {
                  return
                }
              },
              error => {
                this.pnotify.error("No se pudo cancelar el pedido en la Fusión")
              }
            )
        },
        error => {
          pedido.retiraLoading = false;
          this.pnotify.error("Se produjo un error al procesar la solicitud");
        }
      )
  }

}
