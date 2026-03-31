//angular
import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

//servicos
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { LogisticaDashboardConferenciaCteService } from './conferencia-cte.service';
import { XlsxService } from './../../../../shared/services/core/xlsx.service';

import { BsDatepickerConfig, BsLocaleService, BsModalRef, BsModalService, PageChangedEvent } from 'ngx-bootstrap';

// rxjs
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';

//modelos
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { DateService } from 'src/app/shared/services/core/date.service';
import { CustomTableConfig } from './../../../../shared/templates/custom-table/models/config';

//masks
import { MASKS } from 'ng-brazil';


@Component({
  selector: 'logistica-dashboard-conferencia-cte',
  templateUrl: './conferencia-cte.component.html',
  styleUrls: ['./conferencia-cte.component.scss'],
})
export class LogisticaDashboardsConferenciaCteComponent implements OnInit, OnDestroy {
  public MASKS = MASKS;

  breadCrumbTree: Array<Breadcrumb>;
  idSubModulo: number;
  conferencia: any;
  dados = {};
  total = {};
  noResult: boolean;
  loading = true; //Loading FullPage
  loadingNavBar = false; //Loading do NAVBAR
  $activatedRouteSubscription: Subscription;
  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: false,
    isFixed: true,
    border: false,
    small: false,
    hover: false,
    theme: {
      color: 'white',
    },
  };
  modoViewIncorretas = 0;
  modoViewNaoEmitidas= 0;
  form: FormGroup;

  relatorio = [];
  relatorioCache = {};
  colunas = {};
  inColunas = false;

  bsConfig: Partial<BsDatepickerConfig>;
  
  // Tipos de Operações (Ativo/Inativo)
  tipos = [
    {
      cod: '1',
      nome: 'Abastecimento',
    },
    {
      cod: '2',
      nome: 'Escoamento',
    },
  ];

  /* Paginação */
  itemsPerPage: number = 100;
  currentPage: number = 1;
  begin: number = 0;
  end: number = this.itemsPerPage;
  totalItems: number = 0;
  /* Paginação */

  modalRef: BsModalRef;
  
  constructor(
    private route: Router,
    private pnotify: PNotifyService,
    private localeService: BsLocaleService,
    private activatedRoute: ActivatedRoute,
    private conferenciaCteService: LogisticaDashboardConferenciaCteService,
    private formBuilder: FormBuilder,
    private routerService: RouterService,
    private dateService: DateService,
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
  }

  ngOnInit() {
    this.buildForm();
    this.setBreadCrumb();
    this.onActivatedRoute();
  }

  ngOnDestroy() {
    this.$activatedRouteSubscription.unsubscribe();

    if(this.modalService){
      this.modalService.hide(1);
    }
  }

  onActivatedRoute() {
    this.$activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (response) => {
        const _response = this.routerService.getBase64UrlParams(response);
        this.form.patchValue(_response);
        this.getConferencia(this.getParams());
      }
    );
  }

  buildForm() {

    const cnpjs = "1170112600290,30456615000198,30456615000279,479795800001298,49795800001530,49795800001883"

    this.form = this.formBuilder.group({
      DS_STAT: [null],
      DS_USUA: [null],
      DT_INIC: [this.dateService.getFirstDayMonth(), [Validators.required]],
      DT_FINA: [new Date(), [Validators.required]],
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
        descricao: 'Dashboard',
        routerLink: `/logistica/dashboards/${id}`,
      },
      {
        descricao: 'Conferência de CTEs',
      },
    ];
  }

  /* changeViewIncorretas(event?){
    if(this.modoViewIncorretas == 1){
      this.modoViewIncorretas = 0
    }else{
      this.modoViewIncorretas = 1
    }
  } */

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {class: 'modal-xxl', animated: false, ignoreBackdropClick: true});
  }

  /* changeViewNaoEmitidas(event?){
    if(this.modoViewNaoEmitidas == 1){
      this.modoViewNaoEmitidas = 0
    }else{
      this.modoViewNaoEmitidas = 1
    }
  } */

  onFilter() {
    this.form.get('TIME').setValue(new Date().getTime());
    this.route.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams()),
    });
  }

  getConferencia(params?) {
    if (!this.loading) this.loadingNavBar = true;

    this.conferenciaCteService
      .getConferencia(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            
            this.dados = response.body['data'];
            this.noResult = false;

            for (const key in this.dados) {
              
              this.total[key] = {'valor': 0, 'quantidade': 0};
              
              if(!this.dados[key]){
                continue;
              }

              this.dados[key].foreach(el => {
                this.total[key].valor += el?.valor;
                this.total[key].quantidade += el?.quantidade;
              });

            }

          } else {
            this.noResult = true;
            this.pnotify.notice("Nenhuma informação encontrada.")
          }
        },
        (error) => {
          this.conferencia = undefined;
          this.noResult = true;
          try {
            this.pnotify.error(error.error.message)
          } catch (error) {
            this.pnotify.error();
          }
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

  /* onPageChanged(event) {
    this.form.get('PAGI').setValue(event.page);
    this.onFilter();
  } */

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

  hasData(key){

    if(!this.dados)
      return false;

    if(!this.dados.hasOwnProperty(key))
      return false;

    if(this.dados[key].length == 0)
      return false

    return true;
  }

  getRelatorio(template: TemplateRef<any>, status){

    this.inColunas = false;
    this.form.get('DS_STAT').setValue(status)
    const params = {...this.getParams(), 'DS_STAT': status}

    const cache = this.getRelatorioCache(status, params);

    if(cache){
      this.relatorio = cache.values;
      this.colunas = cache.columns;
      this.openModal(template)
      return
    }


    if (!this.loading)
      this.loadingNavBar = true;

    this.conferenciaCteService
      .getRelatorio(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        async (response) => {
          if (response.status === 200) {
            
            this.relatorio = response.body['data'];
            this.totalItems = this.relatorio.length;
            
            const config = this.getColumnsConfig(status)
            const keys = Object.keys(this.relatorio[0]);
            const promise = () => keys.forEach(key => this.colunas[key] = config?.hasOwnProperty(key) ? config[key] : false); 

            await Promise.resolve(promise());

            this.setRelatorioCache(status, params, this.relatorio, this.colunas);
          
            this.noResult = false;

            this.openModal(template)
          
          } else {
            this.noResult = true;
            this.relatorio = [];
            this.pnotify.notice("Nenhuma informação encontrada.")
          }
        },
        (error) => {
          this.relatorio = [];
          this.noResult = true;
          try {
            this.pnotify.error(error.error.message)
          } catch (error) {
            this.pnotify.error();
          }
        }
      );
  }

  setRelatorioCache(status, params, values, colunms){
    this.relatorioCache[status] = {
      'params': params,
      'values': values,
      'columns': colunms
    }
  }

  getRelatorioCache(status, params){
    
    try {
      
      const _params = this.relatorioCache[status]['params'];

      if(params?.DT_INIC == _params?.DT_INIC && params?.DT_FINA == _params?.DT_FINA && params?.DS_USUA == _params?.DS_USUA)
        return this.relatorioCache[status];
      
    } catch (error) {
      return false
    }
    return false
  }

  hideListColumns(): boolean{
    this.inColunas = !this.inColunas;
    return this.inColunas;
  }

  setColumnState(column){
    this.colunas[column.key] = column.value ? false : true;
    const status = this.form.get('DS_STAT').value;
    const key = `${this.getLocalStorageKey()}.${status}`
    localStorage.setItem(key, JSON.stringify(this.colunas))
  }

  keepOriginalOrder = (a, b) => a.key

  export(){
    this.xlsxService.export({data: this.relatorio})
  }

  /* Paginação */
  onPageChanged(event: PageChangedEvent): void {
    this.begin = (event.page - 1) * event.itemsPerPage;
    this.end = event.page * event.itemsPerPage;
  }
  /* Paginação */

  getColumnsConfig(status?){
    const config = {
      "EMISSOES_INCORRETAS":{
        "TIPO": true,
        "CNPJ_EMITENTE": true,
        "CNPJ_EMITENTE_CTRC": true,
        "FRETE_PESO_ARCELOR": true,
        "FRETE_PESO": true,
        "CNPJ_PAGADOR": true,
        "CNPJ_PAGADOR_CTRC": true
      },
      "NAO_EMITIDO":{
        "TIPO": true,
        "CNPJ_EMITENTE": true,
        "CNPJ_PAGADOR": true,
        "CUSTO_FRETE_NF": true,
        "TRANSPORTE": true,
        "NOTA_FISCAL": true
      },
      "DEMAIS_EMISSOES":{
        "TIPO": true,
        "CNPJ_EMITENTE_CTRC": true,
        "CNPJ_PAGADOR_CTRC": true,
        "FRETE_PESO": true,
        "TRANSPORTE": true,
        "NOTA_FISCAL": true
      }
    }

    const key = `${this.getLocalStorageKey()}.${status}`
    const storage = localStorage.getItem(key)

    if(storage)
      return JSON.parse(storage)

    if(status)
      return config[status]

    return config;
  }

  getLocalStorageKey(){
    const key = `logistica.dashboards.conferenciaCte.colunas`
    return key;
  }

}
