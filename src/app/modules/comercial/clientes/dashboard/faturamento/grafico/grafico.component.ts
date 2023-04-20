import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// amcharts
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';

// Services
import { ComercialClientesDashboardService } from './../../dashboard.service';

@Component({
  selector: 'comercial-clientes-dashboard-faturamento-grafico',
  templateUrl: './grafico.component.html',
  styleUrls: ['./grafico.component.scss']
})
export class ComercialClientesDashboardFaturamentoGraficoComponent
  implements OnInit, OnDestroy {
  private chart: am4charts.XYChart;
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
        .getFaturamentoGrafico(params['id'])
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
      let chart = am4core.create('column-chart', am4charts.XYChart);

      chart.hiddenState.properties.opacity = 0;

      chart.data = data;

      let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
      categoryAxis.dataFields.category = 'periodo';
      categoryAxis.renderer.grid.template.location = 0;
      categoryAxis.renderer.minGridDistance = 100;

      let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

      let series = chart.series.push(new am4charts.ColumnSeries());
      series.dataFields.valueY = 'ton';
      series.dataFields.categoryX = 'periodo';
      series.name = 'Toneladas';
      series.columns.template.propertyFields.fill = 'cor';
      series.columns.template.tooltipText = '{categoryX}: [bold]{valueY}[/]t';

      let columnTemplate = series.columns.template;
      columnTemplate.strokeOpacity = 0;

      this.chart = chart;
    });
  }
}
