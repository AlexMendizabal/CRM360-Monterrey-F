import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators,
} from '@angular/forms';
import {
  BsModalService,
  BsModalRef,
  ModalDirective,
} from 'ngx-bootstrap/modal';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { ActivatedRoute, Router } from '@angular/router';
import { DateService } from 'src/app/shared/services/core/date.service';
import { XlsxService } from 'src/app/shared/modules/xlsx/xlsx.service';
import { finalize } from 'rxjs/operators';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { Subscription } from 'rxjs';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { DetailPanelService } from 'src/app/shared/templates/detail-panel/detal-panel.service';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';
import { ControladoriaSaldosBancosService } from '../../services/saldos-bancos.service';
import { ControladoriaTiposSaldosBancosService } from '../../services/tipos-saldos-bancos.service';

@Component({
  selector: 'lista-saldos-bancos',
  templateUrl: './saldos-bancos.component.html',
  styleUrls: ['./saldos-bancos.component.scss']
})
export class ControladoriaListaSaldosBancosComponent implements OnInit, OnDestroy {
  spinnerFullScreen: boolean = false;
  loaderNavbar: boolean = false;
  breadCrumbTree: any = [];
  data: Date = new Date();
  bsConfig: Partial<BsDatepickerConfig>;
  form: FormGroup;
  listas: any = [];
  item: any = {};
  empresas = [];
  bancos = [];
  tiposLancamentos = [];
  noResult = false;
  dadosEmpty = false;
  $activateRoutedSubscription: Subscription;
  $saldosBancosSubscription: Subscription;
  showAdvancedFilter: boolean;
  idLanc = 0;
  listaSelecionada: any = [];

  appTitle = 'Lançamento Saldos Bancos';

  /* Paginação */
  itemsPerPage: number = 10;
  totalItems: number;
  currentPage: number = 1;
  begin: number = 0;
  end: number = 10;

  /* Painel de detalhes */
  $showDetailPanelSubscription: Subscription;
  showDetailPanel = false;
  detailPanel = 'principal';

  /* Config Table */
  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
  };

  status = [
    {
      COD: '1',
      NOME: 'Ativos',
    },
    {
      COD: '0',
      NOME: 'Inativos',
    },
  ];

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

  modalRef: BsModalRef;
  config = {
    animated: true,
    ignoreBackdropClick: true,
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private localeService: BsLocaleService,
    private formBuilder: FormBuilder,
    private dateService: DateService,
    private xlsxService: XlsxService,
    private saldosBancosService: ControladoriaSaldosBancosService,
    private tipoSaldosBancosService: ControladoriaTiposSaldosBancosService,
    private notice: PNotifyService,
    private routerService: RouterService,
    private route: Router,
    private modalService: BsModalService,
    private detailPanelService: DetailPanelService
  ) {
    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );

    this.form = this.formBuilder.group({
      DT_INIC: [this.dateService.getFirstDayMonth(), Validators.required],
      DT_FINA: [this.data, Validators.required],
      ID_BANC_SALD: [this.idLanc],
      ID_BANC_TIPO: [null],
      ID_LANC_BANC: [null],
      ID_LANC_EMPR: [null],
      IN_STAT: [null],
      JUSTIFICATIVA: [null, Validators.minLength(10)],
      time: [new Date().getTime()],
    });
  }

  ngOnInit(): void {
    this.setBreadCrumb();
    this.getEmpresas();
    this.getBancos();
    this.getTipos();
    this.getActiveRoute();
    this.onDetailPanel();
  }

  ngOnDestroy() {
    this.$showDetailPanelSubscription.unsubscribe();
    this.$activateRoutedSubscription.unsubscribe();
    this.$saldosBancosSubscription.unsubscribe();
  }

  setBreadCrumb() {
    this.activatedRoute.params.subscribe((form: any) => {
      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/controladoria/home',
        },
        {
          descricao: this.appTitle,
        },
      ];
    });
  }

  exportarExcel() {
    this.xlsxService.exportFile(this.listas, 'lançamentos');
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

  onFilter() {
    this.form.get('time').setValue(new Date().getTime());
    this.route.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams()),
    });
  }

  onShowFilter() {
    this.showAdvancedFilter = !this.showAdvancedFilter;
  }

  getEmpresas() {
    this.saldosBancosService
      .getEmpresas(this.getParams())
      .subscribe((response) => {
        if (response.status === 204) {
          this.notice.notice('Não há empresa cadastrada.');
        } else this.empresas = response.body['data'];
      });
  }

  getBancos() {
    this.saldosBancosService.getBancos().subscribe((response) => {
      if (response.status === 204) {
        this.notice.notice('Não há bancos cadastrados.');
      } else this.bancos = response.body['data'];
    });
  }

  getTipos() {
    this.tipoSaldosBancosService
      .getTipos(this.getParams())
      .subscribe((response) => {
        if (response.status === 204) {
          this.notice.notice('Não há tipos de lançamentos cadastrados.');
        } else this.tiposLancamentos = response.body['data'];
      });
  }

  getActiveRoute() {
    this.$activateRoutedSubscription = this.activatedRoute.queryParams.subscribe(
      (response) => {
        if (Object.keys(response).length > 0) {
          const _response = this.routerService.getBase64UrlParams(response);
          this.form.patchValue(_response);
        }
        this.getLista(this.getParams());
      }
    );
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

  getLista(params) {
    this.spinnerFullScreen = true;

    if (this.form.status === 'VALID') {
      this.saldosBancosService
        .getLista(params)
        .pipe(
          finalize(() => {
            this.spinnerFullScreen = false;
          })
        )
        .subscribe(
          (response) => {
            if (response.status === 204) {
              this.notice.notice('Não há informações para esse período.');
              this.showAdvancedFilter = true;
              this.dadosEmpty = true;
              this.noResult = false;
            } else {
              this.listas = response.body['data'];
              this.listas.forEach((element, i) => {
                element.INDICE = i + 1;
              });
              this.totalItems = response.body['data'].length;
              this.dadosEmpty = false;
              this.noResult = true;
              this.showAdvancedFilter = true;
            }
          },
          (error) => this.notice.error()
        );
    }
  }

  onDetailPanel(): void {
    this.$showDetailPanelSubscription = this.detailPanelService.config.subscribe(
      (event: any) => {
        if (this.detailPanel !== 'principal') return;
        this.showDetailPanel = event.showing;

        if (!this.showDetailPanel)
          this.listas.map((lista) => (lista.selected = false));
      }
    );

    this.$saldosBancosSubscription = this.saldosBancosService
      .getDetailPanel()
      .subscribe((event) => {
        this.detailPanel = event;
        this.detailPanelService.loadedFinished(false);
      });
  }

  openTab(item) {
    this.listas.map((lista) => (lista.selected = false));
    this.item = item;
    this.item.selected = true;
  }

  clickEvent(lista) {
    this.saldosBancosService.setDetailPanel('principal');
    this.listas.forEach((element) => {
      if (element.INDICE != lista.INDICE) {
        element.STATUS = false;
      } else if (lista.STATUS == true) {
        lista.STATUS = true;
      } else {
        lista.STATUS = !lista.STATUS;
      }
    });
  }

  /* Paginação */
  onPageChanged(event: PageChangedEvent): void {
    this.begin = (event.page - 1) * event.itemsPerPage;
    this.end = event.page * event.itemsPerPage;
  }
  /* Paginação */

  openJustificativa(template, data) {
    this.form.get('JUSTIFICATIVA').reset();
    this.listaSelecionada = data;
    this.modalRef = this.modalService.show(template, this.config);
  }

  changeType() {
    this.spinnerFullScreen = true;
    let _saldo = JSON.parse(JSON.stringify(this.listaSelecionada));

    _saldo.IN_STAT = _saldo['IN_STAT'] == '1' ? '0' : '1';
    _saldo.JUSTIFICATIVA = this.form.value['JUSTIFICATIVA'];

    this.saldosBancosService
      .postCadastrar(_saldo)
      .pipe(
        finalize(() => {
          this.spinnerFullScreen = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.notice.success(response.body['mensagem']);
            this.listaSelecionada.IN_STAT = _saldo.IN_STAT;
          }
        },
        (error) => this.notice.error()
      );
  }

  openLog(data) {
    this.saldosBancosService.setStateModal(data);
  }

  onDuplicate(item) {
    this.route.navigate(['./novo'], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(item),
    });
  }
}
