import { MapService } from './../../../../shared/services/core/map.service';
import { Subtitles } from './../../../../shared/modules/subtitles/subtitles';
import { LogisticaDashboardsGestaoCarteiraChartsService } from './charts.service';
import { BsDatepickerConfig, BsLocaleService, BsModalRef, BsModalService, PageChangedEvent } from 'ngx-bootstrap';
import { LogisticaDashboardGestaoCarteiraService } from './gestao-carteira.service';
import { CustomTableConfig } from './../../../../shared/templates/custom-table/models/config';
//angular
import { Component, OnInit, OnDestroy, TemplateRef, AfterViewInit } from '@angular/core';
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
  selector: 'logistica-dashboard-gestao-carteira',
  templateUrl: './gestao-carteira.component.html',
  styleUrls: ['./gestao-carteira.component.scss'],
})
export class LogisticaDashboardsGestaoCarteiraComponent implements OnInit, OnDestroy {
  public MASKS = MASKS;

  breadCrumbTree: Array<Breadcrumb>;
  idSubModulo: number;
  pedidos= [];
  empresas=[];
  noCarteira= true;
  noPedidos=true;
  loading: boolean; //Loading FullPage
  loadingNavBar = false; //Loading do NAVBAR
  loadingEmpresas:boolean
  $activatedRouteSubscription: Subscription;
  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: false,
  };
  form: FormGroup;

  ORDE_BY = 'CD_EMPR';
  ORDE_TYPE = 'desc';

  tipos = [
    {
      cod: 'todos',
      nome: 'Exibir Todos',
    },
    {
      cod: 'emTransito',
      nome: 'Em Transito',
    },
    {
      cod: 'preAgendado',
      nome: 'Pré-Agendado',
    },
    {
      cod: 'emCarteira',
      nome: 'Em Carteira',
    },
  ];
  dataPieChart = {}  
  modoView:number = 1;
  countoRomaneiosEmTran:number;
  countoPedidosEmTran:number;
  countoTonEmTran:number;
  countoOcupacaoEmTran:number;
  countoRomaneiosPreAgen:number;
  countoPedidosPreAgen:number;
  countoTonPreAgen:number;
  countoOcupacaoPreAgen:number;
  countoPedidosEmCart:number;
  countoTonEmCart:number;
  cardEmTranLoading: boolean = true;
  cardPreAgenLoading: boolean = true;
  cardEmCartLoading: boolean = true;

  bsConfig: Partial<BsDatepickerConfig>;
  
  regioes = [];
  atrasado:number = 0;
  countoAtrasado: number;
  venceHoje:number = 0;
  countoVenceHoje: number;
  aVencer:number = 0;
  countoAVencer: number;
  carteira:any;
  statusVencimento = {};

  /* Pagination */
  itemsPerPage = 100;
  totalItems = 10;
  currentPage = 1;
  /* Pagination */

  modalRef: BsModalRef;
  
  constructor(
    private route: Router,
    private pnotify: PNotifyService,
    private localeService: BsLocaleService,
    private activatedRoute: ActivatedRoute,
    private GestaoCarteiraService: LogisticaDashboardGestaoCarteiraService,
    private formBuilder: FormBuilder,
    private routerService: RouterService,
    private dateService: DateService,
    private mapService: MapService,
    private chartsService: LogisticaDashboardsGestaoCarteiraChartsService,
    private modalService: BsModalService
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
    this.getEmpresas();
  }


  ngOnDestroy() {
    this.$activatedRouteSubscription.unsubscribe();

    if(this.modalService){
      this.modalService.hide(1);
    }
  }

  setOrderBy(column: string): void {
    if (this.ORDE_BY === column) {
      if (this.ORDE_TYPE == 'desc') {
        this.ORDE_TYPE = 'asc';
      } else if (this.ORDE_TYPE == 'asc') {
        this.ORDE_TYPE = 'desc';
      }
    } else {
      this.ORDE_BY = column;
      this.ORDE_TYPE = 'asc';
    }
    this.onFilter();
  }

  onActivatedRoute() {
    this.$activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (response) => {
        const _response = this.routerService.getBase64UrlParams(response);
        this.form.patchValue(_response);
        if (_response.hasOwnProperty('TT_REGI_PAGI'))
          this.itemsPerPage = _response.TT_REGI_PAGI;
      }
    );
  }

  changeView(event){
    if(this.modoView == 1){
      this.modoView = 0
    }else 
    this.modoView = 1
  }

  buildForm() {
    this.form = this.formBuilder.group({
      CD_EMPR: [null, [Validators.required]],
      CD_PEDI:[null],
      NOTA_FISC:[null],
      CD_ROMA:[null],
      NM_FANT:[null],
      DS_REGI_ENTR:[null],
      DT_PEDI:[null],
      SG_EVEN: ['todos'],
      PAGI: [1],
      TT_REGI_PAGI: [this.itemsPerPage],
      TIME: [new Date().getTime()],
      ORDE_BY: [this.ORDE_BY],
      ORDE_TYPE: [this.ORDE_TYPE],
    });
  }
  setPageRegistros(itemsPerPage) {
    this.getCarteiras(this.getParams())
    this.getPedidos((this.getParams()))
    this.form.get('ORDE_TYPE').setValue(this.ORDE_TYPE);
    this.form.get('ORDE_BY').setValue(this.ORDE_BY);
    this.form.get('PAGI').setValue(itemsPerPage);
    this.form.get('TIME').setValue(new Date().getTime());
    this.route.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams()),
    });
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
        descricao: 'Gestão de Carteira',
      },
    ];
  }

  changeStatus(status?){
    this.form.get('SG_EVEN').setValue(status)
    this.regioes = this.carteira[status].regioes
    this.mapService.removeLayers()

    if(this.regioes.length == 0)
      return

    this.chartsService.sortedBarChart('sortedBarChart',this.regioes)
    this.mapService.create('mapChart')
    this.regioes.forEach((regiao) => {
      const cor = regiao.cor
      const latitude = parseFloat(regiao.geolocalizacao['latitude'])
      const longitude = parseFloat(regiao.geolocalizacao['longitude'])
      const radius = regiao.raio
      this.mapService.onAddCircleLayer([longitude,latitude], radius, cor)
    });
        this.chartsService.pieChart('pieChart', this.dataPieChart)
  }

  getEmpresas(params?) {
    this.loadingEmpresas=true;
    this.GestaoCarteiraService
      .getEmpresas()
      .pipe(
        finalize(() => {
          this.loadingEmpresas = false;
        })
      )
      .subscribe(
        (response) => {
          if (response) {
            this.empresas = response;
          } else {
            this.pnotify.notice('Nenhum registro encontrado!');
            this.empresas = [];
          }
        },
        (error) => {
          this.pnotify.error();
          this.empresas = [];
        }
      );
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

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {class: 'modal-xxl', animated: false, ignoreBackdropClick: true});
  }


  onFilter(): void {
    this.getCarteiras(this.getParams())
    this.getPedidos((this.getParams()))
    this.form.get('ORDE_TYPE').setValue(this.ORDE_TYPE);
    this.form.get('ORDE_BY').setValue(this.ORDE_BY);
    this.form.get('PAGI').setValue(1);
    this.form.get('TIME').setValue(new Date().getTime());
    this.route.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams()),
    });
  }

  getCarteiras(params?) {
    this.loadingNavBar = true;
    this.cardEmTranLoading = true;
    this.cardPreAgenLoading = true;
    this.cardEmCartLoading = true;
    this.GestaoCarteiraService
      .getCarteiras(params)
      .pipe(
        finalize(() => {
          this.loadingNavBar = false;
          this.cardEmTranLoading = false;
          this.cardPreAgenLoading = false;
          this.cardEmCartLoading = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.noCarteira = false;
            this.carteira = response.body['data'];
            const totalStatusVencimento = response.body['data']['todos']
            this.setValueStatusVencimento(totalStatusVencimento)
            this.changeStatus(this.form.get('SG_EVEN').value);
          } else {
            this.noCarteira = true;
            this.pnotify.notice("Nenhuma informação encontrada.")
          }
        },
        (error) => {
          this.noCarteira = true;
          try {
            this.pnotify.error(error.error.message)
          } catch (error) {
            this.pnotify.error();
          }
        }
      );
  }

  getPedidos(params?) {
    this.loading = true;
    this.GestaoCarteiraService
      .getPedidos(params)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.pedidos = response.body['data'];
            this.totalItems = response.body['total']
            this.noPedidos = false
          } else {
            this.noPedidos =true
            this.pnotify.notice("Nenhuma informação encontrada.")
          }
        },
        (error) => {
          this.pedidos = [];
          this.noPedidos= true
          try {
            this.pnotify.error(error.error.message)
          } catch (error) {
            this.pnotify.error();
          }
        }
      );
  }
  setValueStatusVencimento(totalStatusVencimento){
    const totalAVencer = totalStatusVencimento['statusVencimento']['aVencer']['quantidade'];
    const totalVenceHoje = totalStatusVencimento['statusVencimento']['venceHoje']['quantidade'];
    const totalVencido = totalStatusVencimento['statusVencimento']['vencido']['quantidade'];

    const dataPieChart = [ {
      "country": "ATRASADO",
      "litres": totalVencido
    }, {
      "country": "VENCE HOJE",
      "litres": totalVenceHoje
    }, {
      "country": "A VENCER",
      "litres": totalAVencer
    }
    ];
    this.dataPieChart = dataPieChart;
  }



  onReset() {
    this.form.reset();
    this.form.patchValue({
      PAGI: 1,
      TT_REGI_PAGI: 100,
      TIME: [new Date().getTime()],
    });
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

    return _params;
  }

  onPageChanged(event) {
    this.form.get('PAGI').setValue(event.page);
    this.onFilter();
  }

}
