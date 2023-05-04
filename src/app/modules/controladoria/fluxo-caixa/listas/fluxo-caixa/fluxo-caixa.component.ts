// ANGULAR
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

// BOOTSTRAP
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import {
  BsModalService,
  BsModalRef,
  ModalDirective,
} from 'ngx-bootstrap/modal';

// SERVICES
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { DateService } from 'src/app/shared/services/core/date.service';
import { XlsxService } from 'src/app/shared/modules/xlsx/xlsx.service';
import { DetailPanelService } from 'src/app/shared/templates/detail-panel/detal-panel.service';

// INTERFACES
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';
import { ControladoriaFluxoCaixaService } from '../../services/fluxo-caixa.service';
import { ControladoriaEmpresasService } from '../../services/empresas.service';
import { ControladoriaTiposFluxoCaixaService } from '../../services/tipos-fluxo-caixa.service';

@Component({
  selector: 'lista-fluxo-caixa',
  templateUrl: './fluxo-caixa.component.html',
  styleUrls: ['./fluxo-caixa.component.scss'],
})
export class ControladoriaListaFluxoCaixaComponent
  implements OnInit, OnDestroy {
  spinnerFullScreen: boolean = false;
  loaderNavbar: boolean = false;
  breadCrumbTree: any = [];
  data: Date = new Date();
  bsConfig: Partial<BsDatepickerConfig>;
  form: FormGroup;
  tipos = [];
  tiposLancamentos = [];
  empresas = [];
  noResult = false;
  dadosEmpty = false;
  $activateRoutedSubscription: Subscription;
  $lancamentoServiceSubscription: Subscription;
  listas: any = [];
  item: any = {};
  showAdvancedFilter: boolean;
  listaSelecionada: any = [];
  listaLog: any = [];
  editParam: any = [];

  appTitle = 'Lançamento Fluxo de Caixa';

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
    animated: false,
    ignoreBackdropClick: true,
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private routerService: RouterService,
    private fluxoCaixaService: ControladoriaFluxoCaixaService,
    private tiposFluxoCaixaService: ControladoriaTiposFluxoCaixaService,
    private empresaService: ControladoriaEmpresasService,
    private notice: PNotifyService,
    private localeService: BsLocaleService,
    private dateService: DateService,
    private xlsxService: XlsxService,
    private detailPanelService: DetailPanelService,
    private modalService: BsModalService,
    private formBuilder: FormBuilder
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
      COD_TIPO: [null],
      COD_TIPO_LANCAMENTO: [null],
      COD_EMPR_LANCAMENTO: [null],
      IN_STAT: [null],
      JUSTIFICATIVA: [null, Validators.minLength(10)],
      time: [new Date().getTime()],
    });
  }

  ngOnInit(): void {
    this.setBreadCrumb();
    this.getTipos();
    this.getEmpresas();
    this.getActiveRoute();
    this.onDetailPanel();
    this.getTiposFluxoCaixa(this.getParams());
  }

  setBreadCrumb() {
    this.breadCrumbTree = [
      {
        descricao: 'Home',
        routerLink: '/controladoria/home',
      },
      {
        descricao: this.appTitle,
      },
    ];
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

  ngOnDestroy() {
    this.$showDetailPanelSubscription.unsubscribe();
    this.$activateRoutedSubscription.unsubscribe();
    this.$lancamentoServiceSubscription.unsubscribe();
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

  /* Paginação */
  onPageChanged(event: PageChangedEvent): void {
    this.begin = (event.page - 1) * event.itemsPerPage;
    this.end = event.page * event.itemsPerPage;
  }
  /* Paginação */

  getTipos() {
    this.fluxoCaixaService.getTipos().subscribe((response) => {
      this.tipos = response['data'];
    });
  }

  getTiposFluxoCaixa(param) {
    this.tiposFluxoCaixaService
      .getTiposFluxoCaixa(param['COD_TIPO'])
      .subscribe((response) => {
        if (response.status === 204) {
          this.notice.notice('Não existe tipos de lançamentos cadastrados.');
        } else this.tiposLancamentos = response.body['data'];
      });
  }

  getEmpresas() {
    this.empresaService.getEmpresas(this.getParams()).subscribe((response) => {
      if (response.status === 204) {
        this.notice.notice('Não existe empresas cadastradas.');
      } else this.empresas = response.body['data'];
    });
  }

  getActiveRoute() {
    this.$activateRoutedSubscription = this.activatedRoute.queryParams.subscribe(
      (response) => {
        if (Object.keys(response).length > 0) {
          const _response = this.routerService.getBase64UrlParams(response);
          this.form.patchValue(_response);
        }
        this.getFluxoCaixa(this.getParams());
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

  getFluxoCaixa(params) {
    this.spinnerFullScreen = true;

    if (this.form.status === 'VALID') {
      this.fluxoCaixaService
        .getFluxoCaixa(params)
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

    this.$lancamentoServiceSubscription = this.fluxoCaixaService
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
    this.fluxoCaixaService.setDetailPanel('principal');
  }

  openJustificativa(template, data) {
    this.form.get('JUSTIFICATIVA').reset();
    this.listaSelecionada = [];
    this.listaSelecionada = data;
    this.modalRef = this.modalService.show(template, this.config);
  }

  changeType() {
    this.spinnerFullScreen = true;
    let _saldo = JSON.parse(JSON.stringify(this.listaSelecionada));

    _saldo.IN_STAT = _saldo['IN_STAT'] == '1' ? '0' : '1';
    _saldo.JUSTIFICATIVA = this.form.value['JUSTIFICATIVA'];

    this.fluxoCaixaService
      .postCadastrar(_saldo)
      .pipe(
        finalize(() => {
          this.spinnerFullScreen = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200)
            this.notice.success(response.body['mensagem']);
          this.listaSelecionada.IN_STAT = _saldo.IN_STAT;
        },
        (error) => this.notice.error()
      );
  }

  openLog(data) {
    this.fluxoCaixaService.setStateModal(data);
  }

  onDuplicate(item) {
    this.route.navigate(['./novo'], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(item),
    });
  }

  onEdit(item) {
    this.route.navigate(['./', item.COD_LANCAMENTO], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(item),
    });
  }
}
