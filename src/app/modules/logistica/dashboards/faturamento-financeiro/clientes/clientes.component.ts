import { RouterService } from 'src/app/shared/services/core/router.service';
import { DateService } from './../../../../../shared/services/core/date.service';
import { PNotifyService } from './../../../../../shared/services/core/pnotify.service';
import { LogisticaDashboardFaturamentoFinanceiroService } from './../faturamento-financeiro.service';
import { finalize } from 'rxjs/operators';
import { LogisticaDashboardsFaturamentoFinanceiroChartsService } from './../charts.service';
import { BsModalRef } from 'ngx-bootstrap';
//angular
import { Component, OnInit, OnDestroy , Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// rxjs
import { Subscription } from 'rxjs';

@Component({
  selector: 'logistica-dashboard-faturamento-financeiro-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss'],
})
export class LogisticaDashboardsFaturamentoFinanceiroClientesComponent implements OnInit, OnDestroy 
{
  @Input() set formFilter(formFilter: number){
    if(!formFilter)
      return
    this.dataFormFilter = formFilter;
  };


  idSubModulo: number;
  $activatedRouteSubscription: Subscription;
  dataFormFilter:any;
  loadingFatuMensClie:boolean;
  loadingFatuAtualCliente:boolean;
  loadingFatuProjClie:boolean;
  modalRef: BsModalRef;
  dataSortedBar = {}
  dataFatuMensClie = {}
  dataFatuAtualClie = {}
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
      response => {
        const _params = this.routerService.getBase64UrlParams(response)
        const modoView = _params?.NM_CLIE;
        this.chartsService.disposeCharts();
        if((['todos', 'novos negócios'].includes(modoView))){
          return
        }
        this.getFaturamentoProjetos();
        this.getFaturamentoMensalCliente();
        this.getFaturamentoMesAtualCliente();
      }
    );
  }

  getFaturamentoProjetos(params?) {
    this.loadingFatuProjClie = true;
    this.FaturamentoFinanceiroService
      .getProjetos(this.dataFormFilter)
      .pipe(
        finalize(() => {
          this.loadingFatuProjClie = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.dataSortedBar = response.body['data'];
            this.chartsService.sortedBarChart('clientesProjetosSortedBarChart', this.dataSortedBar)
          } else {
            this.pnotify.notice("Nenhum projeto encontrado.")
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

  getFaturamentoMensalCliente() {
    this.loadingFatuMensClie = true
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const dataFinalAno = this.dateService.convertToUrlDate(this.dateService.getLastDayMonth())
    const dataInicialAno = `01-${(month + 1)}-${(year - 1)}`
    const dsClient = this.dataFormFilter.NM_CLIE;
    this.FaturamentoFinanceiroService
      .getFaturamentoMensal({DT_INIC: dataInicialAno, DT_FINA:dataFinalAno,NM_CLIE:dsClient })
      .pipe(
        finalize(() => {
          this.loadingFatuMensClie = false;
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
            this.dataFatuMensClie = Object.values(chartData);
           this.chartsService.clusteredChart('clusteredChartFatuMensalCliente', this.dataFatuMensClie)
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
  
  getFaturamentoMesAtualCliente() {
    this.loadingFatuAtualCliente = true
    const dataInicial = this.dateService.convertToUrlDate(this.dateService.getFirstDayMonth())
    const dataFinal = this.dateService.convertToUrlDate(this.dateService.getLastDayMonth())
    const dsCliente = this.dataFormFilter.NM_CLIE;
    this.FaturamentoFinanceiroService
      .getFaturamentoMensal({DT_INIC: dataInicial, DT_FINA:dataFinal, NM_CLIE:dsCliente})
      .pipe(
        finalize(() => {
          this.loadingFatuAtualCliente = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            let data: Array<any> = response.body['data'];
            let chartClientData = {}
            data.forEach(el => {
              if(!chartClientData[el?.SG_PERI])
                chartClientData[el?.SG_PERI] = {SG_PERI: el?.SG_PERI}

              if(!chartClientData[el?.SG_PERI][el?.DS_CENA])
              chartClientData[el?.SG_PERI][el?.DS_CENA] = 0

              chartClientData[el?.SG_PERI][el?.DS_CENA] = el?.VL_FATU;
            })
            this.dataFatuAtualClie = Object.values(chartClientData);
            this.chartsService.clusteredChart('clusteredChartMesAtual', this.dataFatuAtualClie)
            this.loadingFatuAtualCliente = false;
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
}