import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// amcharts
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';

// Services
import { ComercialClientesDashboardService } from './../../dashboard.service';

@Component({
  selector: 'comercial-clientes-dashboard-propostas-grafico',
  templateUrl: './grafico.component.html',
  styleUrls: ['./grafico.component.scss']
})
export class ComercialClientesDashboardPropostasGraficoComponent
  implements OnInit, OnDestroy {
  private chart: am4charts.PieChart3D;
  chartLoaded: boolean;
  chartEmpty: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private dashboardService: ComercialClientesDashboardService,
    private zone: NgZone
  ) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.dashboardService
        .getPropostasGrafico(params['id'])
        .subscribe((response: any) => {
          if (response['responseCode'] === 200) {
            if (response['result'].length > 0) {
              this.renderChart(response['result']);
            } else {
              this.chartEmpty = true;
            }
          } else {
            this.chartEmpty = true;
          }
          this.chartLoaded = true;
        });
    });
  }

  ngOnDestroy() {
    this.onDestroy();
  }

  onDestroy() {
    this.zone.runOutsideAngular(() => {
      if (this.chart) {
        this.chart.dispose();
      }
    });
  }

  renderChart(data: any) {
    this.zone.runOutsideAngular(() => {
      let chart = am4core.create('pie-chart', am4charts.PieChart3D);

      chart.hiddenState.properties.opacity = 0;

      chart.data = data;

      chart.innerRadius = 50;

      let pieSeries = chart.series.push(new am4charts.PieSeries3D());
      pieSeries.dataFields.value = 'quantidade';
      pieSeries.dataFields.category = 'descricao';
      pieSeries.slices.template.propertyFields.fill = 'cor';

      this.chart = chart;
    });
  }
}
