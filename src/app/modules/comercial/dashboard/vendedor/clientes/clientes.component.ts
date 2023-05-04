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
  selector: 'comercial-dashboard-vendedor-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss']
})
export class ComercialDashboardVendedorClientesComponent
  implements OnInit, OnDestroy {
  @Input('idVendedor') idVendedor: number;
  @Input('idEscritorio') idEscritorio: number;
  @Output() dataEmitter: EventEmitter<any> = new EventEmitter();

  private chart: am4charts.XYChart;
  chartLoaded: boolean;
  chartEmpty = false;

  sumClientes = 0;

  constructor(
    private dashboardService: ComercialDashboardVendedorService,
    private zone: NgZone
  ) { }

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
      .getClientes(escritorio, vendedor)
      .subscribe((response: any) => {
        if (response['responseCode'] === 200) {
          if (response['result'] && response['result'].length > 0) {
            this.renderChart(response['result']);
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
    const ativos_inativos = data.filter(item => (item.tipo === "Ativos" || item.tipo === "Inativos" || item.tipo === "Potenciais"));
    this.sumClientes = ativos_inativos.reduce((acc: Number, item) => acc += item.quantidade, 0);

    this.zone.runOutsideAngular(() => {
      let chart = am4core.create('column-chart', am4charts.XYChart);

      chart.hiddenState.properties.opacity = 0;

      chart.data = data;

      let categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
      categoryAxis.dataFields.category = 'tipo';
      categoryAxis.renderer.inversed = true;
      categoryAxis.renderer.minGridDistance = 20;
      categoryAxis.renderer.grid.template.location = 0;
      categoryAxis.cursorTooltipEnabled = false;
      categoryAxis.fontFamily = '"Roboto", sans-serif';

      let valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
      valueAxis.renderer.opposite = true;
      valueAxis.cursorTooltipEnabled = false;

      let series = chart.series.push(new am4charts.ColumnSeries());
      series.dataFields.categoryY = 'tipo';
      series.dataFields.valueX = 'quantidade';
      series.name = 'Quantidade';
      series.columns.template.fillOpacity = 1;
      series.columns.template.strokeOpacity = 0;
      series.columns.template.propertyFields.fill = 'cor';
      series.tooltipText = '{valueX.value}';
      series.tooltip.layout = 'horizontal';
      series.tooltip.pointerOrientation = 'left';
      series.columns.template.events.on(
        'hit',
        function (ev) {
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
    let tipoCliente: string;

    // Os tipos de clientes irão definir as colunas da tabela.
    if (
      data.tipo == 'Ativos' ||
      data.tipo == 'Potenciais' ||
      data.tipo == 'Novos c/ compra' ||
      data.tipo == 'Reativados' ||
      data.tipo == 'Inativados'
    ) {
      // clientesA = Código, Razão social
      tipoCliente = 'clientesA';
    } else if (data.tipo == 'Com compra') {
      // clientesB = Código, Razão social, Toneladas e R$
      tipoCliente = 'clientesB';
    } else if (data.tipo == 'Sem compra' || data.tipo == 'Inativos') {
      // clientesC = Código, Razão social, Última compra
      tipoCliente = 'clientesC';
    } else if (data.tipo == 'À inativar') {
      // clientesD = Código, Razão social, Última compra, Inativação em
      tipoCliente = 'clientesD';
    }

    this.dataEmitter.emit({
      config: {
        type: tipoCliente,
        title: 'Carteira de clientes'
      },
      data: data
    });
  }
}
