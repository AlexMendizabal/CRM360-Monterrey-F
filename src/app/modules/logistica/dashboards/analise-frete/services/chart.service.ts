import { Injectable, EventEmitter } from '@angular/core';

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";

@Injectable({
  providedIn: 'root'
})
export class LogisticaDashboardsChartService {

  eventClick: EventEmitter<any> = new EventEmitter();

  constructor() { }

  pieChart(chart, data, category, value) {

    /* let chart = am4core.create(identify, am4charts.PieChart3D); */
    chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

    chart.data = data;

    /* chart.innerRadius = am4core.percent(40);
    chart.depth = 120; */

    let series = chart.series.push(new am4charts.PieSeries3D());
    series.dataFields.value = value;
    /* series.dataFields.depthValue = value; */
    series.colors.step = 3;
    series.dataFields.category = category;
    /* series.slices.template.cornerRadius = 5;
    */

    chart.numberFormatter.numberFormat = {
      decimalSeparator:",",
      thousandsSeparator:""
    };
  }

  simpleColumnChart(DATA, identify, category, value) {

    // Create chart instance
    let data = am4core.create(identify, am4charts.XYChart);

    // Add data
    data.data = DATA;

    // Create axes
    let categoryAxis = data.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = category;
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 30;
    categoryAxis.renderer.grid.template.disabled = true;

    let valueAxis = data.yAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.grid.template.disabled = true;
    valueAxis.renderer.labels.template.disabled = true;

    // Create series
    let series = data.series.push(new am4charts.ColumnSeries());
    series.columns.template.stroke = am4core.color("#FFFFFF");
    series.dataFields.valueY = value;
    series.dataFields.categoryX = category;
    series.name = value;

    let valueLabel = series.bullets.push(new am4charts.LabelBullet());
    valueLabel.label.text = "{valueY}";
    valueLabel.label.fontSize = 20;
    valueLabel.label.paddingBottom = 15;

    let columnTemplate = series.columns.template;
    columnTemplate.strokeWidth = 2;
    columnTemplate.strokeOpacity = 1;

    return data;

  }

  clusteredBarChart(chart, data, category, value, event) {

    // Add data
    chart.data = data;

    // Create axes
    let categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = category;
    categoryAxis.numberFormatter.numberFormat = "#";
    categoryAxis.renderer.inversed = true;
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 0.1;
    categoryAxis.renderer.cellStartLocation = 0.1;
    categoryAxis.renderer.cellEndLocation = 0.9;


    let valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.opposite = true;
    valueAxis.renderer.grid.template.disabled = true;
    valueAxis.renderer.labels.template.disabled = true;
    valueAxis.max = Math.max.apply(Math, data.map(function (o) { return o[value] * 1.1; }));

    // Create series
    let series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.valueX = value;
    series.dataFields.categoryY = category;
    series.name = value;

    let e = (ev) => this.eventClick.emit({ "categoria": ev.target.dataItem.categories.categoryY });

    if (event) {
      series.columns.template.events.on("hit", e);
      series.columns.template.cursorOverStyle = am4core.MouseCursorStyle.pointer;
    } else {
      series.columns.template.events.off("hit", e);
    }

    let valueLabel = series.bullets.push(new am4charts.LabelBullet());
    valueLabel.label.text = "{valueX}";
    valueLabel.label.horizontalCenter = "left";
    valueLabel.label.dx = 10;
    //valueLabel.label.fontSize = 15
    valueLabel.label.hideOversized = false;
    valueLabel.label.truncate = false;
    //valueLabel.label.fill = am4core.color("#FFF");
  }

  getInstance(id, type = 'XYChart'){

    let chart = am4core.create(id, am4charts[type]);

    chart.numberFormatter.numberFormat = "#.00";
    chart.language.locale._decimalSeparator = ",";
    chart.language.locale._thousandSeparator = "";

    return chart;
  }

  // lineChart(chart, data, x, y, middle) {


  //   /* Create axes */
  //   let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
  //   this.configCategoryAxis(categoryAxis, x);

  //   const _max = (Math.max(...data.map((e) => e.hasOwnProperty(y) ? e[y] : 0))) * 1.05;

  //   if(_max >= 1000){
  //     chart.numberFormatter.numberFormat = "#.00a";
  //   }

  //   /* Create value axis */
  //   let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
  //   valueAxis.max = _max;

  //   this.configValueAxis(valueAxis);

  //   /* Create series */
  //   let columnSeries = chart.series.push(new am4charts.ColumnSeries());

  //   this.configColumnSeries(columnSeries, x, middle);
  //   this.configValueLabel(columnSeries.bullets.push(new am4charts.LabelBullet()));
  //   this.configCustomColumnSeries(columnSeries);

  //   let lineSeries = chart.series.push(new am4charts.LineSeries());
  //   //lineSeries.rotation = 180;
  //   this.configLineSeries(lineSeries, y, x);
  //   this.configCustomLineSeries(lineSeries);

  //   // Make bullets grow on hover
  //   let bullet = lineSeries.bullets.push(new am4charts.CircleBullet());
  //   bullet.circle.strokeWidth = 1;
  //   bullet.circle.radius = 1;
  //   bullet.circle.fill = am4core.color("#fff");

  //   let valueLabel = lineSeries.bullets.push(new am4charts.LabelBullet());
  //   this.configValueLabel(valueLabel);

  //   /* let bullethover = bullet.states.create("hover");
  //   bullethover.properties.scale = 2.5; */

  //   chart.data = data;
  //   chart.validateData();
  //   return chart;
  // }

  lineChart(chart, data, x, y) {


    /* Create axes */
    let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    this.configCategoryAxis(categoryAxis, x);

    const _max = (Math.max(...data.map((e) => e.hasOwnProperty(y) ? e[y] : 0))) * 1.05;

    if(_max >= 1000){
      chart.numberFormatter.numberFormat = "#.00a";
    }

    /* Create value axis */
    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.max = _max;

    this.configValueAxis(valueAxis);

    /* Create series */
    // let columnSeries = chart.series.push(new am4charts.ColumnSeries());

    // this.configColumnSeries(columnSeries, x, middle);
    // this.configValueLabel(columnSeries.bullets.push(new am4charts.LabelBullet()));
    // this.configCustomColumnSeries(columnSeries);

    let lineSeries = chart.series.push(new am4charts.LineSeries());
    //lineSeries.rotation = 180;
    this.configLineSeries(lineSeries, y, x);
    this.configCustomLineSeries(lineSeries);

    // Make bullets grow on hover
    let bullet = lineSeries.bullets.push(new am4charts.CircleBullet());
    bullet.circle.strokeWidth = 1;
    bullet.circle.radius = 1;
    bullet.circle.fill = am4core.color("#fff");

    let valueLabel = lineSeries.bullets.push(new am4charts.LabelBullet());
    this.configValueLabel(valueLabel);

    chart.data = data;
    chart.validateData();
    return chart;
  }

  barV(chart, x, middle){
    /* Create series */
    let columnSeries = chart.series.push(new am4charts.ColumnSeries());

    this.configColumnSeries(columnSeries, x, middle);
    this.configValueLabel(columnSeries.bullets.push(new am4charts.LabelBullet()));
    this.configCustomColumnSeries(columnSeries);
  }

  configCategoryAxis(categoryAxis, category) {

    categoryAxis.dataFields.category = category;
    categoryAxis.renderer.minGridDistance = 30;
    categoryAxis.renderer.labels.template.rotation = 90;
    categoryAxis.renderer.labels.template.verticalCenter = "middle";
    categoryAxis.renderer.labels.template.horizontalCenter = "middle";
    categoryAxis.renderer.grid.template.disabled = true;
    categoryAxis.renderer.labels.template.disabled = false;

    return categoryAxis;
  }

  configValueAxis(valueAxis) {

    valueAxis.renderer.grid.template.disabled = true;
    valueAxis.renderer.labels.template.disabled = true;
    return valueAxis;
  }

  configColumnSeries(columnSeries, x, y) {

    columnSeries.dataFields.valueY = y;
    columnSeries.dataFields.categoryX = x;

    return columnSeries;
  }

  configValueLabel(valueLabel) {

    valueLabel.label.text = "{valueY}";
    valueLabel.label.fontSize = 12;
    valueLabel.label.paddingBottom = 25;

    return valueLabel;
  }

  configCustomColumnSeries(columnSeries) {

    columnSeries.columns.template.propertyFields.fillOpacity = "fillOpacity";
    columnSeries.columns.template.propertyFields.stroke = "stroke";
    columnSeries.columns.template.propertyFields.strokeWidth = "strokeWidth";
    columnSeries.columns.template.propertyFields.strokeDasharray = "columnDash";

    return columnSeries;
  }

  configLineSeries(lineSeries, valueY, categoryX) {
    lineSeries.dataFields.valueY = valueY;
    lineSeries.dataFields.categoryX = categoryX;
  }

  configCustomLineSeries(lineSeries) {
    lineSeries.stroke = am4core.color("#fdd400");
    lineSeries.strokeWidth = 1;
    lineSeries.propertyFields.strokeDasharray = "lineDash";
    lineSeries.tooltip.label.textAlign = "middle";
  }
}
