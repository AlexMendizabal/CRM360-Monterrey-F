import { ActivatedRoute } from '@angular/router';
import { CorteDobraDashboardService } from './../dashboard.service';
import { Component, OnInit } from '@angular/core';
import { CorteDobraChartsService } from '../charts.service';
import { dataLoader } from '@amcharts/amcharts4/core';
import { finalize, delay } from 'rxjs/operators';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

@Component({
  selector: 'corte-dobra-dashboard-registro-ocorrencia',
  templateUrl: './registro-ocorrencia.component.html',
  styleUrls: ['./registro-ocorrencia.component.scss']
})
export class CorteDobraDashboardRegistroOcorrenciaComponent implements OnInit {

  loading: boolean = false;
  errorLoaded: boolean = false;
  oco

  constructor(
    private chartService: CorteDobraChartsService,
    private corteDobraDashboardService: CorteDobraDashboardService,
    private activatedRoute: ActivatedRoute,
    private pnotify: PNotifyService
    ) { }
  
  chart: any;

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
      .getOcorrencias(data)
      .pipe(
        finalize(() => this.loading = true),
        delay(1000)
      )
      .subscribe(
        (response) => {
          let ocorrencias = response.body['data']
          if(response.status == 204){
            this.pnotify.notice('Não existe ocorrências lançadas para esse período.');
            this.errorLoaded = true;
          } else {
            this.chartService.clusteredBarChart(ocorrencias, "ocorrenciasCorteDobra", "quantidade", "categoria", true)
          }
      })
  }

}
