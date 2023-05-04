import { CorteDobraDashboardService } from './../dashboard.service';
import { CorteDobraChartsService } from './../charts.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize, delay } from 'rxjs/operators';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';


@Component({
  selector: 'corte-dobra-dashboard-faturamento',
  templateUrl: './faturamento.component.html',
  styleUrls: ['./faturamento.component.scss']
})
export class CorteDobraDashboardFaturamentoComponent implements OnInit {
  loading: boolean = false;
  errorLoaded: boolean = false;

  constructor(
    private corteDobraDashboardService: CorteDobraDashboardService,
    private chartService: CorteDobraChartsService,
    private activatedRoute: ActivatedRoute,
    private pnotify: PNotifyService

  ) { }

  ngOnInit() {
    this.activatedRoute
      .queryParams
      .subscribe(data => {
        if(Object.keys(data).length !== 0)
          this.makeValue(data)
      })
  }

  makeValue(data) {
    this.corteDobraDashboardService
      .getPedidosFaturados(data)
      .pipe(
        finalize(() => this.loading = true),
        delay(1000)
      )
      .subscribe(
        (response) => {
          let faturamentos = response.body;
          if(response.status == 204){
            this.pnotify.notice('Não existe pedidos faturados para esse período.');
            this.errorLoaded = true;
          } else {
            this.chartService.doubleColumnChart(faturamentos, "chartdiv-faturamento", "data", "Manetoni", "Arcelor", "Acm", "Manetoni", "Arcelor")
          }
      })
  }

}
