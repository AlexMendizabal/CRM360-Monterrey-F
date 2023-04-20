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
import { DateService } from 'src/app/shared/services/core/date.service';
import { ComercialDashboardVendedorService } from '../../dashboard/vendedor/vendedor.service';

@Component({
  selector: 'comercial-templates-mapa-metas',
  templateUrl: './mapa-metas.component.html',
  styleUrls: ['./mapa-metas.component.scss']
})
export class ComercialTemplatesMapaMetasComponent implements OnInit, OnDestroy {
  @Input('idVendedor') idVendedor: number;
  @Input('idEscritorio') idEscritorio: number;
  @Input('showHeader') showHeader = true;
  @Input('loaderStyle') loaderStyle = 'full';

  @Output('onData') onData: EventEmitter<any> = new EventEmitter();

  private pastChartToneladas: am4charts.GaugeChart;
  private pastChartClientes: am4charts.GaugeChart;
  private pastChartExtras: am4charts.GaugeChart;

  private currChartToneladas: am4charts.GaugeChart;
  private currChartClientes: am4charts.GaugeChart;
  private currChartExtras: am4charts.GaugeChart;

  chartLoaded: boolean;
  pastChartsEmpty = false;
  currChartsEmpty = false;

  pastToneladasEmpty = false;
  pastClientesEmpty = false;
  pastExtrasEmpty = false;

  currToneladasEmpty = false;
  currClientesEmpty = false;
  currExtrasEmpty = false;

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
    this.getChartsData(this.idEscritorio, this.idVendedor);
  }

  ngOnDestroy() {
    this.onDestroy();
  }

  onDestroy() {
    this.zone.runOutsideAngular(() => {
      if (this.pastChartToneladas) {
        this.pastChartToneladas.dispose();
      }

      if (this.pastChartClientes) {
        this.pastChartClientes.dispose();
      }

      if (this.pastChartExtras) {
        this.pastChartExtras.dispose();
      }

      if (this.currChartToneladas) {
        this.currChartToneladas.dispose();
      }

      if (this.currChartClientes) {
        this.currChartClientes.dispose();
      }

      if (this.currChartExtras) {
        this.currChartExtras.dispose();
      }
    });
  }

  resetChartsData() {
    this.chartLoaded = false;
    this.pastChartsEmpty = false;
    this.currChartsEmpty = false;
    this.pastToneladasEmpty = false;
    this.pastClientesEmpty = false;
    this.pastExtrasEmpty = false;
    this.currToneladasEmpty = false;
    this.currClientesEmpty = false;
    this.currExtrasEmpty = false;
  }

  getChartsData(escritorio: number, vendedor: number) {
    this.resetChartsData();

    this.dashboardService
      .getMetas(escritorio, vendedor)
      .subscribe((response: any) => {
        this.renderCharts(response);
      });
  }

  renderCharts(response: any) {
    if (response.responseCode === 200) {
      this.onData.emit(response.result);

      if (
        response.result.passado.toneladas &&
        Object.keys(response.result.passado.toneladas).length > 0
      ) {
        this.renderChart(
          'passadoToneladas',
          response.result.passado.toneladas,
          'past-gauge-chart-toneladas'
        );
      } else {
        this.handleEmpty('passadoToneladas');
      }

      if (
        response.result.passado.clientes &&
        Object.keys(response.result.passado.clientes).length > 0
      ) {
        this.renderChart(
          'passadoClientes',
          response.result.passado.clientes,
          'past-gauge-chart-clientes'
        );
      } else {
        this.handleEmpty('passadoClientes');
      }

      if (
        response.result.passado.extras &&
        Object.keys(response.result.passado.extras).length > 0
      ) {
        this.renderChart(
          'passadoExtras',
          response.result.passado.extras,
          'past-gauge-chart-extras'
        );
      } else {
        this.handleEmpty('passadoExtras');
      }

      if (
        !response.result.passado ||
        Object.keys(response.result.passado).length == 0
      ) {
        this.handleEmpty('passadoTodos');
      }

      if (
        response.result.corrente.toneladas &&
        Object.keys(response.result.corrente.toneladas).length > 0
      ) {
        this.renderChart(
          'correnteToneladas',
          response.result.corrente.toneladas,
          'current-gauge-chart-toneladas'
        );
      } else {
        this.handleEmpty('correnteToneladas');
      }

      if (
        response.result.corrente.clientes &&
        Object.keys(response.result.corrente.clientes).length > 0
      ) {
        this.renderChart(
          'correnteClientes',
          response.result.corrente.clientes,
          'current-gauge-chart-clientes'
        );
      } else {
        this.handleEmpty('correnteClientes');
      }

      if (
        response.result.corrente.extras &&
        Object.keys(response.result.corrente.extras).length > 0
      ) {
        this.renderChart(
          'correnteExtras',
          response.result.corrente.extras,
          'current-gauge-chart-extras'
        );
      } else {
        this.handleEmpty('correnteExtras');
      }

      if (
        !response.result.corrente ||
        Object.keys(response.result.corrente).length == 0
      ) {
        this.handleEmpty('correnteTodos');
      }
    } else {
      this.handleEmpty('passadoToneladas');
      this.handleEmpty('passadoClientes');
      this.handleEmpty('passadoExtras');
      this.handleEmpty('passadoTodos');
      this.handleEmpty('correnteToneladas');
      this.handleEmpty('correnteClientes');
      this.handleEmpty('correnteExtras');
      this.handleEmpty('correnteTodos');
    }

    this.chartLoaded = true;
  }

  handleEmpty(type: string) {
    if (type == 'passadoTodos') {
      this.pastChartsEmpty = true;
    } else if (type == 'passadoToneladas') {
      this.pastToneladasEmpty = true;
    } else if (type == 'passadoClientes') {
      this.pastClientesEmpty = true;
    } else if (type == 'passadoExtras') {
      this.pastClientesEmpty = true;
    } else if (type == 'correnteTodos') {
      this.currChartsEmpty = true;
    } else if (type == 'correnteToneladas') {
      this.currToneladasEmpty = true;
    } else if (type == 'correnteClientes') {
      this.currClientesEmpty = true;
    } else if (type == 'correnteExtras') {
      this.currExtrasEmpty = true;
    }
  }

  renderChart(type: string, data: any, chartId: string) {
    this.zone.runOutsideAngular(() => {
      let chart = am4core.create(chartId, am4charts.GaugeChart);

      chart.hiddenState.properties.opacity = 0;

      chart.data = data;

      chart.innerRadius = am4core.percent(82);

      let extraGoalValue: number;
      let calcExtraGoalValue = (data.progresso / data.meta - 1) * 100;

      if (calcExtraGoalValue <= 40) {
        extraGoalValue = 1.4;
      } else if (calcExtraGoalValue > 40 && calcExtraGoalValue < 50) {
        extraGoalValue = 1.5;
      } else if (calcExtraGoalValue > 50 && calcExtraGoalValue < 60) {
        extraGoalValue = 1.6;
      } else if (calcExtraGoalValue > 60 && calcExtraGoalValue < 70) {
        extraGoalValue = 1.7;
      } else if (calcExtraGoalValue > 70 && calcExtraGoalValue < 80) {
        extraGoalValue = 1.8;
      } else if (calcExtraGoalValue > 80 && calcExtraGoalValue < 90) {
        extraGoalValue = 1.9;
      } else if (calcExtraGoalValue > 90 && calcExtraGoalValue < 100) {
        extraGoalValue = 2;
      }

      const axisMax = data.meta * extraGoalValue;
      const axisUnidade = data.unidade;
      const rangeRedMax = data.meta * 0.88;
      const rangeYellowMax = data.meta * 0.95;
      const rangeGreenMax = data.meta;
      const rangeBlackMax = data.meta * 1.01;
      const labelText = data.tipo;
      const progressValue = data.progresso;
      const goalValue = data.meta;
      const percentValue = data.percentual.toFixed(0);
      let handMax;

      if (data.progresso > axisMax) {
        handMax = axisMax;
      } else {
        handMax = data.progresso;
      }

      let axis = chart.xAxes.push(new am4charts.ValueAxis() as any);
      axis.min = 0;
      axis.max = axisMax;
      axis.strictMinMax = false;
      axis.renderer.radius = am4core.percent(80);
      axis.renderer.inside = false;
      axis.renderer.ticks.template.strokeOpacity = 1;
      axis.renderer.ticks.template.length = 10;
      axis.renderer.grid.template.disabled = false;
      axis.renderer.labels.template.radius = 35;
      axis.renderer.labels.template.adapter.add('text', text => {
        return text + axisUnidade;
      });

      let axis2 = chart.xAxes.push(new am4charts.ValueAxis() as any);
      axis2.min = 0;
      axis2.max = axisMax;
      axis2.renderer.innerRadius = 10;
      axis2.strictMinMax = true;
      axis2.renderer.labels.template.disabled = true;
      axis2.renderer.ticks.template.disabled = true;
      axis2.renderer.grid.template.disabled = true;

      let rangeRed = axis2.axisRanges.create();
      rangeRed.value = 0;
      rangeRed.endValue = rangeRedMax;
      rangeRed.axisFill.fillOpacity = 1;
      rangeRed.axisFill.fill = am4core.color('#FF4343');

      let rangeYellow = axis2.axisRanges.create();
      rangeYellow.value = rangeRedMax;
      rangeYellow.endValue = rangeYellowMax;
      rangeYellow.axisFill.fillOpacity = 1;
      rangeYellow.axisFill.fill = am4core.color('#FFEA00');

      let rangeGreen = axis2.axisRanges.create();
      rangeGreen.value = rangeYellowMax;
      rangeGreen.endValue = rangeGreenMax;
      rangeGreen.axisFill.fillOpacity = 1;
      rangeGreen.axisFill.fill = am4core.color('#4DCC71');

      let rangeDivider = axis2.axisRanges.create();
      rangeDivider.value = rangeGreenMax;
      rangeDivider.endValue = rangeBlackMax;
      rangeDivider.axisFill.fillOpacity = 1;
      rangeDivider.axisFill.fill = am4core.color('#000000');

      let rangeOverGoal = axis2.axisRanges.create();
      rangeOverGoal.value = rangeBlackMax;
      rangeOverGoal.endValue = axisMax;
      rangeOverGoal.axisFill.fillOpacity = 1;
      rangeOverGoal.axisFill.fill = am4core.color('#31924C');

      let label = chart.radarContainer.createChild(am4core.Label);
      label.isMeasured = false;
      label.x = am4core.percent(50);
      label.y = 60;
      label.horizontalCenter = 'middle';
      label.verticalCenter = 'bottom';
      label.html = `<p class="text-center mb-0"><strong>${labelText}</strong></p><p class="text-center">${progressValue}${axisUnidade} de ${goalValue}${axisUnidade} <strong>(${percentValue}%)</strong></p>`;

      let hand = chart.hands.push(new am4charts.ClockHand());
      hand.axis = axis2;
      hand.innerRadius = am4core.percent(20);
      hand.startWidth = 3;
      hand.pin.disabled = true;
      hand.value = handMax;

      if (type == 'passadoToneladas') {
        this.pastChartToneladas = chart;
      } else if (type == 'passadoClientes') {
        this.pastChartClientes = chart;
      } else if (type == 'passadoExtras') {
        this.pastChartExtras = chart;
      } else if (type == 'correnteToneladas') {
        this.currChartToneladas = chart;
      } else if (type == 'correnteClientes') {
        this.currChartClientes = chart;
      } else if (type == 'correnteExtras') {
        this.currChartExtras = chart;
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
}
