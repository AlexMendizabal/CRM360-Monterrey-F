import { Component, OnInit, Input, SimpleChanges, OnChanges, Output, EventEmitter } from '@angular/core';

import { LogisticaDashboardsChartService } from '../../services/chart.service';

@Component({
  selector: 'logistica-dashboards-frete-barh-chart',
  templateUrl: './barh-chart.component.html',
  styleUrls: ['./barh-chart.component.scss']
})
export class LogisticaDashboardsAnaliseFreteBarhChartComponent  implements OnChanges{

  @Input() data: Array<any> = [];
  @Input() selectedKey: string;
  @Input() graphId: string;
  @Input() show: boolean = false;
  @Input() empty: boolean = false;
  @Input() loading: boolean = false;
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

      this.chartInstance = this.chartService.getInstance(this.graphId);

      const [f] = this.labels.filter(el => el.sigla == sigla)

      this.nome = f?.nome;
      this.descricao = f?.descricao;

      const data = this.data[sigla].sort((a, b) => {

        if(a['valor'] === b['valor']){
          return 0
        }

        return a['valor'] > b['valor'] ? 1 : -1;

      })

      this.chartService.clusteredBarChart(this.chartInstance, data, "categoria", "valor", false);
    }catch{}
  }

  onResize(){
    this.maximized = !this.maximized;
    this.maximized ? this.size.emit('col-12') : this.size.emit('col-6');
  }

}
