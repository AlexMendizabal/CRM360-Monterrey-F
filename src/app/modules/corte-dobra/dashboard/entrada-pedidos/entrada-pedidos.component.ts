import { CorteDobraChartsService } from './../charts.service';
import { CorteDobraDashboardService } from './../dashboard.service';
import { Component, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize, delay } from 'rxjs/operators';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

@Component({
  selector: 'corte-dobra-dashboard-entrada-pedidos',
  templateUrl: './entrada-pedidos.component.html',
  styleUrls: ['./entrada-pedidos.component.scss']
})
export class CorteDobraDashboardEntradaPedidosComponent implements OnInit {
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
      .subscribe(
        data => {
          if(Object.keys(data).length !== 0)
            this.makeValue(data)
        }
        )
  }

  makeValue(data) {
    this.corteDobraDashboardService
      .getPedidosAbertos(data)
      .pipe(
        finalize(() => this.loading = true),
        delay(1000)
      )
      .subscribe(
        (response) => {
          let entradaPedidos = response.body;
          if(response.status == 204){
            this.pnotify.notice('Não existe entrada pedidos para esse período.');
            this.errorLoaded = true;
          } else {
            this.chartService.doubleColumnChart(entradaPedidos, "chartdiv-pedidos-aberto", "data", "Manetoni", "Belgo", "Acm", "Manetoni", "Arcelor")
          }
      })
  }
}
