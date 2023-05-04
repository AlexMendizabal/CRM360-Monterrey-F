import { Component, Input, OnInit, OnDestroy, NgZone } from '@angular/core';

// amcharts
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4lang_pt_BR from '@amcharts/amcharts4/lang/pt_BR';

// Services
import { DateService } from 'src/app/shared/services/core/date.service';
import { ComercialDashboardVendedorService } from '../../vendedor.service';

@Component({
  selector: 'comercial-dashboard-vendedor-desempenho-toneladas',
  templateUrl: './toneladas.component.html',
  styleUrls: ['./toneladas.component.scss']
})
export class ComercialDashboardVendedorDesempenhoToneladasComponent
  implements OnInit, OnDestroy {
  @Input('idVendedor') idVendedor: number;
  @Input('idEscritorio') idEscritorio: number;

  private pastChart: am4charts.XYChart;
  private currChart: am4charts.XYChart;
  chartLoaded: boolean;

  pastEmpty: boolean = false;
  currEmpty: boolean = false;

  pastMonth: string;
  currMonth: string;
  activeMonth: string;

  constructor(
    private dashboardService: ComercialDashboardVendedorService,
    private zone: NgZone,
    private dateService: DateService
  ) {}

  ngOnInit() {
    this.onDestroy();
    this.renderMonthFilters();
    this.getChartData(this.idEscritorio, this.idVendedor);
  }

  ngOnDestroy() {
    this.onDestroy();
  }

  onDestroy() {
    this.zone.runOutsideAngular(() => {
      if (this.pastChart) {
        this.pastChart.dispose();
      }

      if (this.currChart) {
        this.currChart.dispose();
      }
    });
  }

  resetChartData() {
    this.chartLoaded = false;
    this.pastEmpty = false;
    this.currEmpty = false;
  }

  getChartData(escritorio: number, vendedor: number) {
    this.resetChartData();

    this.dashboardService
      .getDesempenhoToneladas(escritorio, vendedor)
      .subscribe((response: any) => {
        this.renderCharts(response);
      });
  }

  renderCharts(response: any) {
    if (response['responseCode'] === 200) {
      if (
        response['result']['passado'] &&
        response['result']['passado'].length > 0
      ) {
        this.renderChart(
          'passado',
          response['result']['passado'],
          'past-line-chart',
          response['result']['ano']
        );
      } else {
        this.handleEmpty('passado');
      }

      if (
        response['result']['corrente'] &&
        response['result']['corrente'].length > 0
      ) {
        this.renderChart(
          'corrente',
          response['result']['corrente'],
          'current-line-chart',
          response['result']['ano']
        );
      } else {
        this.handleEmpty('corrente');
      }
    } else {
      this.handleEmpty('passado');
      this.handleEmpty('corrente');
    }

    this.chartLoaded = true;
  }

  renderChart(type: string, data: any, chartId: string, ano: number) {
    this.zone.runOutsideAngular(() => {
      let chart = am4core.create(chartId, am4charts.XYChart);

      chart.hiddenState.properties.opacity = 0;

      chart.data = data;

      console.log(data)

      chart.language.locale = am4lang_pt_BR;

      // let valueAxisX = chart.xAxes.push(new am4charts.ValueAxis());
      // valueAxisX.populateString;
      // valueAxisX.renderer.minGridDistance = 70;
      // valueAxisX.tooltip.disabled = true;

      let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
      categoryAxis.dataFields.category = "data";
      categoryAxis.tooltip.disabled = true;

      let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      valueAxis.renderer.minGridDistance = 50;
      valueAxis.tooltip.disabled = true;

      let seriesPassado = chart.series.push(new am4charts.LineSeries());
      seriesPassado.dataFields.valueY = 'passado';
      seriesPassado.dataFields.categoryX = 'data';
      seriesPassado.tensionX = 0.8;
      seriesPassado.strokeWidth = 3;
      seriesPassado.tooltipText = '{categoryX}: {valueY.value}t';
      seriesPassado.tooltip.layout = 'absolute';
      seriesPassado.tooltip.pointerOrientation = 'right';
      seriesPassado.fill = am4core.color('#ff4343');
      seriesPassado.stroke = am4core.color('#ff4343');

      let bulletPassado = seriesPassado.bullets.push(
        new am4charts.CircleBullet()
      );
      bulletPassado.circle.strokeWidth = 1;
      bulletPassado.width = 5;
      bulletPassado.height = 5;

      const yearPassado = ano - 1;

      seriesPassado.legendSettings.labelText = `${yearPassado} (t)`;

      let seriesPresente = chart.series.push(new am4charts.LineSeries());
      seriesPresente.dataFields.valueY = 'presente';
      seriesPresente.dataFields.categoryX  = 'data';
      seriesPresente.tensionX = 0.8;
      seriesPresente.strokeWidth = 3;
      seriesPresente.tooltipText = '{categoryX}: {valueY.value}t';
      seriesPresente.tooltip.layout = 'absolute';
      seriesPresente.tooltip.pointerOrientation = 'right';
      seriesPresente.fill = am4core.color('#4dcc71');
      seriesPresente.stroke = am4core.color('#4dcc71');

      let bulletPresente = seriesPresente.bullets.push(new am4charts.Bullet());
      bulletPresente.width = 5;
      bulletPresente.height = 5;
      bulletPresente.horizontalCenter = 'middle';
      bulletPresente.verticalCenter = 'middle';

      let rectanglePresente = bulletPresente.createChild(am4core.Rectangle);
      rectanglePresente.strokeWidth = 5;
      rectanglePresente.width = 5;
      rectanglePresente.height = 5;

      const yearPresente = ano;

      seriesPresente.legendSettings.labelText = `${yearPresente} (t)`;

      let seriesProjecao = chart.series.push(new am4charts.LineSeries());
      seriesProjecao.dataFields.valueY = 'projecao';
      seriesProjecao.dataFields.categoryX  = 'data';
      seriesProjecao.tensionX = 0.8;
      seriesProjecao.strokeWidth = 3;
      seriesProjecao.tooltipText = '{categoryX}: {valueY.value}t';
      seriesProjecao.tooltip.layout = 'absolute';
      seriesProjecao.tooltip.pointerOrientation = 'right';
      seriesProjecao.fill = am4core.color('#790aa3');
      seriesProjecao.stroke = am4core.color('#790aa3');

      let bulletProjecao = seriesProjecao.bullets.push(new am4charts.Bullet());
      bulletProjecao.width = 5;
      bulletProjecao.height = 5;
      bulletProjecao.horizontalCenter = 'middle';
      bulletProjecao.verticalCenter = 'middle';

      let rectangleProjecao = bulletProjecao.createChild(am4core.Rectangle);
      rectangleProjecao.strokeWidth = 5;
      rectangleProjecao.width = 5;
      rectangleProjecao.height = 5;

      seriesProjecao.legendSettings.labelText = 'Ritmo (t)';

      chart.cursor = new am4charts.XYCursor();
      chart.cursor.behavior = 'none';
      chart.cursor.lineX.disabled = true;
      chart.cursor.lineY.disabled = true;

      chart.legend = new am4charts.Legend();

      if (type == 'passado') {
        this.pastChart = chart;
      } else if (type == 'corrente') {
        this.currChart = chart;
      }
    });
  }

  handleEmpty(type: string) {
    if (type == 'passado') {
      this.pastEmpty = true;
    } else if (type == 'corrente') {
      this.currEmpty = true;
    }
  }

  renderMonthFilters() {
    const currDate = new Date();
    const pastDate = new Date();

    if (currDate.getDate() === 31) {
      pastDate.setDate(currDate.getDate() - 31);
    } else {
      pastDate.setDate(currDate.getDate() - 30);
    }

    this.currMonth = this.dateService.getFullMonth(currDate);
    this.pastMonth = this.dateService.getFullMonth(pastDate);
    this.activeMonth = this.currMonth;
  }

  setMonth(month: string) {
    this.chartLoaded = false;
    this.activeMonth = month;

    setTimeout(() => {
      this.chartLoaded = true;
    }, 1000);
  }
}
