// angular
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// rxjs
import { Subscription, EMPTY } from 'rxjs';
import { finalize, take, switchMap } from 'rxjs/operators';

// services
import { RouterService } from 'src/app/shared/services/core/router.service';
import { LogisticaEntregaPedidosService } from '../services/pedidos.service';
import { DateService } from 'src/app/shared/services/core/date.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';

// ngx
import { BsLocaleService, BsDatepickerConfig, PageChangedEvent } from 'ngx-bootstrap';

// interfaces
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { LogisticaEntregaFusionService } from '../../services/fusion.service';
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { ILogisticaEntregaColeta } from '../models/coleta';
import { LogisticaFiliaisService } from '../../../cadastros/filiais/services/filiais.service';

@Component({
  selector: 'logistica-entrega-coletas-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss']
})
export class LogisticaEntregaColetasListaComponent implements OnInit {

  form: FormGroup;

  appTitle = "Lista de Coletas"

  breadCrumbTree: any = [];

  showAdvancedFilter = true;
  restricoes: any;

  bsConfig: Partial<BsDatepickerConfig>;

  idSubModulo: number;

  /* Pagination */
  itemsPerPage: number = 100;
  currentPage: number = 1;
  totalItems: any = 0;
  begin: number = 0;
  end: number = this.itemsPerPage;
  /* Pagination */

  subtitles: Array<Subtitles> = [
    {
      id: 1,
      text: 'Ativo',
      color: 'green',
    },
    {
      id: 2,
      text: 'Inativo',
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

  pedidos: Array<ILogisticaEntregaColeta>;

  $activatedRouteSubscription: Subscription;

  /* empresas = [
    {
      "id": 18,
      "nome": "Distribuição Tiete",
      "cnpj": 49795800001883
    },
    {
      "id": 79,
      "nome": "Distribuição Taipas",
      "cnpj": 49795800002340
    },
    {
      "id": 6,
      "nome": "Distribuição Osasco",
      "cnpj": 49795800001530
    },
    {
      "id": 3,
      "nome": "C&D Rio das Pedras",
      "cnpj": 2506609000162
    },
    {
      "id": 46,
      "nome": "C&D Cajamar",
      "cnpj": 2506609000243
    },
    {
      "id": 72,
      "nome": "C&D Praia Grande",
      "cnpj": 2506609000324
    },
    {
      "id": 9661,
      "nome": "DBA Aço Especial",
      "cnpj": 17469701002897
    }
  ] */

  empresas = [];

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private routerService: RouterService,
    private pedidosService: LogisticaEntregaPedidosService,
    private localeService: BsLocaleService,
    private dateService: DateService,
    private atividadesService: AtividadesService,
    private pnotify: PNotifyService,
    private filiaisService: LogisticaFiliaisService,
    private fusionService: LogisticaEntregaFusionService,
    private confirmModalService: ConfirmModalService
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
    this.getEmpresas();
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
            this.form.patchValue(_response);
            this.getPedidos(this.getParams());
          } else {
            this.loading = false;
          }
        }
      )
  }

  buildForm() {
    this.form = this.formBuilder.group({
      CD_PEDI: [null],
      CD_EMPR: [null, Validators.required],
      DT_INIC: [new Date()],
      DT_FINA: [new Date()],
      IN_STAT_ENTR: ['1'],
      QT_ITENS_PAGINA: [100],
      PAGINA: [1],
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
        descricao: 'GESTIÓN DE ENTREGAS',
        routerLink: `/logistica/entrega/${submoduloId}`
      },
      {
        descricao: 'Lista de coletas'
      }
    ];
  }

  getEmpresas() {
    this.loadingFiliais = true;
    this.filiaisService.getFiliais({ status: '1' })
      .pipe(
        finalize(() => {
          this.loadingFiliais = false;
        })
      )
      .subscribe({
        next: response => {
          this.empresas = response.body['data'];
        },
        error: () => {
          this.pnotify.error();
        }
      })
  }

  getPedidos(params?) {

    if (!this.loading) this.loadingNavBar = true;

    this.pedidosService
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
            this.pedidos = response.body['data'];
            this.totalItems = response.body['total'];
          } else {
            this.noResult = true;
            this.pnotify.notice("Nenhum pedido localizado.")
          }
        },
        (error) => {
          this.noResult = true;
          this.pnotify.error();
        }
      )
  }

  integraPedido(item) {

    item.loading = true;

    let params = {
      cdEmpresa: item["CD_EMPR"],
      pedido: item["ID_LOGI_FUSI_PEDI"],
      parametro: 11
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
          if (response.status === 200) {
            this.pnotify.success();
            item["IN_INTE"] = "I";
          }
        },
        (error) => {
          this.pnotify.error();
        }
      );
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

  /* Paginação */
  onPageChanged(event: PageChangedEvent): void {
    this.form.get("pagina").setValue(event.page);
    this.getPedidos(this.getParams());
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

  onSearch() {
    this.form.get("TIME").setValue((new Date()).getTime());
    this.route.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams())
    })
  }

  changeState(pedido: ILogisticaEntregaColeta) {

    const _pedido = JSON.parse(JSON.stringify(pedido));

    _pedido.IN_STAT = _pedido.IN_STAT == '0' ? '1' : '0';
    _pedido.PRAZO = this.dateService.convertToUrlDate(new Date(_pedido.PRAZO));
    _pedido.DT_PEDI = this.dateService.convertToUrlDate(new Date(_pedido.DT_PEDI));
    _pedido.DT_EMIS_NOTA_FISC = this.dateService.convertToUrlDate(new Date(_pedido.DT_EMIS_NOTA_FISC));

    const [type, title, message, cancelTxt, okTxt] = this.getMessageConfirmModal(parseInt(_pedido.IN_STAT));

    this.confirmModalService
      .showConfirm(type, title, message, cancelTxt, okTxt)
      .pipe(
        take(1),
        switchMap((result) => {
          if (!result) return EMPTY;

          this.loadingNavBar = true;

          return this.pedidosService
            .postPedido(_pedido)

        }),
        finalize(() => {
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (success: any) => {
          pedido.IN_STAT = _pedido.IN_STAT;
          this.pnotify.success();
        },
        (error: any) => {
          this.pnotify.error();
        }
      );
  }

  getMessageConfirmModal(status): Array<string> {
    if (status)
      return [
        null,
        null,
        'Deseja realmente prosseguir com a ativação do registro?',
        'Cancelar',
        'Confirmar'
      ]

    return [
      'inactivate',
      'Confirmar inativação',
      'Deseja realmente prosseguir com a inativação do registro?',
      'Cancelar',
      'Confirmar'
    ]
  }

  onReset() {
    this.form.reset();
    this.form.updateValueAndValidity();
    this.form.get("QT_ITENS_PAGINA").setValue(100);
    this.noResult = true;
    this.pedidos = [];
    this.route.navigate([]);
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

  canCancel(pedido: ILogisticaEntregaColeta) {

    const _user = JSON.parse(localStorage.getItem("currentUser"));
    const _id = _user['info']['id'];

    if (pedido.ID_USUA_RESP_CADA == _id)
      return true;

    return false;
  }

  isEditable(pedido: ILogisticaEntregaColeta): boolean {

    if (pedido.IN_STAT == '0')
      return false

    if (pedido.IN_STAT_ROMA_PEDI == '1')
      return false

    return true;
  }

  getTooltip(pedido: ILogisticaEntregaColeta): string {

    if (pedido.IN_STAT == '0')
      return 'Não é possível editar um pedido cancelado'

    if (pedido.IN_STAT_ROMA_PEDI == '1')
      return 'Não é possível editar um pedido que está em carga'

    return '';
  }

}
