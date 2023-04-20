import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { Injectable } from '@angular/core';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_material from "@amcharts/amcharts4/themes/material";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

@Injectable({
  providedIn: 'root'
})
export class LogisticaDashboardsFaturamentoFinanceiroChartsService {

  constructor() { }

  pieChart(id, data){

    am4core.useTheme(am4themes_material);
    let chart = am4core.create( id, am4charts.PieChart);
    
    chart.data = data

    let pieSeries = chart.series.push(new am4charts.PieSeries());
    if(id == 'pieChartRepresentativo'){
        pieSeries.dataFields.value = "VL_PERC";
    } else {
        pieSeries.dataFields.value = "VL_CTRC";
    }
    
    pieSeries.dataFields.category = "NM_CLIE";
    pieSeries.slices.template.stroke = am4core.color("#fff");
    pieSeries.slices.template.strokeOpacity = 1;

    
    // This creates initial animation
    pieSeries.hiddenState.properties.opacity = 1;
    pieSeries.hiddenState.properties.endAngle = -90;
    pieSeries.hiddenState.properties.startAngle = -90;
    
    chart.hiddenState.properties.radius = am4core.percent(0);
  }

  clusteredChart(id, data ){
    am4core.useTheme(am4themes_material);
    am4core.useTheme(am4themes_animated);
    
    let chart = am4core.create(id, am4charts.XYChart)
    // chart.exporting.menu = new am4core.ExportMenu();
    chart.colors.step = 2;
    chart.legend = new am4charts.Legend()
    chart.legend.position = 'top'
    chart.legend.paddingBottom = 20
    chart.legend.labels.template.maxWidth = 95
    


    let xAxis = chart.xAxes.push(new am4charts.CategoryAxis())
    xAxis.dataFields.category = 'SG_PERI'
    xAxis.renderer.cellStartLocation = 0.1
    xAxis.renderer.cellEndLocation = 0.9
    xAxis.renderer.grid.template.location = 0;
    xAxis.tooltip.disabled = true;
    
    let yAxis = chart.yAxes.push(new am4charts.ValueAxis());
    yAxis.min = 0;


    function createSeries(value, name) {
        let series = chart.series.push(new am4charts.ColumnSeries())
        series.dataFields.valueY = value
        series.dataFields.categoryX = 'SG_PERI'
        series.name = name
        
        series.events.on("hidden", arrangeColumns);
        series.events.on("shown", arrangeColumns);

        var columnTemplate = series.columns.template;
        columnTemplate.tooltipText = "{name}: [bold]{valueY}[/]";

        let bullet = series.bullets.push(new am4charts.LabelBullet())
        bullet.interactionsEnabled = false
        bullet.dy = 10;
        bullet.label.text = '{valueY}'
        bullet.label.fill = am4core.color('#ffffff')

        return series;
    }
    
    chart.data = data

    if(id == 'clusteredChartCteComplementar'){
      createSeries('Aperam', 'Aperam');
      createSeries('Arcelor Mittal', 'Arcelor Mittal');
      createSeries('Manetoni', 'Manetoni');
      createSeries('Novos Negócios', 'Novos Negócios');
      createSeries('Vallourec', 'Vallourec');
    } else {
      createSeries('Faturamento', 'Faturamento');
      createSeries('Ritmo', 'Ritmo');
      createSeries('Receita - MRF', 'MRF');
      createSeries('Receita - Planejamento', 'Orçamento');
    }

    if(id != "clusteredChartMesAtual"){
      chart.scrollbarX = new am4core.Scrollbar();
      chart.scrollbarX.minHeight = 20;
      chart.scrollbarX.start = 0.46
    }


    function arrangeColumns() {

      let series = chart.series.getIndex(0);
  
      let w = 1 - xAxis.renderer.cellStartLocation - (1 - xAxis.renderer.cellEndLocation);
      if (series.dataItems.length > 1) {
          let x0 = xAxis.getX(series.dataItems.getIndex(0), "categoryX");
          let x1 = xAxis.getX(series.dataItems.getIndex(1), "categoryX");
          let delta = ((x1 - x0) / chart.series.length) * w;
          if (am4core.isNumber(delta)) {
              let middle = chart.series.length / 2;
  
              let newIndex = 0;
              chart.series.each(function(series) {
                  if (!series.isHidden && !series.isHiding) {
                      series.dummyData = newIndex;
                      newIndex++;
                  }
                  else {
                      series.dummyData = chart.series.indexOf(series);
                  }
              })
              let visibleCount = newIndex;
              let newMiddle = visibleCount / 2;
  
              chart.series.each(function(series) {
                  let trueIndex = chart.series.indexOf(series);
                  let newIndex = series.dummyData;
  
                  let dx = (newIndex - trueIndex + middle - newMiddle) * delta
  
                  series.animate({ property: "dx", to: dx }, series.interpolationDuration, series.interpolationEasing);
                  series.bulletsContainer.animate({ property: "dx", to: dx }, series.interpolationDuration, series.interpolationEasing);
              })
          }
      }
    }
  }


  sortedBarChart(id, data){
    am4core.useTheme(am4themes_material);
    am4core.useTheme(am4themes_animated);
    let chart = am4core.create( id, am4charts.XYChart);
    chart.padding(0, 50, 0, 20);
    let categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.dataFields.category = "DS_PROJ";
    categoryAxis.renderer.minGridDistance = 5;
    categoryAxis.renderer.inversed = true;
    categoryAxis.renderer.grid.template.disabled = true;
    categoryAxis.renderer.cellStartLocation = 0.1;
    categoryAxis.renderer.cellEndLocation = 0.9;
    let valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 10;


    
    let cellSize = 30;
      chart.events.on("datavalidated", function(ev) {
      let chart = ev.target;
      let categoryAxis = chart.yAxes.getIndex(0);
      let adjustHeight = chart.data.length * cellSize - categoryAxis.pixelHeight;
      let targetHeight = chart.pixelHeight + adjustHeight;
      chart.svgContainer.htmlElement.style.height = targetHeight + "px";
    });



    chart.scrollbarY = new am4core.Scrollbar();
    chart.scrollbarY.minHeight = 20;
    chart.padding(15,10,15,10)

    let series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.categoryY = "DS_PROJ";
    series.dataFields.valueX = "VL_CTRC";
    series.columns.template.strokeOpacity = 0;
    series.columns.template.column.cornerRadiusBottomRight = 5;
    series.columns.template.column.cornerRadiusTopRight = 5;
    

    var columnTemplate = series.columns.template;
    columnTemplate.tooltipText = "{categoryY}: [bold]{valueX}[/]";
    columnTemplate.strokeOpacity = 0;
    // columnTemplate.fill = am4core.color("green");


    let labelBullet = series.bullets.push(new am4charts.LabelBullet())
    labelBullet.label.horizontalCenter = "left";
    labelBullet.label.dx = 10;
    labelBullet.label.text = "{values.valueX.workingValue}";
    labelBullet.locationX = 0;
    labelBullet.label.marginTop= 4;
    labelBullet.label.properties.width = innerWidth;

    categoryAxis.sortBySeries = series;
    chart.data = data;
  }

  disposeCharts(){
    am4core.disposeAllCharts()
  }
 
}
