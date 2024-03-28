import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  NgZone,
  Output,
  EventEmitter
} from '@angular/core';
import { finalize } from 'rxjs/operators';

// amcharts
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4lang_pt_BR from '@amcharts/amcharts4/lang/pt_BR';

// Services
import { ComercialDashboardVendedorService } from '../vendedor.service';
import { DateService } from 'src/app/shared/services/core/date.service';

@Component({
  selector: 'comercial-dashboard-vendedor-concentracao-vendas',
  templateUrl: './concentracao-vendas.component.html',
  styleUrls: ['./concentracao-vendas.component.scss']
})
export class ComercialDashboardVendedorConcentracaoVendasComponent
  implements OnInit, OnDestroy {
  @Input('idVendedor') idVendedor: number;
  @Output() dataEmitter: EventEmitter<any> = new EventEmitter();

  private pastChart: am4charts.XYChart;
  private currChart: am4charts.XYChart;
  chartLoaded: boolean;

  pastEmpty = false;
  pastData: any = [];

  currEmpty = false;
  currData: any = [];

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
    this.getChartData(this.idVendedor);
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

  getChartData(vendedor: number) {
    this.resetChartData();

    this.dashboardService
      .getConcentracaoVendas(vendedor)
      .pipe(
        finalize(() => {
          this.chartLoaded = true;
        })
      )
      .subscribe({
        next: (response: any) => {
          this.renderCharts(response);
        },
        error: (error: any) => {
          this.pastEmpty = true;
          this.currEmpty = true;
        }
      });
  }

  renderCharts(response: any) {
    if (response.hasOwnProperty('success') && response['success'] === true) {
      if (response['data']['passado'].length > 0) {
        let sliceNumber: number;
        this.pastData = response['data']['passado'];

        if (this.pastData.length >= 10) {
          sliceNumber = 10;
        } else if (this.pastData.length < 10) {
          sliceNumber = this.pastData.length;
        }

        this.renderChart(
          'passado',
          this.pastData.slice(0, sliceNumber),
          'past-clients-chart'
        );
      } else {
        this.pastEmpty = true;
      }

      if (response['data']['corrente'].length > 0) {
        let sliceNumber: number;
        this.currData = response['data']['corrente'];

        if (this.currData.length >= 10) {
          sliceNumber = 10;
        } else if (this.currData.length < 10) {
          sliceNumber = this.currData.length;
        }

        this.renderChart(
          'corrente',
          this.currData.slice(0, sliceNumber),
          'current-clients-chart'
        );
      } else {
        this.currEmpty = true;
      }
    } else {
      this.pastEmpty = true;
      this.currEmpty = true;
    }
  }

  renderChart(type: string, data: any, chartId: string) {
    this.zone.runOutsideAngular(() => {
      let chart = am4core.create(chartId, am4charts.XYChart);

      chart.data = data;
      chart.hiddenState.properties.opacity = 0;
      chart.language.locale = am4lang_pt_BR;

      let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
      categoryAxis.dataFields.category = 'razaoSocial';
      categoryAxis.renderer.minGridDistance = 30;
      categoryAxis.cursorTooltipEnabled = false;
      categoryAxis.renderer.labels.template.rotation = 320;
      categoryAxis.renderer.labels.template.disabled = true;

      let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      valueAxis.cursorTooltipEnabled = false;

      let columnSeries = chart.series.push(new am4charts.ColumnSeries());
      columnSeries.name = 'Cliente';
      columnSeries.dataFields.valueY = 'percentual';
      columnSeries.dataFields.categoryX = 'razaoSocial';
      columnSeries.dataFields.valueX = 'ton';
      columnSeries.dataFields.categoryY = 'valor';
      columnSeries.columns.template.events.on(
        'hit',
        function(ev) {
          this.handleDataEmitter(type);
        },
        this
      );

      columnSeries.columns.template.tooltipText = `[#fff bold]{categoryX}[/]
      \n
      [#fff]Representação: [#fff bold]{valueY}%[/][/]
      [#fff]Ton: [#fff bold]{valueX.formatNumber(#.###,###)}t[/][/]
      [#fff]Valor: [#fff bold]R$ {categoryY.formatNumber(#.###,##)}[/][/]`;
      columnSeries.columns.template.propertyFields.fillOpacity = 'fillOpacity';
      columnSeries.columns.template.propertyFields.stroke = 'stroke';
      columnSeries.columns.template.propertyFields.strokeWidth = 'strokeWidth';
      columnSeries.columns.template.propertyFields.strokeDasharray =
        'columnDash';
      columnSeries.tooltip.label.textAlign = 'start';

      let lineSeries = chart.series.push(new am4charts.LineSeries());
      lineSeries.name = 'Representacion acumulada';
      lineSeries.dataFields.valueY = 'representacaoAcumulada';
      lineSeries.dataFields.categoryX = 'razaoSocial';

      lineSeries.stroke = am4core.color('#fdd400');
      lineSeries.strokeWidth = 3;
      lineSeries.propertyFields.strokeDasharray = 'lineDash';
      lineSeries.tooltip.label.textAlign = 'middle';

      let bullet = lineSeries.bullets.push(new am4charts.Bullet());
      bullet.fill = am4core.color('#fdd400');
      bullet.tooltipText = `[#fff]Percentual acumulado: {valueY}%[/]`;
      let circle = bullet.createChild(am4core.Circle);
      circle.radius = 4;
      circle.fill = am4core.color('#fff');
      circle.strokeWidth = 3;

      chart.legend = new am4charts.Legend();

      if (type == 'passado') {
        this.pastChart = chart;
      } else if (type == 'corrente') {
        this.currChart = chart;
      }
    });
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

  handleDataEmitter(type: string) {
    let tipo: string;
    let data: any;

    if (type == 'passado') {
      tipo = this.pastMonth;
      data = this.pastData;
    } else if (type == 'corrente') {
      tipo = this.currMonth;
      data = this.currData;
    }

    this.dataEmitter.emit({
      config: {
        type: 'desempenhoCliente',
        title: 'Acumulacion de ventas'
      },
      data: {
        tipo: tipo,
        data: data
      }
    });
  }
}
