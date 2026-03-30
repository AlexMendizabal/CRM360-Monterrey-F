// angular
import { Component, OnInit, ViewChild, ElementRef, TemplateRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

// services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { DateService } from 'src/app/shared/services/core/date.service';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { LogisticaEntregaFusionService } from '../../services/fusion.service';
import { LogisticaSteellogService } from '../../../services/steellog.service';
import { LogisticaEntregaRavexService } from './services/ravex.service';
import { DetailPanelService } from 'src/app/shared/templates/detail-panel/detal-panel.service';

// rxjs
import { finalize, delay } from 'rxjs/operators';
import { Subscription } from 'rxjs';

// ngx
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { PageChangedEvent, BsModalService, BsModalRef } from 'ngx-bootstrap';

import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { ILogisticaSteelLogTipoTransporte } from '../../../models/steellog/tipoTransporte';
import { ILogisticaSteelLogEmpresa } from '../../../models/steellog/empresa';
import { ILogisticaRavexViagem } from './models/viagem';

@Component({
  selector: 'logistica-entrega-monitor-integracao-ravex',
  templateUrl: './ravex.component.html',
  styleUrls: ['./ravex.component.scss']
})
export class LogisticaEntregaMonitoresRavexComponent implements OnInit {

  @ViewChild('template', { static: false }) template: TemplateRef<any>;
  @ViewChild('txtMotivoCancelamento', { static: false }) txtMotivoCancelamento: ElementRef;

  appTitle = 'MONITOR DE INTEGRACIÓN';

  modalRef: BsModalRef;

  form: FormGroup;

  loading = true;
  loaderNavbar = false;
  showAdvancedFilter = true;

  isDisabled = true;

  breadCrumbTree: Array<Breadcrumb>;

  tipoTransporte: Array<ILogisticaSteelLogTipoTransporte> = new Array();
  loadingTipoTransporte = false;

  detailPanelTitle: string;

  items = [];
  totalItems = 0;
  itemsPerPage = 100;
  currentPage = 1;
  begin = 0;
  end = this.itemsPerPage - 1;

  $activatedRouteSubscription: Subscription;
  $showDetailPanelSubscription: Subscription;
  showDetailPanel = false;

  qtItensIntegrados = 0;
  qtItensIntegradosParcialmente = 0;
  qtItensComErro = 0;
  qtItensNaoIntegrados = 0;
 
  empresas: Array<ILogisticaSteelLogEmpresa>;
  loadingEmpresas: boolean;

  entregas: Array<any> = [];
  loadingEntregas: boolean;

  viagem: Array<ILogisticaRavexViagem> = [];

  bsConfig: Partial<BsDatepickerConfig>;

  grid = {
    coleta: {
      name: "COLETA",
      active: true,
    },
    manifesto: {
      name: "MANIFESTO",
      active: true,
    },
    idRavex: {
      name: "ID RAVEX",
      active: true,
    },
    tipoColeta: {
      name: "TIPO DA COLETA",
      active: true,
    },
    motorista: {
      name: "MOTORISTA",
      active: false,
    },
    veiculo: {
      name: "VEÍCULO",
      active: false,
    },
    emissao: {
      name: "EMISSÃO",
      active: true,
    },
    saidaPrevista: {
      name: "SAÍDA PREVISTA",
      active: true,
    },
    integracao: {
      name: "INTEGRAÇÃO",
      active: true,
    }
  }

  constructor(
    private fusionService: LogisticaEntregaFusionService,
    private formBuilder: FormBuilder,
    private pnotify: PNotifyService,
    private dateService: DateService,
    private localeService: BsLocaleService,
    private route: Router,
    private activatedRoute: ActivatedRoute,
    private modalService: BsModalService,
    private atividadesService: AtividadesService,
    private detailPanelService: DetailPanelService,
    private routerService: RouterService,
    private steellogService: LogisticaSteellogService,
    private ravexServices: LogisticaEntregaRavexService
  ) {

    this.form = this.formBuilder.group({
      DT_INIC: [new Date()],
      DT_FINA: [new Date()],
      NR_MANI: [null],
      NR_COLE: [null],
      CD_TRAN: [null],
      CD_EMPR: [209],
      NM_MOTO: [null],
      CD_PLAC: ["GEG7456,GFJ4579"],
      IN_INTE: ["T"],
      CD_TIPO_COLE: [0],
      CD_STAT_INTE: ["1"],
      PAGI: [1],
      TT_REGI_PAGI: [this.itemsPerPage],
      TIME: [null]
    });

    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );

    this.modalService.config = {
      backdrop: 'static',
      animated: false
    };

  }

  ngOnInit() {
    this.registraAcesso();
    this.setBreadCrumb();
    this.onActivatedRoute();
    this.getTipoTransporte();
    this.getEmpresas();
    this.onDetailPanelEmitter();
  }

  ngOnDestroy() {
    this.$activatedRouteSubscription.unsubscribe();
    this.$showDetailPanelSubscription.unsubscribe();
  }

  onDetailPanelEmitter(): void {
    this.$showDetailPanelSubscription = this.detailPanelService.config.subscribe(
      (event: any) => {
        this.showDetailPanel = event.showing;
        if (!event.showing) this.items.map((element) => element.selected = false);
      }
    );
  }

  registraAcesso() {
    this.atividadesService.registrarAcesso().subscribe();
  }

  onActivatedRoute() {
    this.$activatedRouteSubscription = this.activatedRoute.queryParams
      .subscribe(
        (response) => {
          if (Object.keys(response).length > 0) {
            this.form.patchValue(this.routerService.getBase64UrlParams(response));
            this.getViagens(this.getParams());
          } else {
            this.loading = false;
          }
        }
      )
  }

  setBreadCrumb() {
    this.breadCrumbTree = [
      {
        descricao: 'Logistica'
      },
      {
        descricao: 'GESTIÓN DE ENTREGAS',
        routerLink: '../../'
      },
      {
        descricao: this.appTitle
      }
    ];
  }

  onSearch() {

    this.form.get("TIME").setValue((new Date()).getTime());
    this.items.map((element) => element.selected = false);
    this.showDetailPanel = false;

    this.route.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams()),
      queryParamsHandling: 'merge'
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
          _params[prop] = this.dateService.convertToUrlDate(_obj[prop])
        else
          _params[prop] = _obj[prop]
      }
    }

    return _params;

  }

  getViagens(params){
    
    if (!this.loading)
      this.loaderNavbar = true;

    this.ravexServices
      .getViagens(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loaderNavbar = false;
        })
      )
      .subscribe(
        response => {
          if (response.status === 200) {
            this.items = response.body["data"];
            
            this.qtItensIntegrados = response.body["totalIntegrated"];
            this.qtItensIntegradosParcialmente = response.body["totalPartiallyIntegrated"];
            this.qtItensNaoIntegrados = response.body["totalNotIntegrated"];
            this.qtItensComErro = response.body["totalWithErrors"];
            this.totalItems = response.body["total"];
          } else if (response.status === 204) {
            this.pnotify.notice('Nenhum registro localizado');
            this.items = [];
          } else {
            this.pnotify.error();
            this.items = [];
          }
        }, error => {
          this.pnotify.error();
          this.items = [];
        }
      )
  }

  getEntregas(viagem){
    
    if(viagem?.entregas){
      this.entregas = viagem.entregas
      this.detailPanelService.loadedFinished(false);
      return
    }

    const params = {
      NR_COLE: viagem?.NR_COLE,
      CD_EMPR: viagem?.CD_EMPR
    }

    this.viagem = viagem;

    this.loadingEntregas = true;

    this.ravexServices
      .getEntregas(params)
      .pipe(
        finalize(() => {
          this.detailPanelService.loadedFinished(false);
          this.loadingEntregas = false;
        })
      )
      .subscribe(
        response => {
          
          if (response.status !== 200) {
            this.pnotify.notice('Nenhum registro localizado');
            this.entregas = [];
            return;
          }

          this.entregas = response.body["data"];
          viagem.entregas = response.body["data"];
          
        }, error => {
          this.pnotify.error();
          this.entregas = [];
        }
      )
  }

  onResetForm() {
    this.form.reset();
  }

  setItensPerPage(ev): number {
    this.itemsPerPage = ev.itemsPerPage;
    this.end = ev.itemsPerPage;
    return this.itemsPerPage;
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

  integrarViagem(item){
    item.loading = true;

    this.ravexServices
      .postViagem(item)
      .pipe(
        finalize(() => {
          //item.loading = false;
        })
      )
      .subscribe(
        (response) => {
          
          if (response.status !== 200) {
            item.loading = false;
            this.pnotify.error("Viagem não localizada");
            return
          }

          item.DT_INTE = new Date();

          switch (item.IN_INTE) {
            case 'N':
              this.qtItensNaoIntegrados--
              break;

            case 'E':
              this.qtItensComErro--
              break;

            default:
              break;
            }

            item.IN_INTE = 'I';
            this.qtItensIntegrados++;

          this.pnotify.success(`Coleta (${item.CD_EMPR}) ${item.NR_COLE} integrada com sucesso, adicionando entregas...`);

          item.ID_RAVX = response.body["data"]["ravex"]["data"];
          item.ID_VIAG = item.ID_RAVX;

          const params = {
            ID_VIAG: item["ID_RAVX"],
            CD_EMPR: item["CD_EMPR"],
            NR_COLE: item["NR_COLE"]
          };

          this.integrarEntregas(params, item);

        },
        (error) => {
          item.loading = false;
          this.pnotify.error(`Erro ao integrar a coleta (${item.CD_EMPR}) ${item.NR_COLE}.`);
        }
      )
  }

  integrarEntregas(entrega, viagem){

    entrega.loading = true;

    entrega["ID_VIAG"] = viagem["ID_VIAG"];

    this.ravexServices
      .postEntregas(entrega)
      .pipe(
        finalize(() => {
          
          entrega.loading = false;

          //item.loading = false;
        })
      )
      .subscribe(
        response => {
          
          if(response.status !== 200){
            viagem.loading = false;
            this.pnotify.success(`A coleta (${viagem.CD_EMPR}) ${viagem.NR_COLE} não possui entregas.`);
            return;
          }

          this.pnotify.success(`Entregas da coleta (${viagem.CD_EMPR}) ${viagem.NR_COLE} integradas na Ravex, adicionando notas fiscais...`);

          entrega.IN_INTE = "I";

          const data = response.body["data"];

          this.integrarNotasFiscais(entrega, viagem);
          
        },
        error => {
          viagem.loading = false;
          try{
            this.pnotify.error(error.error.message)
          }catch{
            this.pnotify.error(`Erro ao adiconar as entregas da coleta (${entrega?.CD_EMPR}) ${entrega?.NR_COLE}.`)
          }
        }
      )
  }

  integrarNotasFiscais(params, item){
    this.ravexServices
      .postNotasFiscais(params)
      .pipe(
        finalize(() => {
          item.loading = false;
        })
      )
      .subscribe(
        response => {
          this.pnotify.success(`Notas Fiscais da coleta (${item.CD_EMPR}) ${item.NR_COLE} integradas na Ravex.`);
        },
        error => {
          item.loading = false;
          this.pnotify.error(`Erro ao adiconar as notas fiscais da coleta (${params.CD_EMPR}) ${params.NR_COLE}.`)
        }
      )
  }

  getTipoTransporte() {
    this.loadingTipoTransporte = true;
    this.steellogService
      .getTipoTransporte()
      .pipe(
        finalize(() => {
          this.loadingTipoTransporte = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.tipoTransporte = response.body['data'];
          }
        }
      )
  }

  getEmpresas() {
    this.loadingEmpresas = true;
    this.steellogService
      .getEmpresas()
      .pipe(
        finalize(() => {
          this.loadingEmpresas = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.empresas = response.body['data'];
          }
        }
      )
  }

  viewDetails(viagem) {

    this.items.map((element) => element.selected = false);
    viagem.selected = true;

    this.detailPanelService.show();
    this.detailPanelTitle = `(${viagem["CD_EMPR"]}) ${viagem["NR_COLE"]}`;
    this.showDetailPanel = true;

    this.getEntregas(viagem);

  }

  eHUmaViagemIntegrada(status: string):boolean{

    if(status == 'I')
      return true;

    if(status == 'P')
      return true;

    return false;
  }

  getCorIntegracao(status: string):string{

    if(status == 'I')
      return 'text-success';

    if(status == 'N')
      return 'text-warning';
    
    if(status == 'E')
      return 'text-danger';
      
    return 'text-muted';

  }

  public keepOriginalOrder = (a, b) => a.key

}
