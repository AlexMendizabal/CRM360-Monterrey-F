import { CorteDobraDashboardService } from './../dashboard.service';
import { CorteDobraChartsService } from './../charts.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize, delay } from 'rxjs/operators';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

@Component({
  selector: 'corte-dobra-dashboard-planilhado',
  templateUrl: './planilhado.component.html',
  styleUrls: ['./planilhado.component.scss']
})
export class CorteDobraDashboardPlanilhadoComponent implements OnInit {
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
      .getPedidosPlanilhados(data)
      .pipe(
        finalize(() => this.loading = true),
        delay(1000)
      )
      .subscribe(
        (response) => {
          let planilhados = response.body;
          if(response.status == 204){
            this.pnotify.notice('Não existe planilhados para esse período.');
            this.errorLoaded = true;
          } else {
            this.chartService.simpleColumnChart(planilhados, "chartdiv-planilhado", "data", "peso", "Planilhados")
          }
      })
  }

}
