import { RouterService } from 'src/app/shared/services/core/router.service';
import { DateService } from './../../../../../shared/services/core/date.service';
import { PNotifyService } from './../../../../../shared/services/core/pnotify.service';
import { LogisticaDashboardFaturamentoFinanceiroService } from './../faturamento-financeiro.service';
import { LogisticaDashboardsFaturamentoFinanceiroChartsService } from './../charts.service';
import { BsModalRef } from 'ngx-bootstrap';
//angular
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// rxjs
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'logistica-dashboard-faturamento-financeiro-novos',
  templateUrl: './novos.component.html',
  styleUrls: ['./novos.component.scss'],
})
export class LogisticaDashboardsFaturamentoFinanceiroNovosComponent implements OnInit, OnDestroy {

  @Input() set formFilter(formFilter: number){
    if(!formFilter)
      return
    this.dataFormFilter = formFilter;
  };

  idSubModulo: number;
  $activatedRouteSubscription: Subscription;

  loadingFatuMensNovo:boolean;
  loadingFatuAtualNovo:boolean;
  loadingFatuProjNovo:boolean;
  dataSortedBar = {}
  dataFatuMensNovo = {}
  dataFatuAtualNovo = {}
  dataFormFilter:any
  modalRef: BsModalRef;
  data = {}  
  constructor(
    private activatedRoute: ActivatedRoute,
    private FaturamentoFinanceiroService: LogisticaDashboardFaturamentoFinanceiroService,
    private chartsService: LogisticaDashboardsFaturamentoFinanceiroChartsService,
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
        if(modoView != 'novos negócios'){
          return
        }
        this.getFaturamentoProjetos();
        this.getFaturamentoMensalNovos();
        this.getFaturamentoMesAtualNovos();
      }
    );
  }

  

  getFaturamentoProjetos() {
    const _params = this.dataFormFilter
    _params.NM_CLIE = 'Novos Negócios'
    this.loadingFatuProjNovo = true;
    this.FaturamentoFinanceiroService
      .getProjetos(_params)
      .pipe(
        finalize(() => {
          this.loadingFatuProjNovo = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.dataSortedBar = response.body['data'];
            this.chartsService.sortedBarChart('novosNegociosSortedBarChart', this.dataSortedBar)
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

  getFaturamentoMensalNovos() {
    this.loadingFatuMensNovo = true
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const dataFinalAno = this.dateService.convertToUrlDate(this.dateService.getLastDayMonth())
    const dataInicialAno = `01-${(month + 1)}-${(year - 1)}`
    this.FaturamentoFinanceiroService
      .getFaturamentoMensal({DT_INIC: dataInicialAno, DT_FINA:dataFinalAno,NM_CLIE:'novos negócios' })
      .pipe(
        finalize(() => {
          this.loadingFatuMensNovo = false;
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
            this.dataFatuMensNovo = Object.values(chartData);
           this.chartsService.clusteredChart('clusteredChartFatuMensalCliente', this.dataFatuMensNovo)
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
  
  getFaturamentoMesAtualNovos() {
    this.loadingFatuAtualNovo = true
    const dataInicial = this.dateService.convertToUrlDate(this.dateService.getFirstDayMonth())
    const dataFinal = this.dateService.convertToUrlDate(this.dateService.getLastDayMonth())
    this.FaturamentoFinanceiroService
      .getFaturamentoMensal({DT_INIC: dataInicial, DT_FINA:dataFinal,NM_CLIE:'novos negócios'})
      .pipe(
        finalize(() => {
          this.loadingFatuAtualNovo = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            const data: Array<any> = response.body['data'];
            let chartNovoData = {}
            data.forEach(el => {
              if(!chartNovoData[el?.SG_PERI])
                chartNovoData[el?.SG_PERI] = {SG_PERI: el?.SG_PERI}

              if(!chartNovoData[el?.SG_PERI][el?.DS_CENA])
              chartNovoData[el?.SG_PERI][el?.DS_CENA] = 0

              chartNovoData[el?.SG_PERI][el?.DS_CENA] = el?.VL_FATU;
            })
            this.dataFatuAtualNovo = Object.values(chartNovoData);
            this.chartsService.clusteredChart('clusteredChartMesAtual', this.dataFatuAtualNovo)

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