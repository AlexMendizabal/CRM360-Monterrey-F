// ANGULAR
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

// BOOTSTRAP
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import {
  ModalDirective,
  BsModalRef,
  BsModalService,
} from 'ngx-bootstrap/modal';

// SERVICES
import { XlsxService } from 'src/app/shared/modules/xlsx/xlsx.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { DateService } from 'src/app/shared/services/core/date.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { FiscalRelatoriosNotasFiscaisSuprimentosService } from './notas-fiscais-suprimentos.service';
import { DetailPanelService } from 'src/app/shared/templates/detail-panel/detal-panel.service';

// INTERFACES
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { RouterService } from 'src/app/shared/services/core/router.service';

@Component({
  selector: 'notas-fiscais-suprimentos',
  templateUrl: './notas-fiscais-suprimentos.component.html',
  styleUrls: ['./notas-fiscais-suprimentos.component.scss'],
})
export class FiscalRelatoriosNotasFiscaisSuprimentosComponent
  implements OnInit, OnDestroy {
  @ViewChild('childModal', { static: false }) childModal: ModalDirective;

  spinnerFullScreen: boolean = false;
  loaderNavbar: boolean = false;
  form: FormGroup;
  data: Date = new Date();
  bsConfig: Partial<BsDatepickerConfig>;
  tipoDocumentos: any = [];
  formasPagamento: any = [];
  noResult = false;
  noResultModal = false;
  listas: any = [];
  showAdvancedFilter: boolean;
  razaoFatSup = '';
  razaoFatFin = '';
  razaoForn = '';
  cnpjFatSup = '';
  cnpjFatFin = '';
  decricaoDes = '';
  grupo = '';
  classe = '';
  tipoDes = '';
  tipoPag = '';
  formaPag = '';
  dtEmissao = '';
  dtLiquid = '';
  dtPagamento = '';
  valTotal = '';
  bancoCaixa = '';
  banco = '';
  $activateRoutedSubscription: Subscription;
  item: any = {};

  breadCrumbTree: any = [];
  compressedTable = false;

  dadosEmpty = false;
  appTitle = 'Detalhes';

  /* Paginação */
  itemsPerPage: number = 10;
  totalItems: number;
  currentPage: number = 1;
  begin: number = 0;
  end: number = 10;
  /* Paginação */

  modalRef: BsModalRef;
  config = {
    animated: true,
  };

  /* Config Table */
  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: false,
  };

  /* Painel de detalhes */
  $showDetailPanelSubscription: Subscription;
  showDetailPanel = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private xlsxService: XlsxService,
    private formBuilder: FormBuilder,
    private route: Router,
    private notice: PNotifyService,
    private modalService: BsModalService,
    private localeService: BsLocaleService,
    private relatorioService: FiscalRelatoriosNotasFiscaisSuprimentosService,
    private dateService: DateService,
    private atividadesService: AtividadesService,
    private detailPanelService: DetailPanelService,
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
      dataInicio: [this.dateService.getFirstDayMonth(), Validators.required],
      dataFim: [this.data, Validators.required],
      tipoDocumento: [null],
      numeroNota: [null],
      cnpjFatSup: [null],
      cnpjFatFin: [null],
      cnpjFor: [null],
      razaoFor: [null],
      formaPagamento: [null],
    });
  }

  ngOnInit() {
    this.onDetailPanel();
    this.setBreadCrumb();
    this.atividadesService.registrarAcesso().subscribe();

    this.relatorioService.getRelatorio().subscribe((response: any) => {
      if (Object.keys(response).length > 0) {
        this.tipoDocumentos = response;
      }
    });

    this.relatorioService.getFormaPagamento().subscribe((response: any) => {
      if (Object.keys(response).length > 0) {
        this.formasPagamento = response;
      }
    });

    this.getActiveRoute();
  }

  onDetailPanel(): void {
    this.$showDetailPanelSubscription = this.detailPanelService.config.subscribe(
      (event: any) => {
        this.showDetailPanel = event.showing;

        if (!this.showDetailPanel)
          this.listas.map((lista) => (lista.selected = false));
      }
    );
  }

  ngOnDestroy() {
    this.$showDetailPanelSubscription.unsubscribe();
    this.$activateRoutedSubscription.unsubscribe();
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
    const obj = this.form.value;

    for (let prop in obj) {
      if (obj[prop]) {
        if (prop == 'dataInicio' || prop == 'dataFim') {
          _params[prop] =
            obj[prop] instanceof Date
              ? this.dateService.convertToUrlDate(obj[prop])
              : obj[prop].substring(0, 10);
        } else {
          _params[prop] = obj[prop];
        }
      }
    }
    return _params;
  }

  onFilter() {
    this.route.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams()),
    });
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

  getLista(params, pagina = '1') {
    //this.totalItems = 0;
    this.spinnerFullScreen = true;
    let form: any = {};

    if (this.form.status === 'VALID') {
      this.relatorioService
        .getLista({
          params,
          pagina: pagina,
        })
        .pipe(
          finalize(() => {
            this.spinnerFullScreen = false;
          })
        )
        .subscribe(
          (response) => {
            if (response.status === 204) {
              this.notice.notice('Não há informações.');
              this.dadosEmpty = true;
            } else {
              this.listas = response.body['data'];
              this.listas.forEach((element, i) => {
                element.INDICE = i + 1;
              });
              this.totalItems = response.body['qtItens'];
              this.noResult = true;
              this.showAdvancedFilter = true;
            }
          },
          (error) => this.notice.error()
        );
    }
  }

  /* Paginação */
  onPageChanged(event: PageChangedEvent): void {
    this.begin = (event.page - 1) * event.itemsPerPage;
    this.end = event.page * event.itemsPerPage;
  }
  /* Paginação */

  onShowFilter() {
    this.showAdvancedFilter = !this.showAdvancedFilter;
  }

  openTab(i) {
    this.detailPanelService.show();
    let index = this.currentPage * this.itemsPerPage - this.itemsPerPage + i;
    this.razaoForn = this.listas[index].RAZAO_SOCIAL_FORNECEDOR;
    this.razaoFatSup = this.listas[index].RAZAO_SOCIAL_FATURAMENTO;
    this.razaoFatFin = this.listas[index].RAZAO_SOCIAL_CONTABIL;
    this.cnpjFatSup = this.listas[index].CNPJ_FATURAMENTO;
    this.cnpjFatFin = this.listas[index].CNPJ_CONTABIL;
    this.decricaoDes = this.listas[index].DESCRICAO_DESPESA;
    this.grupo = this.listas[index].GRUPO;
    this.classe = this.listas[index].CLASSE;
    this.tipoDes = this.listas[index].TIPO_DESPESA;
    this.tipoPag = this.listas[index].TIPO_PAGAMENTO;
    this.formaPag = this.listas[index].FORMA_PAGAMENTO;
    this.dtEmissao = this.listas[index].DATA_EMISSAO;
    this.dtLiquid = this.listas[index].DATA_VENCIMENTO;
    this.dtPagamento = this.listas[index].DATA_PAGAMENTO;
    this.valTotal = this.listas[index].VALOR_TOTAL;
    this.bancoCaixa = this.listas[index].BANCO_CAIXA;
    this.banco = this.listas[index].BANCO;
    this.compressedTable = true;
  }

  hideChildModal(): void {
    this.childModal.hide();
  }

  exportarExcel() {
    this.xlsxService.exportFile(this.listas, 'relatório');
  }

  /* setRouterParams(form: any) {
    this.route.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: form
    });
  } */

  setBreadCrumb() {
    this.activatedRoute.params.subscribe((form: any) => {
      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/fiscal/home',
        },
        {
          descricao: 'relatório de notas fiscais',
        },
      ];
    });
  }

  clickEvent(lista) {
    this.listas.forEach((element) => {
      if (element.INDICE != lista.INDICE) {
        element.STATUS = false;
      } else if (lista.STATUS == true) {
        lista.STATUS = true;
      } else {
        lista.STATUS = !lista.STATUS;
      }
      this.detailPanelService.loadedFinished(false);
    });
  }
}
