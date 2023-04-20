// angular
import { Input, Output, OnChanges } from '@angular/core';
import { SimpleChanges, EventEmitter } from '@angular/core';
import { Component } from '@angular/core';

// service
import { LogisticaDashboardsChartService } from '../../services/chart.service';

@Component({
  selector: 'logistica-dashboards-frete-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})
export class LogisticaDashboardsAnaliseFretePieChartComponent {

  @Input() data: Array<any> = [];
  @Input() selectedKey: string;
  @Input() graphId: string;
  @Input() show: boolean = false;
  @Input() empty: boolean = false;
  @Input() loading: boolean = false;
  @Input() autoResize: boolean = true;
  @Input() labels = [];

  nome: string = '';
  descricao: string = '';

  @Output() size: EventEmitter<string> = new EventEmitter();

  chartInstance;
  maximized: boolean = false;

  constructor(
    private chartService: LogisticaDashboardsChartService
  )
  {
    if(this.data.length != 0){
      this.onRender(this.selectedKey);
    }
  }

  ngOnChanges(changes: SimpleChanges){

    if(!changes?.data?.currentValue){
      return
    }

    if(Object.keys(changes?.data?.currentValue)?.length != 0){
      this.onRender(this.selectedKey);
    }
  }


  onRender(sigla) {

    try{

      if(this.chartInstance){
        this.chartInstance.dispose();
      }

      const [f] = this.labels.filter(el => el.sigla == sigla)

      this.nome = f?.nome;
      this.descricao = f?.descricao;

      this.chartInstance = this.chartService.getInstance(this.graphId, 'PieChart3D');

      const _max = (Math.max(...this.data[sigla].map((e) => e?.valor ? e.valor : 0)));

      this.maximized = _max > 5000 ? true : false;
      this.maximized ? this.size.emit('col-12') : this.size.emit('col-6');

      this.chartService.pieChart(this.chartInstance, this.data[sigla], "categoria", "valor")

    }catch{}
  }

  onResize(){
    this.maximized = !this.maximized;
    this.maximized ? this.size.emit('col-12') : this.size.emit('col-6');
  }
}
