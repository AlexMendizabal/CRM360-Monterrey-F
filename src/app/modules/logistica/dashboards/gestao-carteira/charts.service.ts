import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { Injectable } from '@angular/core';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_material from "@amcharts/amcharts4/themes/material";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

@Injectable({
  providedIn: 'root'
})
export class LogisticaDashboardsGestaoCarteiraChartsService {

  constructor() { }


  pieChart(id, data){

    /* Chart code */
    // Themes begin
    am4core.useTheme(am4themes_material);
    // Create chart instance
    let chart = am4core.create( id, am4charts.PieChart);
    
    // Add data
    chart.data = data;
    chart.radius = am4core.percent(60);
    // Add and configure Series
    let pieSeries = chart.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = "litres";
    pieSeries.dataFields.category = "country";
    pieSeries.slices.template.stroke = am4core.color("#fff");
    pieSeries.slices.template.strokeOpacity = 1;
    
    // This creates initial animation
    pieSeries.hiddenState.properties.opacity = 1;
    pieSeries.hiddenState.properties.endAngle = -90;
    pieSeries.hiddenState.properties.startAngle = -90;
    
    chart.hiddenState.properties.radius = am4core.percent(0);
  }
  
  sortedBarChart(id, data){
    am4core.useTheme(am4themes_material);
    am4core.useTheme(am4themes_animated);
    
    am4core.disposeAllCharts()
    let chart = am4core.create( id, am4charts.XYChart);
    chart.padding(10, 10, 10, 10);
    let categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
    categoryAxis.renderer.grid.template.location = 10;
    categoryAxis.dataFields.category = "nome";
    categoryAxis.renderer.minGridDistance = 10;
    chart.numberFormatter.numberFormat = "#,###.##";
    categoryAxis.renderer.inversed = true;
    categoryAxis.renderer.grid.template.disabled = true;
    categoryAxis.renderer.cellStartLocation = 0.1;
    categoryAxis.renderer.cellEndLocation = 0.9;
    let valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 1;

    
    let cellSize = 30;
      chart.events.on("datavalidated", function(ev) {
      let chart = ev.target;
      let categoryAxis = chart.yAxes.getIndex(0);
      let adjustHeight = chart.data.length * cellSize - categoryAxis.pixelHeight;
      let targetHeight = chart.pixelHeight + adjustHeight;
      chart.svgContainer.htmlElement.style.height = targetHeight + "px";
    });


    let series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.categoryY = "nome";
    series.dataFields.categoryX = "cor";
    series.dataFields.valueX = "peso";
    series.columns.template.strokeOpacity = 0;
    series.columns.template.column.cornerRadiusBottomRight = 5;
    series.columns.template.column.cornerRadiusTopRight = 5;
    

    var columnTemplate = series.columns.template;
    columnTemplate.tooltipText = "{categoryY}: [bold]{valueX}[/]";
    columnTemplate.strokeOpacity = 0;
    columnTemplate.fill = am4core.color("green");

    columnTemplate.adapter.add("fill", function(fill, target) {
      if (target.dataItem.categories.categoryX) {
        return am4core.color(target.dataItem.categories.categoryX);
      }
      else {
        return fill;
      }
    });

    var axisBreak = valueAxis.axisBreaks.create();
    axisBreak.startValue = 10;
    axisBreak.endValue = 10;

    let labelBullet = series.bullets.push(new am4charts.LabelBullet())
    labelBullet.label.horizontalCenter = "left";
    labelBullet.label.dx = 10;
    labelBullet.label.text = "{values.valueX.workingValue.formatNumber('#,###.##')}";
    labelBullet.locationX = 0;
    labelBullet.label.marginTop= 4;

    categoryAxis.sortBySeries = series;
    chart.data = data;
  }

}
