// angular
import { Input, Output, OnChanges, TemplateRef } from '@angular/core';
import { SimpleChanges, EventEmitter } from '@angular/core';
import { Component } from '@angular/core';
import { BsDatepickerConfig, BsModalRef, BsModalService } from 'ngx-bootstrap';
import { LogisticaDashboardsChartService } from '../../services/chart.service';

// service

@Component({
  selector: 'logistica-dashboard-frete-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss']
})
export class LogisticaDashboardsAnaliseFreteLineChartComponent implements OnChanges{

  @Input() data: Array<any> = [];
  @Input() selectedKey: string;
  @Input() graphId: string;
  @Input() show: boolean = false;
  @Input() empty: boolean = false;
  @Input() loading: boolean = false;
  @Input() autoResize: boolean = false;
  @Input() labels = []

  nome: string = '';
  descricao: string = '';

  @Output() size: EventEmitter<string> = new EventEmitter();

  chartInstance;
  maximized: boolean = false;

  bsConfig: Partial<BsDatepickerConfig>;
  modalRef: BsModalRef;

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

    if(this.chartInstance){
      this.chartInstance.dispose();
    }

    const [f] = this.labels.filter(el => el.sigla == sigla)

    this.nome = f?.nome;
    this.descricao = f?.descricao;

    this.chartInstance = this.chartService.getInstance(this.graphId);

    const _max = (Math.max(...this.data[sigla].map((e) => e?.valor ? e.valor : 0)));

    if(this.autoResize){
      this.maximized = _max > 5000 ? true : false;
      this.maximized ? this.size.emit('col-12') : this.size.emit('col-6');
    }

    this.chartService.lineChart(this.chartInstance, this.data[sigla], "categoria", "valor")
    this.chartService.barV(this.chartInstance, "categoria", "media");
  }

  onResize(){
    this.maximized = !this.maximized;
    this.maximized ? this.size.emit('col-12') : this.size.emit('col-6');
  }

}
