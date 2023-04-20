import { EventEmitter, Injectable } from '@angular/core';

//amChart
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4lang_pt_BR from '@amcharts/amcharts4/lang/pt_BR';

@Injectable({
  providedIn: 'root'
})
export class AbastecimentoAnaliseComprasMultiVisoesChartService {

  eventClick: EventEmitter<any> = new EventEmitter();

  constructor() { }

  pieChart(DATA, identify, value, category) {
    
    am4core.useTheme(this.am4themes_myTheme);

    var chart = am4core.create(identify, am4charts.PieChart);

    // Add data
    chart.data = DATA;

    // Add and configure Series
    var pieSeries = chart.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = value;
    pieSeries.dataFields.category = category;

    // Let's cut a hole in our Pie chart the size of 40% the radius


    // Disable ticks and labels
    pieSeries.labels.template.disabled = true;
    pieSeries.ticks.template.disabled = true;

    // Disable tooltips
    //pieSeries.slices.template.tooltipText = "";

    // Add a legend
    chart.legend = new am4charts.Legend();
        //this.chartService.pieChart(this.data, "chartdiv-entradas", "litres", "country")
  }

  tripleColumnsChart(DATA, identify, category, textCategory, value1, seriesName1, value2, seriesName2, value3, seriesName3 ) {
    var chart = am4core.create(identify, am4charts.XYChart);

    // Add data
    chart.data = DATA;

    // Create axes
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = category;
    categoryAxis.title.text = textCategory;
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 20;

    var  valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = "Toneladas (TON)";

    // Create series
    var series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.valueY = value1;
    series.dataFields.categoryX = category;
    series.name = seriesName1;
    series.tooltipText = "{name}: [bold]{valueY}[/]";
    // This has no effect
    // series.stacked = true;

    var series2 = chart.series.push(new am4charts.ColumnSeries());
    series2.dataFields.valueY = value2;
    series2.dataFields.categoryX = category;
    series2.name = seriesName2;
    series2.tooltipText = "{name}: [bold]{valueY}[/]";
    // Do not try to stack on top of previous series
    // series2.stacked = true;

    var series3 = chart.series.push(new am4charts.ColumnSeries());
    series3.dataFields.valueY = value3;
    series3.dataFields.categoryX = category;
    series3.name = seriesName3;
    series3.tooltipText = "{name}: [bold]{valueY}[/]";

    // Add cursor
    chart.cursor = new am4charts.XYCursor();

    // Add legend
    chart.legend = new am4charts.Legend();
  }
   ​

  am4themes_myTheme(target) {
    if (target instanceof am4core.ColorSet) {
      target.list = [
        am4core.color("#1BA68D"),
        am4core.color("#E77624"),
        am4core.color("#DF3520"),
        am4core.color("#E7DA4F"),
        am4core.color("#64297B"),
        am4core.color("#232555")
      ];
    }
  }
}
