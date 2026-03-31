import { RouterService } from 'src/app/shared/services/core/router.service';
import { event } from './../../../../admin/perfis/models/event';
import { DateService } from './../../../../../shared/services/core/date.service';
import { PNotifyService } from './../../../../../shared/services/core/pnotify.service';
import { finalize } from 'rxjs/operators';
import { LogisticaDashboardFaturamentoFinanceiroService } from './../faturamento-financeiro.service';
import { LogisticaDashboardsFaturamentoFinanceiroChartsService } from './../charts.service';
import { BsModalRef } from 'ngx-bootstrap';
//angular
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// rxjs
import { Subscription } from 'rxjs';

@Component({
  selector: 'logistica-dashboard-faturamento-financeiro-todos',
  templateUrl: './todos.component.html',
  styleUrls: ['./todos.component.scss'],
})
export class LogisticaDashboardsFaturamentoFinanceiroTodosComponent implements OnInit, OnDestroy {

  @Input() set formFilter(formFilter: number){
    if(!formFilter)
      return

    this.dataFormFilter = formFilter;

    if(this.dataFormFilter.NM_CLIE == 'todos'){
      this.viewCte = 0;
    }
  };

  idSubModulo: number;
  info:string;
  dataFormFilter:any;
  viewCte:number = 0;
  $activatedRouteSubscription: Subscription;
  noFaturamentoClientes= true;
  loadingPieChart:boolean;
  loadingClusteredChartAtual:boolean;
  loadingClusteredChartMensal:boolean;
  loadingClusteredChartCteComp:boolean;
  modalRef: BsModalRef;
  dadosPieChart:any;
  dadosClienteChart: any;
  dadosMesAtualChart:any;
  dadosChartComplementares:any;

  // CARDS
  manetoni:number = 0;
  manetoniPerc:number;
  arcelor:number = 0;
  arcelorPerc:number;
  novos:number = 0;
  novosPerc:number;
  vallourec:number = 0;
  vallourecPerc:number;
  aperam:number = 0;
  aperamPerc:number;
  countoManetoni:boolean;
  countoArcelor:boolean;
  countoNovos:boolean;
  countoVallourec:boolean;
  countoAperam:boolean;
  countoManetoniPerc:boolean;
  countoArcelorPerc:boolean;
  countoNovosPerc:boolean;
  countoVallourecPerc:boolean;
  countoAperamPerc:boolean;


  constructor(
    private activatedRoute: ActivatedRoute,
    private chartsService: LogisticaDashboardsFaturamentoFinanceiroChartsService,
    private FaturamentoFinanceiroService: LogisticaDashboardFaturamentoFinanceiroService,
    private pnotify: PNotifyService,
    private routerService: RouterService,
    private dateService: DateService
  ) {}

  ngOnInit() {
    this.onActivatedRoute();
  }


  ngOnDestroy() {
    this.$activatedRouteSubscription.unsubscribe();
  }


  onActivatedRoute() {
    this.$activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
        (response) => {
        const _params = this.routerService.getBase64UrlParams(response)
        const modoView = _params?.NM_CLIE;
        this.chartsService.disposeCharts();
        if(modoView != 'todos'){
          return
        }
        this.getFaturamentoMensal();
        this.getFaturamentoClientes();
        this.getFaturamentoMesAtual();
        this.getUltimaAtualizacao();
      }
    );
  }

  

  getFaturamentoClientes() {
    this.loadingPieChart = true;
    const params = this.dataFormFilter ;
    delete params['NM_CLIE'];
    this.FaturamentoFinanceiroService
      .getFaturamentoClientes(params)
      .pipe(
        finalize(() => {
          this.loadingPieChart = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.dadosPieChart = response.body['data'];
            if( this.dadosPieChart){
              this.dadosPieChart.forEach(el => {
                if(el?.NM_CLIE =='Manetoni'){
                  this.manetoni = (el?.VL_CTRC)
                  this.manetoniPerc = (el?.VL_PERC * 100)
                }
                if(el?.NM_CLIE =='Arcelor Mittal'){
                  this.arcelor = (el?.VL_CTRC)
                  this.arcelorPerc = (el?.VL_PERC * 100)
                }
                if(el?.NM_CLIE =='Vallourec'){
                  this.vallourec = (el?.VL_CTRC)
                  this.vallourecPerc = (el?.VL_PERC * 100)
                }
                if(el?.NM_CLIE =='Aperam'){
                  this.aperam = (el?.VL_CTRC)
                  this.aperamPerc = (el?.VL_PERC * 100)
                }
                if(el?.NM_CLIE =='Novos Negócios'){
                  this.novos = (el?.VL_CTRC)
                  this.novosPerc = (el?.VL_PERC * 100)
                }

              })
              this.chartsService.pieChart('pieChart', this.dadosPieChart)
            }
          } else {
            this.pnotify.notice("Nenhuma informação encontrada.")
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

  getUltimaAtualizacao() {
    const data = this.dateService.convertToBrazilianDate(new Date);
    this.info = `Última atualização: ${data}`;
  }

  getFaturamentoMensal() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const dataFinalAno = this.dateService.convertToUrlDate(this.dateService.getLastDayMonth())
    const dataInicialAno = `01-${(month + 1)}-${(year - 1)}`
    const _params = {DT_INIC: dataInicialAno, DT_FINA:dataFinalAno}
    this.loadingClusteredChartMensal = true;
    this.FaturamentoFinanceiroService
      .getFaturamentoMensal(_params)
      .pipe(
        finalize(() => {
          this.loadingClusteredChartMensal = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            const data: Array<any> = response.body['data'];
            let chartData = {}
            data.forEach(el => {
              if(!chartData[el?.SG_PERI])
                chartData[el?.SG_PERI] = {SG_PERI: el?.SG_PERI}

              if(!chartData[el?.SG_PERI][el?.DS_CENA])
              chartData[el?.SG_PERI][el?.DS_CENA] = 0

              chartData[el?.SG_PERI][el?.DS_CENA] = el?.VL_FATU;
            })
            this.dadosClienteChart = Object.values(chartData);
            this.chartsService.clusteredChart('clusteredChartFatuMensal', this.dadosClienteChart)
          } else {
            this.pnotify.notice("Nenhuma informação encontrada.")
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

  getFaturamentoCteComplementar() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const lastDayMonth = new Date((today.getFullYear(), today.getMonth() + 1, 0)).getDate()
    const dataInicialAno = `01-${(month + 1)}-${(year - 1)}`
    const dataFinalAno = `${lastDayMonth}-${(month + 1)}-${year}`
    const _params = {DT_INIC: dataInicialAno, DT_FINA:dataFinalAno,IN_COMP: 1}
    this.loadingClusteredChartCteComp = true;
    this.FaturamentoFinanceiroService
      .getFaturamentoCteComplementar(_params)
      .pipe(
        finalize(() => {
          this.loadingClusteredChartCteComp = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            const data: Array<any> = response.body['data'];
            let chartData = {}
            data.forEach(el => {
              if(!chartData[el?.SG_PERI])
                chartData[el?.SG_PERI] = {SG_PERI: el?.SG_PERI}

              if(!chartData[el?.SG_PERI][el?.NM_CLIE])
              chartData[el?.SG_PERI][el?.NM_CLIE] = 0

              chartData[el?.SG_PERI][el?.NM_CLIE]= el?.VL_CTRC;
            })
            this.dadosChartComplementares = Object.values(chartData);
            this.chartsService.clusteredChart('clusteredChartCteComplementar', this.dadosChartComplementares)
          } else {
            this.pnotify.notice("Nenhuma informação encontrada.")
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

  getFaturamentoMesAtual() {
    this.loadingClusteredChartAtual = true
    const dataInicial = this.dateService.convertToUrlDate(this.dateService.getFirstDayMonth())
    const dataFinal = this.dateService.convertToUrlDate(this.dateService.getLastDayMonth())
    this.FaturamentoFinanceiroService
      .getFaturamentoMensal({DT_INIC: dataInicial, DT_FINA:dataFinal})
      .pipe(
        finalize(() => {
          this.loadingClusteredChartAtual = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.loadingClusteredChartAtual = false;
            const data: Array<any> = response.body['data'];
            let chartData = {}
            data.forEach(el => {
              if(!chartData[el?.SG_PERI])
                chartData[el?.SG_PERI] = {SG_PERI: el?.SG_PERI}

              if(!chartData[el?.SG_PERI][el?.DS_CENA])
              chartData[el?.SG_PERI][el?.DS_CENA] = 0

              chartData[el?.SG_PERI][el?.DS_CENA]= el?.VL_FATU;
            })
            this.dadosMesAtualChart = Object.values(chartData);
            this.chartsService.clusteredChart('clusteredChartMesAtual', this.dadosMesAtualChart)

          } else {
            this.pnotify.notice("Nenhuma informação encontrada.")
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

  changeViewCte(event?){
    this.chartsService.disposeCharts()
    if(this.viewCte == 0){
      this.viewCte = 1
      this.getFaturamentoCteComplementar();
    }else {
      this.viewCte = 0
      this.getFaturamentoMensal();
      this.getFaturamentoClientes();
      this.getFaturamentoMesAtual();
    }
  }

}