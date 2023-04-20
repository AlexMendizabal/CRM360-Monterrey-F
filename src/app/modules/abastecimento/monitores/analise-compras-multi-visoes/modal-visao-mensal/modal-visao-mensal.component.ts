import { Component, Input, OnInit } from '@angular/core';

import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

import { AbastecimentoAnaliseComprasMultiVisoesChartService } from '../chart.service';

@Component({
  selector: 'abastecimento-analise-compras-multi-visoes-modal-visao-mensal',
  templateUrl: './modal-visao-mensal.component.html',
  styleUrls: ['./modal-visao-mensal.component.scss']
})
export class AbastecimentoMonitoresAnaliseComprasMultiVisoesModalVisaoMensalComponent implements OnInit {
  @Input() item: any;

  loading: boolean = false;
  openRegistrosSelecionadosBool: boolean = false;

  chart: any;
  dataRegistros: any;
  dataEntrada = [{
    "tipoEntrada": "Industrialização",
    "ton": 501.9
  }, {
    "tipoEntrada": "Manual",
    "ton": 301.9
  }, {
    "tipoEntrada": "Nota fiscal",
    "ton": 201.1
  }, {
    "tipoEntrada": "Transferência",
    "ton": 165.8
  }];

  dataSaida = [{
    "tipoSaida": "Industrialização",
    "ton": 200.9
  }, {
    "tipoSaida": "Manual",
    "ton": 301.9
  }, {
    "tipoSaida": "Nota fiscal",
    "ton": 400.1
  }, {
    "tipoSaida": "Transferência",
    "ton": 165.8
  }];

  dataComparativoMensal = [{
    "mes": "01/21",
    "entrada": 501.9,
    "saida": 250,
    "perdas": 199
  }, {
    "mes": "02/21",
    "entrada": 301.9,
    "saida": 222,
    "perdas": 251
  }, {
    "mes": "03/21",
    "entrada": 201.1,
    "saida": 170,
    "perdas": 199
  }, {
    "mes": "04/21",
    "entrada": 165.8,
    "saida": 122,
    "perdas": 90
  }, {
    "mes": "04/21",
    "entrada": 139.9,
    "saida": 99,
    "perdas": 252
  }, {
    "mes": "05/21",
    "entrada": 128.3,
    "saida": 85,
    "perdas": 84
  }, {
    "mes": "06/12",
    "entrada": 99,
    "saida": 93,
    "perdas": 142
  }, {
    "mes": "07/21",
    "entrada": 60,
    "saida": 50,
    "perdas": 55
  }, {
    "mes": "08/21",
    "entrada": 50,
    "saida": 42,
    "perdas": 25
  }];

  constructor(
    private chartService: AbastecimentoAnaliseComprasMultiVisoesChartService,
    private pnotifyService: PNotifyService,
  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.loading = true;
    }, 1000);

    this.dataRegistros = this.item;

    this.makeChartPie();
    this.makeChartColumns();
  }

  makeChartPie(): void {
    this.chartService.pieChart(this.dataEntrada, "chartdiv-entradas", "ton", "tipoEntrada")
    this.chartService.pieChart(this.dataSaida, "chartdiv-saidas", "ton", "tipoSaida")
  }

  makeChartColumns(): void {
    this.chartService.tripleColumnsChart(this.dataComparativoMensal, "chart-comparativo-mensal", "mes", "Meses", "entrada", "Entrada", "saida", "Saída", "perdas", "Perdas")
  }

  openRegistrosSelecionados(): void {
    this.openRegistrosSelecionadosBool = !this.openRegistrosSelecionadosBool;
  }

  excelExport(): void {
    this.pnotifyService.success("Exportado com sucesso");
  }

}
