// angular
import {
  Component,
  HostListener,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// rxjs
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';

// ngx
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import {
  BsDatepickerConfig,
  BsDatepickerDirective,
  BsLocaleService,
} from 'ngx-bootstrap/datepicker';

// services
import { DateService } from 'src/app/shared/services/core/date.service';
import { LogisticaEntregaRomaneiosService } from '../services/romaneios.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { DetailPanelService } from 'src/app/shared/templates/detail-panel/detal-panel.service';
import { XlsxService } from 'src/app/shared/services/core/xlsx.service';
import { RouterService } from 'src/app/shared/services/core/router.service';

import { BsModalRef, BsModalService } from 'ngx-bootstrap';

// interfaces
import { ILogisticaEntregaRomaneio } from '../models/romaneio';
import { AdminPerfisService } from 'src/app/modules/admin/perfis/services/perfis.service';
import { LogisticaEntregaFusionService } from '../../services/fusion.service';
import { LogisticaFiliaisService } from '../../../cadastros/filiais/services/filiais.service';

@Component({
  selector: 'logistica-entrega-romaneios-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class LogisticaEntregaRomaneiosListaComponent implements OnInit {
  @ViewChild(BsDatepickerDirective, { static: false })
  datepicker: BsDatepickerDirective;

  form: FormGroup;
  pedidosAtivos = [];
  pedidosInativos = [];

  /* showActiveOrder: boolean = true;
  showInactiveOrder: boolean = false; */

  inSomenteEntregaFaturamento: boolean = false;

  isChecked = false;

  //spinner
  loading: boolean = true;
  loaderNavbar: boolean = false;
  loadingEntregas: boolean = false;
  loadingFiliais = false;

  filiais; /*  = [
    {
      "CD_FILI": "18",
      "NM_FILI": "Distribuição Tiete"
    },
    {
      "CD_FILI": "6",
      "NM_FILI": "Distribuição Osasco"
    },
    {
      "CD_FILI": "79",
      "NM_FILI": "Distribuição Taipas"
    },
    {
      "CD_FILI": "77",
      "NM_FILI": "Distribuição Camanducaia"
    },
    {
      "CD_FILI": "3",
      "NM_FILI": "C&D Rio das Pedras"
    },
    {
      "CD_FILI": "72",
      "NM_FILI": "C&D Praia Grande"
    },
    {
      "CD_FILI": "46",
      "NM_FILI": "C&D Cajamar"
    },
    {
      "CD_FILI": "41",
      "NM_FILI": "Distribuição Valença"
    },
    {
      "CD_FILI": "19",
      "NM_FILI": "Distribuição Volta Redonda"
    },
    {
      "CD_FILI": "9661",
      "NM_FILI": "DBA Aço Especial"
    },
    {
      "CD_FILI": "9645",
      "NM_FILI": "DBA Piracicaba"
    },
    {
      "CD_FILI": "9636",
      "NM_FILI": "DBA Praia Grande"
    },
    {
      "CD_FILI": "9639",
      "NM_FILI": "DBA Jacarei"
    }
  ] */

  romaneios = [];
  romaneio: ILogisticaEntregaRomaneio;
  //pedidos = [];
  //materiais = [];

  modalRef: BsModalRef;

  entregas = [];

  pedidosParams;

  totalItems: any = [];
  noResult = true;
  romaneioFinalizado: number = 1;
  bsConfig: Partial<BsDatepickerConfig>;
  breadCrumbTree: any = [];
  loadingPedidos = false;

  showDetailPanel = false;
  showDetailPanelSubscription: Subscription;
  detailPanelTitle = 'Detalhes';
  appTitle = 'Painel de Empaque';

  orderBy = 'CD_ROMA';
  orderType = 'DESC';

  situacao = [
    {
      id: '1',
      nome: 'Activo',
    },
    {
      id: '0',
      nome: 'Llamado fuera',
    },
  ];

  situacaoCarregamento = [
    {
      id: '0',
      nome: 'EN CARGA',
    },
    {
      id: '1',
      nome: 'FINALIZADO',
    },
  ];

  inicioViagem = [
    {
      id: '0',
      nome: 'NO EMPEZADO',
    },
    {
      id: '1',
      nome: 'COMENZÓ',
    },
  ];

  $activatedRouteSubscription: Subscription;

  /* Paginação */
  itemsPerPage: number = 100;
  currentPage: number = 1;
  begin: number = 0;
  end: number = this.itemsPerPage;
  /* Paginação */

  permiteAlterarStatus: boolean = false;

  $subscription: Subscription;

  idSubModulo: number;

  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
    isFixed: true,
  };

  visualizarPedidosRemovidos = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private localeService: BsLocaleService,
    private notice: PNotifyService,
    private formBuilder: FormBuilder,
    private dateService: DateService,
    private romaneiosService: LogisticaEntregaRomaneiosService,
    private atividadesService: AtividadesService,
    private perfilService: AdminPerfisService,
    private detailPanelService: DetailPanelService,
    private pnotify: PNotifyService,
    private xlsxService: XlsxService,
    private routerService: RouterService,
    private modalService: BsModalService,
    private filiaisService: LogisticaFiliaisService
  ) {
    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );
  }

  ngOnInit() {
    this.buildForm();
    this.atividadesService.registrarAcesso().subscribe();
    this.verificaPerfil();
    this.setBreadCrumb();
    this.onDetailPanelEmitter();
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

  ngOnDestroy(): void {
    this.showDetailPanelSubscription.unsubscribe();
  }

  @HostListener('window:scroll', ['$event'])
  onScrollEvent() {
    this.datepicker.hide();
  }

  setBreadCrumb() {
    const params = this.activatedRoute.snapshot.params;
    const submoduloId = params?.idSubModulo;

    this.breadCrumbTree = [
      {
        descricao: 'Logistica',
      },
      {
        descricao: 'GESTIÓN DE ENTREGAS',
        routerLink: `/logistica/entrega/${submoduloId}`,
      },
      {
        descricao: this.appTitle,
      },
    ];
  }

  buildForm() {
    this.form = this.formBuilder.group({
      CD_FILI: [null],
      CD_MOTO: [null],
      CD_PRIO: [null],
      CD_ROMA: [null],
      CD_STAT: [null],
      DS_OBSE: [null],
      DT_ATUA: [null],
      DT_INCL: [null],
      DT_PREV_SAID: [null],
      ID_LOGI_FUSI_ROMA: [null],
      INT_ID: [null],
      IN_STAT: [null],
      FINA_IN_STAT: [null],
      IN_VIAG_INIC: [null],
      KM_PREV: [null],
      PLAC: [null],
      VL_FRET: [null],
      CD_PEDI: [null],
      DS_MOTO: [null],
      NR_NOTA_FISC: [null],
      IN_CTE_EMIT: ['T'],
      DT_INIC: [new Date()],
      DT_FINA: [new Date()],
      PAGI: [1],
      TT_REGI_PAGI: [100],
      ORDE_BY: [' CD_ROMA '],
      ORDE_TYPE: [' DESC '],
      TIME: new Date().getTime(),
      TP_EMPR: ['DISTRIBUIDORA'],
    });
  }

  onActivatedRoute() {
    this.$activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (response) => {
        let _response = this.routerService.getBase64UrlParams(response);

        if (Object.keys(_response).length > 0) {
          _response['CD_FILI'] = _response?.CD_FILI
            ? _response?.CD_FILI?.split(',')
            : [];
          this.form.patchValue(_response);
          this.getRomaneios(this.getParams());
        } else {
          this.loading = false;
        }
      }
    );
  }

  getRomaneios(params?) {
    this.itemsPerPage = params['TT_REGI_PAGI'];
    this.end = params['TT_REGI_PAGI'];

    if (!this.loading) this.loaderNavbar = true;

    this.romaneiosService
      .getRomaneio(params)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
          this.loading = false;
        })
      )
      .subscribe(
        (response: any) => {
          if (response.status === 200) {
            this.noResult = false;
            this.romaneios = response.body['data'];
            this.totalItems = response.body['total'];
          } else if (response.status === 204) {
            this.pnotify.notice('No se encontró la lista de empaque');
            this.noResult = true;
          }
        },
        (error) => {
          this.pnotify.error(error.error['message']);
          this.noResult = true;
        }
      );
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

  onFinalizaRomaneio(romaneio: ILogisticaEntregaRomaneio) {
    romaneio['loadingFinalizando'] = true;

    const status = romaneio.FINA_IN_STAT == '1' ? '0' : '1';

    let params = {
      ID_LOGI_FUSI_ROMA: romaneio?.ID_LOGI_FUSI_ROMA,
      IN_STAT: status,
    };

    this.romaneiosService
      .finalizarRomnaneio(params)
      .pipe(
        finalize(() => {
          romaneio['loadingFinalizando'] = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status !== 200) {
            this.pnotify.error(
              `No se pudo finalizar la lista de empaque ${romaneio?.CD_ROMA}`
            );
            return;
          }
          romaneio.DT_FINA = new Date();
          romaneio.FINA_IN_STAT = status;
          this.pnotify.success(
            `¡El empaque ${romaneio?.CD_ROMA} se ha completado con éxito!`
          );
        },
        (error) => {
          try {
            this.pnotify.error(error.error.message);
          } catch (error) {
            this.pnotify.error();
          }
        }
      );
    //this.postRomaneios(romaneio);
  }

  onInicioViagem(romaneio: ILogisticaEntregaRomaneio) {
    romaneio.IN_VIAG_INIC = romaneio.IN_VIAG_INIC == '1' ? '0' : '1';
    romaneio.DT_SAID = new Date();
    this.postRomaneios(romaneio);
  }

  onFilter(): void {
    this.form.get('TIME').setValue(new Date().getTime());
    this.form.get('PAGI').setValue(1);
    this.currentPage = 1;
    this.showDetailPanel = false;
    this.route.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams()),
    });
  }

  getParams() {
    let _params = {};
    let _obj = this.form.value;

    for (let prop in _obj) {
      if (_obj[prop]) {
        if (_obj[prop] instanceof Date)
          _params[prop] = this.dateService.convertToUrlDate(_obj[prop]);
        else if (Array.isArray(_obj[prop])) {
          _params[prop] = _obj[prop].join(',');
        } else _params[prop] = _obj[prop];
      }
    }

    /* if (_params['CD_FILI']) {
      const current = this.filiais.filter((empresa) => empresa.CD_FILI == _params['CD_FILI'])
      _params = Object.assign(_params, current[0]);
    } */

    return _params;
  }

  postRomaneios(romaneio) {
    this.loaderNavbar = true;

    this.romaneiosService
      .postRomaneio(romaneio)
      .pipe(finalize(() => (this.loaderNavbar = false)))
      .subscribe(
        (response: any) => {
          if (response['status'] === 200) {
            this.notice.success();
          } else {
            this.notice.error('Algunos registros no se pudieron actualizar');
          }
        },
        (error: any) => {
          this.notice.error();
        }
      );
  }

  verificaPerfil() {
    const matricula = JSON.parse(localStorage.getItem('currentUser'))['info'][
      'matricula'
    ];
    this.permiteAlterarStatus = false;
    this.perfilService
      .getPerfil({ sigla: 'LOGI_CONT_ACES_PAIN_ROMA', matricula: matricula })
      .subscribe((response) => {
        if (response.status === 200) {
          this.permiteAlterarStatus = true;
        }
      });
  }

  onDetailPanelEmitter(): void {
    this.showDetailPanelSubscription = this.detailPanelService.config.subscribe(
      (event: any) => {
        this.showDetailPanel = event.showing;
        if (!event.showing)
          this.romaneios.map((element) => (element.selected = false));
      }
    );
  }

  viewDetails(romaneio) {
    this.romaneio = romaneio;
    this.romaneios.map((element) => (element.selected = false));
    this.romaneio['selected'] = true;
    this.isChecked = false;

    this.detailPanelService.show();
    this.detailPanelService.loadedFinished(false);
    this.detailPanelTitle = romaneio.CD_ROMA;
    this.showDetailPanel = true;
    /* this.visualizarPedidosRemovidos = false; */

    this.getEntregas(romaneio);
  }

  getPedidos(params) {
    this.pedidosAtivos = [];
    this.pedidosInativos = [];

    this.romaneiosService
      .getPedidos(params)
      .pipe(finalize(() => { }))
      .subscribe(
        (response) => {
          if (response.status !== 200) {
            this.detailPanelService.loadedFinished(true);
            return;
          }

          const pedidos: Array<any> = response.body['data'];

          this.pedidosAtivos = pedidos.filter(
            (pedido) => pedido.IN_STAT == '1'
          );
          this.pedidosInativos = pedidos.filter(
            (pedido) => pedido.IN_STAT == '0'
          );

          /* this.showActiveOrder = true;
          this.showInactiveOrder = false; */

          this.detailPanelService.loadedFinished(false);
        },
        (error) => {
          this.detailPanelService.loadedFinished(true);
        }
      );
  }

  /* onShowActiveOrder(event: boolean){
    this.showActiveOrder = event;
  } */

  /* onShowInactiveOrder(event: boolean){
    this.showInactiveOrder = event;
  } */

  putRomaneio(romaneio) {
    romaneio.syncFusion = true;

    this.romaneiosService
      .putRomaneio(romaneio)
      .pipe(
        finalize(() => {
          romaneio.syncFusion = false;
        })
      )
      .subscribe(
        (response) => {
          this.pnotify.success(
            `¡Paquete ${romaneio.CD_ROMA} sincronizado correctamente!`
          );
        },
        (error) => {
          this.pnotify.error(
            `No se pudo sincronizar la lista de empaque ${romaneio.CD_ROMA}`
          );
        }
      );
  }

  onPrint(romaneio) {
    this.romaneiosService.download(romaneio);
  }

  sincronizarRomaneiosFusion() {
    this.loaderNavbar = true;

    this.romaneiosService
      .sincronizarRomaneiosFusion()
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200)
            this.pnotify.success(`¡Sincronizado con éxito!`);
          else this.pnotify.notice(`No se encontraron pendientes.`);
        },
        (error) => {
          this.pnotify.error(
            `No se pudo sincronizar las listas de empaque con Fusion.`
          );
        }
      );
  }

  enviarRomaneioParaFaturamento(romaneio) {
    romaneio.loadingFaturamento = true;

    this.romaneiosService
      .enviarRomaneioParaFaturamento(romaneio)
      .pipe(
        finalize(() => {
          romaneio.loadingFaturamento = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status !== 200) {
            this.pnotify.notice(
              `No se pudo enviar la lista de empaque ${romaneio.CD_ROMA} para facturación.`
            );
            return;
          }

          const usuario = JSON.parse(localStorage.getItem('currentUser'));
          const nome = usuario['info']['nomeCompleto'];
          const matricula = usuario['info']['matricula'];

          romaneio.DS_FATU_NM_USUA = nome;
          romaneio.DS_FATU_NR_MATR = matricula;
          const options: any = { timeStyle: 'medium', dateStyle: 'short' };
          romaneio.DS_FATU_DT_INCL = new Intl.DateTimeFormat(
            'br',
            options
          ).format(new Date());
          romaneio.FATU_IN_STAT = '1';

          this.pnotify.success(
            `¡Paquete ${romaneio.CD_ROMA} enviado correctamente para facturación.`
          );
        },
        (error) => {
          const message = error?.error?.message;

          if (message) {
            this.pnotify.error(`${romaneio.CD_ROMA}: ${message}`);
            return;
          }

          this.pnotify.error(
            `No se pudo enviar el paquete ${romaneio.CD_ROMA} para la facturación.`
          );
        }
      );
  }

  getEntregasSomenteFaturamento(romaneio) {
    romaneio.IN_FATU = (+this.isChecked).toString();
    this.getEntregas(romaneio);
  }

  getEntregas(romaneio) {
    this.loadingEntregas = true;

    const params = {
      CD_ROMA: romaneio?.CD_ROMA,
      IN_FATU: romaneio?.IN_FATU ? romaneio?.IN_FATU : '',
    };

    this.romaneiosService
      .getEntregas(params)
      .pipe(
        finalize(() => {
          this.loadingEntregas = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status !== 200) {
            this.entregas = [];
            return;
          }

          this.entregas = response.body['data'];
          romaneio.entregas = this.entregas;
        },
        (error) => {
          this.entregas = [];
        }
      );
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      animated: false,
      class: 'modal-xxl',
      backdrop: 'static',
    });
  }

  onCorFaturamento(romaneio: ILogisticaEntregaRomaneio): string {
    if (romaneio.FINA_IN_STAT == '0') return 'text-muted';

    if (romaneio.FATU_IN_STAT == '0') return 'text-warning';

    return 'text-success';
  }

  onInEnviarFaturamento(romaneio): boolean {
    return (
      romaneio.FATU_IN_STAT == 1 ||
      romaneio.FINA_IN_STAT == 0 ||
      !this.permiteAlterarStatus
    );
  }

  getDadosRelatorio() {
    this.loaderNavbar = true;

    const params = this.getParams();

    this.romaneiosService
      .getRelatorios(params)
      .pipe(finalize(() => (this.loaderNavbar = false)))
      .subscribe(
        (response) => {
          if (response.status !== 200) {
            this.pnotify.notice('No se encontraron registros.');
            return;
          }

          this.xlsxService.export({ data: response.body['data'] });
        },
        (error) => {
          const message = error?.error?.message;
          message ? this.pnotify.error(message) : this.pnotify.error();
        }
      );
  }

  onPodeFinalizarRomaneio(romaneio): boolean {
    if (romaneio?.IN_STAT == 0) return false;

    return this.permiteAlterarStatus;
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

    this.form.get('ORDE_BY').setValue(this.orderBy);
    this.form.get('ORDE_TYPE').setValue(this.orderType);

    this.onFilter();
  }
}
