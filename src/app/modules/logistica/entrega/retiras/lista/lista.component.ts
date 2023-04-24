import { CustomTableConfig } from './../../../../../shared/templates/custom-table/models/config';
//angular
import { Component, OnInit, TemplateRef } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

//ngx
import {
  BsDatepickerConfig,
  BsLocaleService,
  BsModalService,
  BsModalRef, PageChangedEvent
} from 'ngx-bootstrap';

//services
import { LogisticaEntregaRetirasService } from '../services/retiras.service';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { DateService } from 'src/app/shared/services/core/date.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { LogisticaVeiculoService } from '../../../cadastros/veiculos/services/veiculo.service';
import { LogisticaMotoristaService } from '../../../cadastros/motoristas/services/motorista.service';

//rxjs
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

// interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { ILogisticaEntregaFormacaoCargaRomaneio } from '../models/romaneio';
import { ILogisticaMotorista } from '../../../cadastros/motoristas/models/motorista';
import { ILogisticaVeiculo } from '../../../cadastros/veiculos/models/veiculo';
import { ILogisticaEntregaFormacaoCargaPedido } from '../models/pedido';

//masks
import { MASKS } from 'ng-brazil';
import { XlsxService } from 'src/app/shared/services/core/xlsx.service';

@Component({
  selector: 'lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class LogisticaEntregaRetirasListaComponent implements OnInit {

  appTitle = 'Retiras';

  public MASKS = MASKS;

  bsConfig: Partial<BsDatepickerConfig>;
  modalRef: BsModalRef;

  loading = true;
  loadingNavBar = false;
  breadCrumbTree: Array<Breadcrumb>;

  romaneios: Array<ILogisticaEntregaFormacaoCargaRomaneio> = new Array();
  romaneio: ILogisticaEntregaFormacaoCargaRomaneio;

  pedidos: Array<ILogisticaEntregaFormacaoCargaPedido> = new Array();
  pedidosLoading = false;

  filiais = [];
  form: FormGroup;

  $activatedRouteSubscription: Subscription;

  motoristas: Array<ILogisticaMotorista>;
  loadingMotoristas = true;

  veiculos: Array<ILogisticaVeiculo>;
  loadingVeiculos = true;

  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true
  };

  /* Pagination */
  itemsPerPage: number = 100;
  currentPage: number = 1;
  totalItems: any = 0;
  begin: number = 0;
  end: number = this.itemsPerPage;
  /* Pagination */

  constructor(
    private service: LogisticaEntregaRetirasService,
    private formBuilder: FormBuilder,
    private localeService: BsLocaleService,
    private routerService: RouterService,
    private dateService: DateService,
    private atividadesService: AtividadesService,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private pnotify: PNotifyService,
    private motoristasService: LogisticaMotoristaService,
    private veiculosService: LogisticaVeiculoService,
    private modalService: BsModalService,
    private xlsxService: XlsxService
  ) {
    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );

    this.form = formBuilder.group({
      DT_INIC: [new Date()],
      DT_FINA: [new Date()],
      CD_FILI: [null],
      IN_STAT: ["T"],
      ID_LOGI_ROMA: [null],
      ID_LOGI_MOTO: [null],
      ID_LOGI_VEIC: [null],
      CD_PEDI: [null],
      TIME: [new Date().getTime()],
    });
  }

  ngOnInit(): void {
    this.atividadesService.registrarAcesso().subscribe();
    this.onActivatedRoute();
    this.setBreadCrumb();
    this.getMotoristas({ 'IN_PAGI': '0' });
    this.getVeiculos({ 'IN_PAGI': '0' });
    this.getFiliais();
  }

  onActivatedRoute() {
    this.$activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (response) => {
        let _response = this.routerService.getBase64UrlParams(response);

        this.form.patchValue(_response);
        this.getRomaneios(this.getParams());
      }
    );
  }

  ngOnDestroy(): void {
    this.$activatedRouteSubscription.unsubscribe();
  }

  getFiliais(){
    this.service
      .getFiliais()
      .subscribe(
        response => {
          this.filiais = response;
          console.log(this.filiais)
        }
      )
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
        descricao: 'Retiras'
      }
    ];
  }

  getRomaneios(params) {
    if (!this.loading)
      this.loadingNavBar = true;

    this.service
      .getRomaneios(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.romaneios = response.body['data'];
            this.totalItems = response.body['total'];
            this.begin = 0;
            this.end = this.itemsPerPage;
          } else if (response.status === 204) {
            this.pnotify.notice('Não houve resultados para sua consulta');
            this.romaneios = [];
          } else {
            this.pnotify.error();
            this.romaneios = [];
          }
        },
        (error) => {
          this.pnotify.error();
          this.romaneios = [];
        }
      );
  }

  getPedidos(romaneio: ILogisticaEntregaFormacaoCargaRomaneio) {

    if(romaneio["pedidos"]){
      this.pedidos = romaneio["pedidos"];
      return
    }

    this.pedidosLoading = true;
    this.service
      .getPedidos(romaneio)
      .pipe(
        finalize(() => {
          this.pedidosLoading = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.pedidos = response.body['data'];
            romaneio["pedidos"] = this.pedidos;
          } else if (response.status === 204) {
            this.pnotify.notice('Nenhum pedido disponível');
            this.pedidos = [];
          } else {
            this.pnotify.error('Falha ao carregar pedidos');
            this.pedidos = [];
          }
        },
        (error) => {
          this.pnotify.error('Falha ao carregar pedidos');
          this.pedidos = [];
        }
      );
  }

  getRelatorio(params) {
    this.loadingNavBar = true;
    this.service
      .getRelatorio(params)
      .pipe(
        finalize(() => {
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.xlsxService.export({ "data": response.body['data'] })
          } else if (response.status === 204) {
            this.pnotify.notice('Nenhuma informação localizada.');
          } else {
            this.pnotify.error('Falha ao carregar dados do relatório.');
          }
        },
        (error) => {
          this.pnotify.error('Falha ao carregar dados do relatório.');
        }
      );
  }

  onExport() {
    this.getRelatorio(this.getParams())
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
    this.form.get('TIME').setValue(new Date().getTime());
    this.route.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams()),
    });
  }

  openRegister(params) {
    this.route.navigate([`../cadastro`], {
      relativeTo: this.activatedRoute,
      queryParams: { q: btoa(JSON.stringify({ ID_LOGI_ROMA: params?.ID_LOGI_ROMA })) },
    });
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

  onReset() {
    this.form.reset();
    this.form.get("DT_INIC").setValue(new Date());
    this.form.get("DT_FINA").setValue(new Date());
    this.route.navigate([]);
  }

  getMotoristas(params?) {
    this.motoristasService
      .getMotoristas(params)
      .pipe(
        finalize(() => {
          this.loadingMotoristas = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.motoristas = response.body['data'];
          }
        },
        (error) => {
          this.pnotify.error('Erro ao carregar motoristas');
        }
      );
  }

  getVeiculos(params?) {
    this.veiculosService
      .getVeiculos(params)
      .pipe(
        finalize(() => {
          this.loadingVeiculos = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.veiculos = response.body['data'];
          }
        },
        (error) => {
          this.pnotify.error('Erro ao carregar veículos');
        }
      );
  }

  onCancel(romaneio: ILogisticaEntregaFormacaoCargaRomaneio) {
    this.loadingNavBar = true;

    let _romaneio = JSON.parse(JSON.stringify(romaneio));

    _romaneio.IN_STAT = _romaneio.IN_STAT == '0' ? '1' : '0';

    this.service
      .postRomaneio(_romaneio)
      .pipe(
        finalize(() => {
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.pnotify.success();
            romaneio.IN_STAT = _romaneio.IN_STAT;
            romaneio.DS_OBSE = undefined;
          } else {
            this.pnotify.error();
          }
        },
        (error) => {
          try {
            this.pnotify.error(error.error.message);
          } catch (error) {
            this.pnotify.error();
          }
        }
      );
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      animated: false,
      ignoreBackdropClick: false
    });
  }

  showModalReasonCancellation(romaneio: ILogisticaEntregaFormacaoCargaRomaneio, template: TemplateRef<any>) {

    this.romaneio = romaneio;

    romaneio.IN_STAT == '1' ? this.openModal(template) : this.onCancel(romaneio);
  }

  setRomaneio(romaneio: ILogisticaEntregaFormacaoCargaRomaneio) {
    this.romaneio = romaneio;
  }

  openDetails(romaneio: ILogisticaEntregaFormacaoCargaRomaneio) {
    this.setRomaneio(romaneio);
    this.getPedidos(romaneio);
    /* this.openModal(template); */
  }

  setItensPerPage(itemsPerPage): number {
    this.itemsPerPage = itemsPerPage;
    this.end = itemsPerPage;
    return this.itemsPerPage;
  }

   /* Paginação */
   onPageChanged(event: PageChangedEvent): void {
    /* this.form.get('PAGINA').setValue(event.page);
    this.onSearch(); */
    this.begin = (event.page - 1) * event.itemsPerPage;
    this.end = event.page * event.itemsPerPage;
  }
  /* Paginação */

  setTipoEmpresa(empresa){
    /* this.form.get('CD_EMPR').setValue(empresa['empresa']); */
    this.form.get('TP_EMPR').setValue(empresa['tipoEmpresa']);
    this.onFilter();
  }

}
