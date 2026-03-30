//angular
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

//services
import { RouterService } from 'src/app/shared/services/core/router.service';
import { DateService } from 'src/app/shared/services/core/date.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { ControladoriaAssociacoesPluserCentroCustoEmpresasService } from '../services/empresas.service';
import { DetailPanelService } from 'src/app/shared/templates/detail-panel/detal-panel.service';

//ngx
import { BsLocaleService, BsDatepickerConfig, PageChangedEvent } from 'ngx-bootstrap';

//models
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';

//rxjs
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

//ng-brazil
import { MASKS, NgBrazilValidators } from 'ng-brazil';

@Component({
  selector: 'controladoria-associacoes-pluser-empresas-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss']
})
export class ControladoriaAssociacoesPluserCentroCustoEmpresasListaComponent implements OnInit {

  public MASKS = MASKS;

  loading: boolean = true;
  loadingNavBar: boolean = false;
  noResult: boolean = false;

  appTitle: string = "Empresa TID x Centro de Custo do Veiculo TMS"

  form: FormGroup;

  breadCrumbTree: any = [];

  showAdvancedFilter = true;
  restricoes: any;

  empresas = [];
  empresa = {};

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
    subtitleBorder: true
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
    private service: ControladoriaAssociacoesPluserCentroCustoEmpresasService,
    private detailPanelService: DetailPanelService
  ) { }

  ngOnInit(): void {
    this.onFormBuilder();
    this.registraAcesso()
    this.setBreadCrumb();
    this.onActivatedRoute();
    this.onDetailPanelEmitter();
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

          this.getEmpresas(this.getParams());

        }
      )
  }

  onFormBuilder() {
    this.form = this.formBuilder.group({
      CD_EMPR: [null],
      DS_NOME_FANT: [null],
      DS_CNPJ: [null],
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

  getEmpresas(params?) {

    if (!this.loading)
      this.loadingNavBar = true;

    this.service
      .getEmpresas(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.empresas = response.body["data"];
            this.empresas.unshift(...[
              {
                "CD_EMPR": 570,
                "DS_NOME_FANT": "DGA",
                "IN_STAT": 1
              },
              {
                "CD_EMPR": 572,
                "DS_NOME_FANT": "DGP",
                "IN_STAT": 1
              }
            ]);
            
            this.totalItems = this.empresas.length;
            this.noResult = false;
          } else {
            this.empresas = [];
            this.noResult = true;
            this.pnotify.notice("Nenhum registro localizado.");
          }
        },
        (error) => {
          this.empresas = [];
          this.noResult = true;
          this.pnotify.error();
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

  onViewDetails(empresa) {
    this.empresa = empresa;
    this.detailPanelTitle = "(" + empresa["CD_EMPR"] + ") " + empresa["DS_NOME_FANT"];
    this.empresas.map(item => item["ACTI"] = item["CD_EMPR"] == empresa["CD_EMPR"] ? true : false);
  }

  onDetailPanelEmitter(): void {
    this.$detailPanelSubscription = this.detailPanelService.config.subscribe(
      (event: any) => {
        this.showDetailPanel = event.showing;

        if (!event.showing)
          this.empresas.map(item => item["ACTI"] = false);

      }
    );
  }

  onReset() {
    this.form.reset()
  }

}
