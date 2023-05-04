// angular
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

// ngx
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap';

// rxjs
import { Subscription, forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';

// services
import { environment } from 'src/environments/environment';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { DateService } from 'src/app/shared/services/core/date.service';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { LogisticaDashboardsAnaliseFreteService } from '../services/analise-frete.service';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { XlsxService } from 'src/app/shared/services/core/xlsx.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

@Component({
  selector: 'logistica-dashboards-frete-analitico',
  templateUrl: './v2.component.html',
  styleUrls: ['./v2.component.scss']
})
export class LogisticaDashboardsAnaliseFreteV2Component implements OnInit {

  breadCrumbTree: any = []

  @ViewChild('scroll', { read: ElementRef }) public scroll: ElementRef<any>;
  
  info: string;
  $subscription: Subscription;
  $indicadoresSubscription: Subscription;

  private readonly API = environment.API;
  currentUser = JSON.parse(localStorage.getItem("currentUser"));
  matricula = this.currentUser["info"]["matricula"];
  
  dataLoaded = false;
  permission = false;
  
  form: FormGroup;
  empresas: any = [];
  
  data = [];
  total = {};
  show = false;
  loading = false;
  empty = false;

  columns = {
    'Ano': false,
    'Mes': false,
    'UF': false,
    'Tipo de Veículo': false,
    'Contrato de Frete': false
  }

  segmentacao = [
    {
      'nome': 'Ano',
      'v2': {
        'select':' ,[Ano] ',
        'where': ' S1.[Ano] = T1.[Ano] ',
        'groupBy': ' [Ano] ',
        'orderBy': ' [Ano] '
      }
    },
    {
      'nome': 'Mês',
      'v2': {
        'select':' ,[Mês] ',
        'where': ' S1.[Mês] = T1.[Mês] ',
        'groupBy': ' [Mês] ',
        'orderBy': ' [Mês] '
      }
    },
    {
      'nome': 'UF',
      'v2': {
        'select':' ,[UF] ',
        'where': ' S1.[UF] = T1.[UF] ',
        'groupBy': ' [UF] ',
        'orderBy': ' [UF] '
      }
    },
    {
      'nome': 'Tipo de Veículo',
      'v2': {
        'select':' ,[Tipo de Veículo] ',
        'where': ' S1.[Tipo de Veículo] = T1.[Tipo de Veículo] ',
        'groupBy': ' [Tipo de Veículo] ',
        'orderBy': ' [Tipo de Veículo] '
      }
    },
    {
      'nome': 'Contrato de Frete',
      'v2': {
        'select':' ,[Contrato de Frete] ',
        'where': ' S1.[Contrato de Frete] = T1.[Contrato de Frete] ',
        'groupBy': ' [Contrato de Frete] ',
        'orderBy': ' [Contrato de Frete] '
      }
    }
  ]

  rotulos = {};

  appTitle = 'Análise de Frete II'

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

  bsConfig: Partial<BsDatepickerConfig>;

  orderBy = 'Frete';
  orderType = 'DESC';

  constructor(
    private activatedRoute: ActivatedRoute,
    private atividadesService: AtividadesService,
    private formBuilder: FormBuilder,
    private localeService: BsLocaleService,
    private router: Router,
    private http: HttpClient,
    private pnotify: PNotifyService,
    private dateService: DateService,
    private service: LogisticaDashboardsAnaliseFreteService,
    private routeService: RouterService,
    private xlsxService: XlsxService
  ) {
    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );

    this.form = this.formBuilder.group({
      projeto: [null],
      dataInicial: [dateService.getFirstDayMonth(), Validators.required],
      dataFinal: [new Date(), Validators.required],
      parametrizacao: [[]],
      tipoVeiculo: [null],
      uf: [null],
      contratoFrete: [null],
      select: [null],
      where: [null],
      groupBy: [null],
      orderBy: [null],
      origem: ['TMS'],
      timestamp: [(new Date()).getTime()]
    })
  }

  ngOnInit() {
    this.atividadesService.registrarAcesso().subscribe();
    this.getEmpresas();
    this.onActiveRoute();
    this.getRotulos();
    this.setBreadCrumb();
  }

  onActiveRoute() {

    this.activatedRoute.queryParams
      .subscribe(
      response => {

        let _params = JSON.parse(JSON.stringify(this.routeService.getBase64UrlParams(response)));
    
        if(_params == undefined){
          return
        }

        if(Object.keys(_params).length == 0){
          return
        }
        
        _params.projeto = _params?.projeto?.split(',');
        _params.parametrizacao = _params?.parametrizacao ? JSON.parse(_params?.parametrizacao) : [];

        _params.parametrizacao.forEach(element => {
          this.columns[element] = true;
        });

        this.form.patchValue(_params);
    
        this.getIndicadores(this.getParams());

      }
    )

  }

  setBreadCrumb() {

    const params = this.activatedRoute.snapshot.params;
    const submoduloId = params?.idSubModulo;

    this.breadCrumbTree = [
      {
        descricao: 'Logistica'
      },
      {
        descricao: 'Dashboards',
        routerLink: `/logistica/dashboards/${submoduloId}`
      },
      {
        descricao: this.appTitle
      }
    ];
  }

  getEmpresas() {
    this.http.get(`${this.API}/logistica/associacao-usuario-empresa/${this.matricula}`,
      { params: { "parametro": "4" }, observe: "response" })
      .pipe(
        finalize(() => {
          this.permission = this.empresas.length == 0 ? false : true;
          this.dataLoaded = true;
        })
      )
      .subscribe(
        data => {
          this.empresas = [];

          if (data["status"] == 200) {
            this.empresas = data["body"];
          }
        },
        error => {
          this.permission = this.empresas.length == 0 ? false : true;
          this.dataLoaded = true;
        }
      )
  }

  getParams() {

    let _params = {};
    let _obj = this.form.value;
    for (let prop in _obj) {
      if (!_obj[prop])
        continue
      else if (_obj[prop] instanceof Date)
        _params[prop] = this.dateService.convertToUrlDate(_obj[prop])
      else if(prop == 'parametrizacao')
        _params[prop] = JSON.stringify(_obj[prop])
      else if(Array.isArray(_obj[prop]))
        _params[prop] = _obj[prop].toString()
      else
        _params[prop] = _obj[prop]
      
    }

    return _params

  }

  onFilter() {

    this.form.get('timestamp').setValue((new Date()).getTime());

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routeService.setBase64UrlParams(this.getParams()),
    });

  }

  /* CSS - Campos requeridos */
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

  onFieldInvalid(field: any) {
    field = this.form.get(field);

    return field.status == 'INVALID' && field.touched;
  }


  getIndicadores(params) {
    
    if(this.$indicadoresSubscription){
      this.$indicadoresSubscription.unsubscribe();
    }
    
    this.loading = true;
    this.empty = false;
    this.show = false;

    let parametro = this.form.get("origem").value == "TMS" ? 1 : 2;

    const requests = [];

    requests.push(this.service.getIndicadores({...params, parametro: parametro}))
    
    delete params['select'];
    delete params['where'];
    delete params['orderBy'];
    delete params['groupBy'];

    requests.push(this.service.getIndicadores({...params, parametro: parametro}))

    this.$indicadoresSubscription = forkJoin(requests)
      .pipe(
        finalize(() => {
          this.loading = false;
          })
        )
        .subscribe(
          response => {    
          
            if(response[0]['status'] != 200){
              this.empty = true
              return
            } 

            this.data = response[0]['body']["data"];
            this.show = true;

            if(response[1]['status'] == 200){
              this.total = response[1]['body']["data"][0];
            }

      },
      error => {
        this.pnotify.error()
      })
  }

  getRotulos(){

    this.service
      .getRotulos()
      .subscribe(
        response => {
          
          if(response.status != 200){
            return
          }

          this.rotulos = response.body['data'];

        }
      )
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

    this.orderData(this.orderBy, this.orderType)

  }

  orderData(key, type){

    this.data.sort((a, b) => {
      
      if(a[key] === b[key]){
        return 0;
      }

      if(type == 'ASC'){
        return a[key] > b[key] ? -1 : 1; 
      }

      return a[key] > b[key] ? 1 : -1;

    })
  }

  prepareData(e: Array<any>){
    
    let select = '';
    let where = '';
    let groupBy = '';
    let orderBy = '';

    Object.keys(this.columns).map(key => this.columns[key] = false)

    e.forEach((value, index) => {

      if(where){
        where += ' AND '
      }

      select += value?.v2?.select;
      where += value?.v2?.where;
      groupBy += value?.v2?.groupBy;
      orderBy += value?.v2?.orderBy;

      if(index != (e.length - 1)){
        
        select +=  '\n';
        where +=  '\n';
        groupBy +=  ',\n';
        orderBy +=  ',\n';
      
      }

      this.columns[value.nome] = true;

    })
    
    where = ' WHERE ' + where;
    groupBy = ' GROUP BY ' + groupBy;
    orderBy = ' ORDER BY ' + orderBy;

    this.form.get('select').setValue(select);
    this.form.get('where').setValue(where);
    this.form.get('groupBy').setValue(groupBy);
    this.form.get('orderBy').setValue(orderBy);
    
    this.getIndicadores(this.getParams());

  }

  onExport(){
    this.xlsxService.export({data: this.data})
  }

}
