import { XlsxService } from 'src/app/shared/services/core/xlsx.service';
import { LogisticaDashboardConferenciaCteService } from './../../dashboards/conferencia-cte/conferencia-cte.service';
import { CustomTableConfig } from './../../../../shared/templates/custom-table/models/config';
//angular
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';

//servicos
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { RouterService } from 'src/app/shared/services/core/router.service';

// rxjs
import { finalize } from 'rxjs/operators';
import { Subscription, EMPTY } from 'rxjs';
import { take, switchMap } from 'rxjs/operators';

//modelos
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { DateService } from 'src/app/shared/services/core/date.service';

//masks
import { MASKS, NgBrazilValidators } from 'ng-brazil';
import { LogisticaRelatoriosAmbService } from './amb.service';
import { BsDatepickerConfig, BsLocaleService, PageChangedEvent } from 'ngx-bootstrap';

@Component({
  selector: 'logistica-relatorios-amb',
  templateUrl: './amb.component.html',
  styleUrls: ['./amb.component.scss'],
})
export class LogisticaRelatoriosAmbComponent implements OnInit, OnDestroy {
  public MASKS = MASKS;

  breadCrumbTree: Array<Breadcrumb>;
  idSubModulo: number;
  relatorio = [];
  noResult: boolean;
  loading = true; //Loading FullPage
  loadingNavBar = false; //Loading do NAVBAR
  dataExport = [];
  $activatedRouteSubscription: Subscription;
  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: false
  };
  form: FormGroup;

  bsConfig: Partial<BsDatepickerConfig>;
  
  // Tipos de Operações (Ativo/Inativo)
  tipos = [
    {
      cod: 'ABASTECIMENTO',
      nome: 'ABASTECIMENTO',
    },
    {
      cod: 'ESCOAMENTO',
      nome: 'ESCOAMENTO',
    },
  ];

  /* Paginação */
  itemsPerPage: number = 100;
  currentPage: number = 1;
  begin: number = 0;
  end: number = this.itemsPerPage;
  totalItems: number = 0;
  /* Paginação */

  constructor(
    private route: Router,
    private pnotify: PNotifyService,
    private activatedRoute: ActivatedRoute,
    private relatoriosAmbService: LogisticaRelatoriosAmbService,
    private conferenciaCteService: LogisticaDashboardConferenciaCteService,
    private formBuilder: FormBuilder,
    private xlsxService: XlsxService,
    private localeService: BsLocaleService,
    private routerService: RouterService,
    private dateService: DateService
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
    this.setBreadCrumb();
    this.onActivatedRoute();
  }

  ngOnDestroy() {
    this.$activatedRouteSubscription.unsubscribe();
  }

  onActivatedRoute() {
    this.$activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (response) => {
        const _response = this.routerService.getBase64UrlParams(response);
        this.form.patchValue(_response);
        this.getRelatorioAmb(this.getParams());
      }
    );
  }

  buildForm() {
    this.form = this.formBuilder.group({
      DT_INIC: [this.dateService.getFirstDayMonth()],
      DT_FINA: [new Date()],
      TIPO: [null],
      NOTA_FISCAL: [null],
      PESO_NF: [null],
      CODIGO_CTRC: [null],
      TIPOCTE: [null],
      CNPJ_EMITENTE: [null],
      CNPJ_DESTINATARIO: [null],
      CNPJ_PAGADOR: [null],
      FILIAL_CTRC: [null],
      TRANSPORTE: [null],
      PAGI: [1],
      TT_REGI_PAGI: [this.itemsPerPage],
      TIME: [new Date().getTime()],
    });
  }
  setPageRegistros(itemsPerPage) {
    this.itemsPerPage = itemsPerPage;
    this.onFilter();
  }
  setBreadCrumb() {
    const id = this.activatedRoute.snapshot.params.idSubModulo;
    this.breadCrumbTree = [
      {
        descricao: 'Home',
        routerLink: `/logistica/home`,
      },
      {
        descricao: 'Cadastros',
        routerLink: `/logistica/relatorios/${id}`,
      },
      {
        descricao: 'Integração AMB',
      },
    ];
  }

  onFilter() {
    this.form.get('TIME').setValue(new Date().getTime());
    this.route.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams()),
    });
  }

  getRelatorioAmb(params?) {
    if (!this.loading) this.loadingNavBar = true;

    this.conferenciaCteService
      .getRelatorio(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.relatorio = response.body['data'];
            this.totalItems = this.relatorio.length;
            this.noResult = false;
          } else {
            this.noResult = true;
            this.relatorio = [];
          }
        },
        (error) => {
          this.pnotify.error();
          this.noResult = true;
        }
      );
  }

  onReset() {
    this.form.reset();
    this.form.patchValue({
      PAGI: 1,
      TT_REGI_PAGI: 100,
      TIME: [new Date().getTime()],
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
          _params[prop] = this.dateService.convertToUrlDate(_obj[prop]);
        else _params[prop] = _obj[prop];
      }
    }

    return _params;
  }

  onExport(): void {
    this.xlsxService.export({data: this.relatorio})
    this.pnotify.success('Seu relatório será gerado em instantes');
  }
}
