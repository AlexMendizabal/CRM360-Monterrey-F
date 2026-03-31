//angular
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

//services
import { RouterService } from 'src/app/shared/services/core/router.service';
import { DateService } from 'src/app/shared/services/core/date.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { DetailPanelService } from 'src/app/shared/templates/detail-panel/detal-panel.service';

//ngx
import { BsLocaleService, BsDatepickerConfig, PageChangedEvent } from 'ngx-bootstrap';
import { ControladoriaAssociacoesPluserTipoDespesaService } from '../services/tipo-despesa.service';

//models
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';

//rxjs
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { IControladoriaAssociacoesPluserTipoDespesa } from '../models/tipoDespesa';
import { IControladoriaAssociacoesPluserGrupoDespesa } from '../models/grupoDespesa';
import { IControladoriaAssociacoesPluserClasseDespesa } from '../models/classeDespesa';

@Component({
  selector: 'lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss']
})
export class ControladoriaAssociacoesPluserTipoDespesaListaComponent implements OnInit {

  loading: boolean = true;
  loadingNavBar: boolean = false;
  noResult: boolean = false;

  appTitle: string = "TID(Tipo de despesa) x TMS(Plano de contas)"

  form: FormGroup;

  breadCrumbTree: any = [];

  showAdvancedFilter = true;
  restricoes: any;

  tiposDespesa: IControladoriaAssociacoesPluserTipoDespesa[] = [];
  tipoDespesa: Partial<IControladoriaAssociacoesPluserTipoDespesa> = {};

  gruposDespesa: IControladoriaAssociacoesPluserGrupoDespesa[] = [];
  classesDespesa: IControladoriaAssociacoesPluserClasseDespesa[] = [];

  bsConfig: Partial<BsDatepickerConfig>;

  /* Pagination */
  itemsPerPage: number = 25;
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

  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
    isFixed: true
  };

  $activatedRouteSubscription: Subscription;

  $detailPanelSubscription: Subscription;
  showDetailPanel: boolean;
  detailPanelTitle = "Detalhes";

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private routerService: RouterService,
    private localeService: BsLocaleService,
    private dateService: DateService,
    private atividadesService: AtividadesService,
    private pnotify: PNotifyService,
    private service: ControladoriaAssociacoesPluserTipoDespesaService,
    private detailPanelService: DetailPanelService
  ) { }

  ngOnInit(): void {
    this.onFormBuilder();
    this.registraAcesso()
    this.setBreadCrumb();
    this.onActivatedRoute();
    this.onDetailPanelEmitter();
    this.getGrupoDespesa();
    this.getClasseDespesa();
  }

  ngOnDestroy() {
    this.$activatedRouteSubscription.unsubscribe();
  }

  onActivatedRoute() {
    this.$activatedRouteSubscription = this.activatedRoute.queryParams
      .subscribe(
        (response) => {

          let _response = this.routerService.getBase64UrlParams(response);

          if (Object.keys(_response).length > 0)
            this.form.patchValue(_response);

          this.getTipoDespesa(this.getParams());

        }
      )
  }

  onFormBuilder() {
    this.form = this.formBuilder.group({
      CD_DESP_TIPO: [null],
      DS_DESP_TIPO: [null],
      CD_DESP_GRUP: [null],
      DS_DESP_GRUP: [null],
      CD_DESP_CLAS: [null],
      DS_DESP_CLAS: [null],
      TIME: [(new Date()).getTime()]
    })
  }

  registraAcesso() {
    this.atividadesService.registrarAcesso().subscribe();
  }

  setBreadCrumb() {
    this.breadCrumbTree = [
      {
        descricao: 'Controladoria'
      },
      {
        descricao: 'Associações',
        routerLink: './../'
      },
      {
        descricao: this.appTitle
      }
    ];
  }

  getTipoDespesa(params?) {

    if (!this.loading)
      this.loadingNavBar = true;

    this.service
      .getTipoDespesa(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.tiposDespesa = response.body["data"];
            this.totalItems = this.tiposDespesa.length;
            this.noResult = false;
          } else {
            this.tiposDespesa = [];
            this.noResult = true;
            this.pnotify.notice("Nenhum registro localizado.");
          }
        },
        (error) => {
          this.tiposDespesa = [];
          this.noResult = true;
          this.pnotify.error();
        }
      )

  }

  getGrupoDespesa(params?) {

    this.service
      .getGrupoDespesa(params)
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.gruposDespesa = response.body["data"];
          } else {
            this.gruposDespesa = [];
          }
        },
        (error) => {
          this.gruposDespesa = [];
        }
      )
  }

  getClasseDespesa(params?) {

    this.service
      .getClasseDespesa(params)
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.classesDespesa = response.body["data"];
          } else {
            this.classesDespesa = [];
          }
        },
        (error) => {
          this.classesDespesa = [];
        }
      )
  }

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
    this.showDetailPanel = false;
    this.route.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams())
    })
  }

  /* Paginação */
  onPageChanged($event: PageChangedEvent) {
    this.begin = ($event.page - 1) * this.itemsPerPage;
    this.end = this.begin + this.itemsPerPage;
  }
  /* Paginação */

  onViewDetails(tipoDespesa: IControladoriaAssociacoesPluserTipoDespesa) {

    this.tiposDespesa.map(item => {
      item["ACTI"] = item.CD_DESP_TIPO === tipoDespesa.CD_DESP_TIPO ? true : false;
    });

    this.tipoDespesa = tipoDespesa;
    this.detailPanelTitle = "(" + tipoDespesa.CD_DESP_TIPO + ") " + tipoDespesa.DS_DESP_TIPO;

  }

  onDetailPanelEmitter(): void {
    this.$detailPanelSubscription = this.detailPanelService.config.subscribe(
      (event: any) => {
        this.showDetailPanel = event.showing;
        if (!event.showing)
          this.tiposDespesa.map(item => item["ACTI"] = false);
      }
    );
  }

  onReset() {
    this.form.reset()
  }

}
