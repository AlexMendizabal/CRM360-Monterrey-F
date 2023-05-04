import { LogisticaDashboardsFaturamentoFinanceiroChartsService } from './charts.service';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap';
import { LogisticaDashboardFaturamentoFinanceiroService } from './faturamento-financeiro.service';
import { CustomTableConfig } from './../../../../shared/templates/custom-table/models/config';
//angular
import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

//servicos
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { RouterService } from 'src/app/shared/services/core/router.service';

// rxjs
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';

//modelos
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { DateService } from 'src/app/shared/services/core/date.service';
//masks
import { MASKS } from 'ng-brazil';

@Component({
  selector: 'logistica-dashboard-faturamento-financeiro',
  templateUrl: './faturamento-financeiro.component.html',
  styleUrls: ['./faturamento-financeiro.component.scss'],
})
export class LogisticaDashboardsFaturamentoFinanceiroComponent implements OnInit, OnDestroy {
  public MASKS = MASKS;
  breadCrumbTree: Array<Breadcrumb>;
  idSubModulo: number;
  formFilter:any;
  pedidos= [];
  empresas=[];
  info: string;
  loading: boolean; //Loading FullPage
  loadingNavBar = false; //Loading do NAVBAR
  loadingEmpresas:boolean
  $activatedRouteSubscription: Subscription;
  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: false,
  };
  form: FormGroup;

  loadingProjetos: boolean;
  bsConfig: Partial<BsDatepickerConfig>;
  
  faturamento:any;
  projetos= [];

  tipos = [
    {
      cod: 'todos',
      nome: 'Exibir Todos',
    },
    {
      cod: 'aperam',
      nome: 'Aperam',
    },
    {
      cod: 'arcelor mittal',
      nome: 'ArcelorMittal',
    },
    {
      cod: 'manetoni',
      nome: 'Manetoni',
    },
    {
      cod: 'novos negócios',
      nome: 'Novos Negócios',
    },
    {
      cod: 'vallourec',
      nome: 'Vallourec',
    },
  ];

  modoView: string;



  
  constructor(
    private route: Router,
    private pnotify: PNotifyService,
    private localeService: BsLocaleService,
    private activatedRoute: ActivatedRoute,
    private FaturamentoFinanceiroService: LogisticaDashboardFaturamentoFinanceiroService,
    private chartService:LogisticaDashboardsFaturamentoFinanceiroChartsService,
    private formBuilder: FormBuilder,
    private routerService: RouterService,
    private dateService: DateService,
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
    this.chartService.disposeCharts();
  }


  onActivatedRoute() {
    this.$activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (response) => {
        const _response = this.routerService.getBase64UrlParams(response);
        this.form.patchValue(_response);
      }
    );
  }


  buildForm() {
    this.form = this.formBuilder.group({
      DT_FINA:[new Date(this.dateService.getLastDayMonth()),[Validators.required]],
      DT_INIC:[new Date(this.dateService.getFirstDayMonth()),[Validators.required]],
      NM_CLIE:['todos'],
      DS_PROJ:[null],
      TIME: [new Date().getTime()],
    });
  }


  changeCliente(cliente?){
    this.form.get('NM_CLIE').setValue(cliente);
    this.form.get('DS_PROJ').setValue(null);
    this.form.get('DS_PROJ').disable();
    if(cliente != 'todos'){
      this.getProjetos()
      this.form.get('DS_PROJ').enable();
    }
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
        descricao: 'Faturamento Financeiro',
      },
    ];
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


  onFilter() {
    this.form.get('TIME').setValue(new Date().getTime());
    const client = this.form.get('NM_CLIE').value
    
    this.modoView = client;
    this.getUltimaAtualizacao()
    this.route.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams()),
    });
  }


  getUltimaAtualizacao() {
    const data = this.dateService.convertToBrazilianDate(new Date);
    this.info = `Última atualização: ${data}`;
  }

  getProjetos() {
    this.loadingProjetos = true;
    this.FaturamentoFinanceiroService
      .getProjetos(this.getParams())
      .pipe(
        finalize(() => {
          this.loadingProjetos = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.projetos = response.body['data'];
          } else {
            this.pnotify.notice("Nenhuma projeto encontrado.")
          }
        },
        (error) => {
          try {
            this.pnotify.error(error.error.message)
          } catch (error) {
            this.pnotify.error();
          }
        }
      );
  }



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

    return this.formFilter = _params;
  }

}
