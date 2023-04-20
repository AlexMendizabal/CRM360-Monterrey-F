import {
  Component,
  OnInit,
  OnDestroy,
  NgZone,
  Input,
  Output,
  EventEmitter
} from '@angular/core';

// amcharts
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';

// Services
import { ComercialDashboardVendedorService } from '../vendedor.service';

@Component({
  selector: 'comercial-dashboard-vendedor-registro-ocorrencias',
  templateUrl: './registro-ocorrencias.component.html',
  styleUrls: ['./registro-ocorrencias.component.scss']
})
export class ComercialDashboardVendedorRegistroOcorrenciasComponent
  implements OnInit, OnDestroy {
  @Input('idVendedor') idVendedor: number;
  @Input('idEscritorio') idEscritorio: number;

  private chart: am4charts.XYChart;
  chartLoaded: boolean;
  chartEmpty = false;

  sumOcorrencias = 0;

  @Output() dataEmitter: EventEmitter<any> = new EventEmitter();

  constructor(
    private dashboardService: ComercialDashboardVendedorService,
    private zone: NgZone
  ) {}

  ngOnInit() {
    this.onDestroy();
    this.getChartData(this.idEscritorio, this.idVendedor);
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

  resetChartData() {
    this.chartLoaded = false;
    this.chartEmpty = false;
  }

  getChartData(escritorio: number, vendedor: number) {
    this.resetChartData();

    this.dashboardService
      .getRegistroOcorrencias(escritorio, vendedor)
      .subscribe((response: any) => {
        if (response['responseCode'] === 200) {
          if (response['result']['analitico'].length > 0) {
            this.renderChart(response['result']['analitico']);
            this.sumOcorrencias = response['result']['total'];
          } else {
            this.chartEmpty = true;
          }
        } else {
          this.chartEmpty = true;
        }

        this.chartLoaded = true;
      });
  }

  renderChart(data: any) {
    this.zone.runOutsideAngular(() => {
      let chart = am4core.create('pie-chart', am4charts.XYChart);

      chart.hiddenState.properties.opacity = 0;

      chart.data = data;

      let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
      categoryAxis.dataFields.category = 'tipo';
      categoryAxis.renderer.grid.template.location = 0;
      categoryAxis.renderer.minGridDistance = 30;
      categoryAxis.renderer.labels.template.horizontalCenter = 'right';
      categoryAxis.renderer.labels.template.verticalCenter = 'middle';
      categoryAxis.renderer.labels.template.rotation = 320;
      categoryAxis.tooltip.disabled = true;
      categoryAxis.renderer.minHeight = 110;
      categoryAxis.cursorTooltipEnabled = false;
      categoryAxis.fontFamily = '"Roboto", sans-serif';

      let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      valueAxis.renderer.minWidth = 50;
      valueAxis.cursorTooltipEnabled = false;

      let series = chart.series.push(new am4charts.ColumnSeries());
      series.sequencedInterpolation = true;
      series.dataFields.valueY = 'valor';
      series.dataFields.categoryX = 'tipo';
      series.columns.template.fillOpacity = 1;
      series.columns.template.strokeOpacity = 0;
      series.columns.template.propertyFields.fill = 'cor';
      series.tooltipText = '[{categoryX}: bold]{valueY}[/]';
      series.columns.template.strokeWidth = 0;
      series.tooltip.pointerOrientation = 'vertical';
      series.columns.template.column.fillOpacity = 0.8;
      series.columns.template.events.on(
        'hit',
        function(ev) {
          this.handleDataEmitter(ev.target.dataItem.dataContext);
        },
        this
      );

      let columnTemplate = series.columns.template;
      columnTemplate.width = 30;
      columnTemplate.strokeOpacity = 0;

      chart.cursor = new am4charts.XYCursor();
      chart.cursor.behavior = 'none';
      chart.cursor.lineX.disabled = true;
      chart.cursor.lineY.disabled = true;

      this.chart = chart;
    });
  }

  handleDataEmitter(data: any) {
    this.dataEmitter.emit({
      config: {
        type: 'registroOcorrencias',
        title: 'Registro de ocorrências'
      },
      data: data
    });
  }
}
