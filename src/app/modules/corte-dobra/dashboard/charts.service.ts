import { Injectable, EventEmitter } from '@angular/core';

//amChart
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4lang_pt_BR from '@amcharts/amcharts4/lang/pt_BR';

@Injectable({
  providedIn: 'root'
})
export class CorteDobraChartsService {

  eventClick: EventEmitter<any> = new EventEmitter();

  constructor() { }

  pieChart(DATA, identify, value, category) {
    
    am4core.useTheme(this.am4themes_myTheme);

    let chart = am4core.create(identify, am4charts.PieChart3D);
    chart.hiddenState.properties.opacity = 0; // this creates initial fade-in


    chart.data = DATA;

    // chart.innerRadius = am4core.percent(40);
    // chart.depth = 120;

    chart.legend = new am4charts.Legend();

    let series = chart.series.push(new am4charts.PieSeries3D());
    series.dataFields.value = value;
    series.dataFields.depthValue = value;
    series.dataFields.category = category;
    series.slices.template.cornerRadius = 5;
    series.colors.step = 3;
  }

  simpleColumnChart(DATA, identify, category, value, seriesName) {

    am4core.useTheme(this.am4themes_myTheme);

    // Create chart chart
    let data = am4core.create(identify, am4charts.XYChart);

    // Add data
    data.data = DATA;

    //adiciona legenda
    data.legend = new am4charts.Legend();
    
    data.language.locale = am4lang_pt_BR;
    // data.dateFormatter.dateFormat = 'dd/mm';
    

    data.language.locale["_date_day"]     = "dd/MM";
		data.language.locale["_date_week"]    = "ww";
		data.language.locale["_date_month"]   = "MMM";
		data.language.locale["_date_year"]    = "yyyy";

		data.language.locale["_decimalSeparator"] = ",";
		data.language.locale["_thousandSeparator"] = ""; 
    
    // Create axes
    let dateAxis = data.xAxes.push(new am4charts.DateAxis());
    // dateAxis.dataFields.category = category;
    dateAxis.renderer.grid.template.location = 0;
    dateAxis.renderer.minGridDistance = 30;
    dateAxis.renderer.grid.template.disabled = true;

    dateAxis.skipEmptyPeriods = true;
    
    let valueAxis = data.yAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.grid.template.disabled = true;
    valueAxis.renderer.labels.template.disabled = true;
    
    valueAxis.extraMax = 0.1;
    // valueAxis.title.text   =	"Peso em ton.";
    
    // Create series
    let series = data.series.push(new am4charts.ColumnSeries());
    series.columns.template.stroke = am4core.color("#FFFFFF");
    series.dataFields.valueY = value;
    series.dataFields.dateX = category;
    series.name = seriesName;
    series.columns.template.tooltipText = "{dateX.formatDate('dd/MM/yy')} - Peso: {valueY} t";
    series.stacked = true;

    let valueLabel = series.bullets.push(new am4charts.LabelBullet());
    valueLabel.label.text = "{valueY.formatNumber('#.')} t";
    valueLabel.label.fontSize = 15;
    valueLabel.label.paddingBottom = 15;

    // let valueLabel2 = series2.bullets.push(new am4charts.LabelBullet());
    // valueLabel2.label.text = "{valueY}";
    // valueLabel2.label.fontSize = 20;
    // valueLabel2.label.paddingBottom = 15;

    let columnTemplate = series.columns.template;
    columnTemplate.strokeWidth = 2;
    columnTemplate.strokeOpacity = 1;

    //Insere sombra ao passar cursor
    data.cursor = new am4charts.XYCursor();
    valueAxis.cursorTooltipEnabled = false;
    dateAxis.cursorTooltipEnabled = false;

    data.cursor.lineY.disabled = true;

    data.cursor.xAxis = dateAxis;
    data.cursor.fullWidthLineX = true;
    data.cursor.lineX.strokeWidth = 0;
    data.cursor.lineX.fill = am4core.color("#8F3985");
    data.cursor.lineX.fillOpacity = 0.1;
    /*series.columns.template.adapter.add("fill", function (fill, target) {
      if (target.dataItem && target.dataItem.dataContext["color"])
        return am4core.color(target.dataItem.dataContext["color"]);
      else
        return fill;
    });*/

    return data;

  }

  doubleColumnChart(DATA, identify, category, value, value2, value3, seriesName, seriesName2 ) {

    am4core.useTheme(this.am4themes_myTheme);

    // Create chart chart
    let data = am4core.create(identify, am4charts.XYChart);

    // Add data
    data.data = DATA;

    //adiciona legenda
    data.legend = new am4charts.Legend();

    data.language.locale = am4lang_pt_BR;
    // data.dateFormatter.dateFormat = 'dd/mm';
    

    data.language.locale["_date_day"]     = "dd/MM";
		data.language.locale["_date_week"]    = "ww";
		data.language.locale["_date_month"]   = "MMM";
		data.language.locale["_date_year"]    = "yyyy";

		data.language.locale["_decimalSeparator"] = ",";
		data.language.locale["_thousandSeparator"] = ""; 
    
    // Create axes
    let dateAxis = data.xAxes.push(new am4charts.DateAxis());
    // dateAxis.dataFields.category = category;
    dateAxis.renderer.grid.template.location = 0;
    dateAxis.renderer.minGridDistance = 30;
    dateAxis.renderer.grid.template.disabled = true;

    dateAxis.skipEmptyPeriods = true;
    
    let valueAxis = data.yAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.grid.template.disabled = true;
    valueAxis.renderer.labels.template.disabled = true;
    
    valueAxis.extraMax = 0.1;
    // valueAxis.title.text   =	"Peso em ton.";
    
    // Create series
    let series = data.series.push(new am4charts.ColumnSeries());
    series.columns.template.stroke = am4core.color("#FFFFFF");
    series.dataFields.valueY = value;
    series.dataFields.dateX = category;
    series.name = seriesName;
    series.columns.template.tooltipText = "{dateX.formatDate('dd/MM/yy')} - Peso: {valueY} t";
    series.stacked = true;

    // let valueLabel = series.bullets.push(new am4charts.LabelBullet());
    // valueLabel.label.text = "{valueY}";
    // valueLabel.label.fontSize = 20;
    // valueLabel.label.paddingBottom = -20;

    let series2 = data.series.push(new am4charts.ColumnSeries());
    series2.columns.template.stroke = am4core.color("#FFFFFF");
    series2.dataFields.valueY = value2;
    series2.dataFields.dateX = category;
    series2.name = seriesName2;
    series2.columns.template.tooltipText = "{dateX.formatDate('dd/MM/yy')} - Peso: {valueY} t";
    series2.stacked = true;

    // let valueLabel2 = series2.bullets.push(new am4charts.LabelBullet());
    // valueLabel2.label.text = "{valueY}";
    // valueLabel2.label.fontSize = 20;
    // valueLabel2.label.paddingBottom = 15;

    let columnTemplate = series.columns.template;
    columnTemplate.strokeWidth = 2;
    columnTemplate.strokeOpacity = 1;

    //linha do Acumulado
    let series3 = data.series.push(new am4charts.LineSeries());
    series3.name = value3;
    series3.dataFields.valueY = value3;
    series3.dataFields.dateX = category;
    series3.strokeWidth = 3;

    // Adiciona rotulo com valor do acumulado
    let circleBullet = series3.bullets.push(new am4charts.CircleBullet());
    circleBullet.circle.stroke = am4core.color("#fff");
    circleBullet.circle.strokeWidth = 2;
    // circleBullet.tooltipText = "{name}: [bold]{valueY} t [/]";

    let labelBullet3 = series3.bullets.push(new am4charts.LabelBullet());
    labelBullet3.label.text = "{valueY.formatNumber('#.')} t";
    labelBullet3.label.fontSize = 15;
    labelBullet3.label.dy = - 20;

    //Insere sombra ao passar cursor
    data.cursor = new am4charts.XYCursor();
    valueAxis.cursorTooltipEnabled = false;
    dateAxis.cursorTooltipEnabled = false;

    data.cursor.lineY.disabled = true;

    data.cursor.xAxis = dateAxis;
    data.cursor.fullWidthLineX = true;
    data.cursor.lineX.strokeWidth = 0;
    data.cursor.lineX.fill = am4core.color("#8F3985");
    data.cursor.lineX.fillOpacity = 0.1;

    /*series.columns.template.adapter.add("fill", function (fill, target) {
      if (target.dataItem && target.dataItem.dataContext["color"])
        return am4core.color(target.dataItem.dataContext["color"]);
      else
        return fill;
    });*/

    return data;

  }

  clusteredBarChart(data, identify, quantity, category, event) {
    // Create chart chart
    let chart = am4core.create(identify, am4charts.XYChart);

    // Add data
    chart.data = data;

    // Create axes
    let categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = category;
    categoryAxis.numberFormatter.numberFormat = "#";
    categoryAxis.renderer.inversed = true;
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.cellStartLocation = 0.1;
    categoryAxis.renderer.cellEndLocation = 0.9;

    let valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.opposite = true;
    valueAxis.renderer.grid.template.disabled = true;
    valueAxis.renderer.labels.template.disabled = true;

    // Create series
    
    let series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.valueX = quantity;
    series.dataFields.categoryY = category;
    series.name = quantity;

    let e = (ev) => this.eventClick.emit({ "categoria": ev.target.dataItem.categories.categoryY });

    if (event)
      series.columns.template.events.on("hit", e);
    else
      series.columns.template.events.off("hit", e);

    let valueLabel = series.bullets.push(new am4charts.LabelBullet());
    valueLabel.label.text = "{valueX}";
    valueLabel.label.horizontalCenter = "left";
    valueLabel.label.dx = 10;
    valueLabel.label.hideOversized = false;
    valueLabel.label.truncate = false;

    series.columns.template.adapter.add("fill", (fill, target) => {
      return chart.colors.getIndex(target.dataItem.index);
    });

    
  }

  lineChart(identify, DATA, x, y, middle) {

    // Create chart chart
    let chart = am4core.create(identify, am4charts.XYChart);

    // Data for both series
    let data = DATA;

    /* Create axes */
    let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    this.configCategoryAxis(categoryAxis, x);

    /* Create value axis */
    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    this.configValueAxis(valueAxis);

    /* Create series */
    let columnSeries = chart.series.push(new am4charts.ColumnSeries());
    this.configColumnSeries(columnSeries, x, middle);
    this.configValueLabel(columnSeries.bullets.push(new am4charts.LabelBullet()));
    this.configCustomColumnSeries(columnSeries);

    let lineSeries = chart.series.push(new am4charts.LineSeries());
    this.configLineSeries(lineSeries, y, x);
    this.configCustomLineSeries(lineSeries);

    // Make bullets grow on hover
    let bullet = lineSeries.bullets.push(new am4charts.CircleBullet());
    bullet.circle.strokeWidth = 1;
    bullet.circle.radius = 6;
    bullet.circle.fill = am4core.color("#fff");

    let valueLabel = lineSeries.bullets.push(new am4charts.LabelBullet());
    this.configValueLabel(valueLabel);

    let bullethover = bullet.states.create("hover");
    bullethover.properties.scale = 1.5;

    chart.data = data;
  }

  configCategoryAxis(categoryAxis, category) {

    categoryAxis.dataFields.category = category;
    categoryAxis.renderer.minGridDistance = 30;
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
    valueLabel.label.fontSize = 15;
    valueLabel.label.paddingBottom = 30;

    return valueLabel;
  }

  configValueLabel2(valueLabel2) {

    valueLabel2.label.text = "{valueY}";
    valueLabel2.label.fontSize = 15;
    valueLabel2.label.paddingBottom = 30;

    return valueLabel2;
  }

  configCustomColumnSeries(columnSeries) {

    columnSeries.columns.template.propertyFields.fillOpacity = "fillOpacity";
    columnSeries.columns.template.propertyFields.stroke = "stroke";
    columnSeries.columns.template.propertyFields.strokeWidth = "strokeWidth";
    columnSeries.columns.template.propertyFields.strokeDasharray = "columnDash";

    return columnSeries;
  }

  configLineSeries(lineSeries, valueY, categoryX) {
    //lineSeries.name = "Expenses";
    lineSeries.dataFields.valueY = valueY;
    lineSeries.dataFields.categoryX = categoryX;
  }

  configCustomLineSeries(lineSeries) {
    lineSeries.stroke = am4core.color("#fdd400");
    lineSeries.strokeWidth = 1;
    lineSeries.propertyFields.strokeDasharray = "lineDash";
    lineSeries.tooltip.label.textAlign = "middle";
  }

  am4themes_myTheme(target) {
    if (target instanceof am4core.ColorSet) {
      target.list = [
        am4core.color("#1BA68D"),
        am4core.color("#E77624"),
        am4core.color("#DF3520"),
        am4core.color("#1BA68D"),
        am4core.color("#E7DA4F"),
        am4core.color("#64297B"),
        am4core.color("#232555")
      ];
    }
  }

}
