import { DateService } from './../../../../../../../shared/services/core/date.service';
import { JsonResponse } from 'src/app/models/json-response';
import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { formatNumber } from '@angular/common';

import { forkJoin, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

// Services
import { PdfService } from 'src/app/shared/services/core/pdf.service';
import { WindowService } from 'src/app/shared/services/core/window.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

import { ComercialCicloVendasCotacoesService } from '../../../cotacoes.service';

import { ICotacao } from '../../models/cotacao';

@Component({
  selector: 'comercial-ciclo-vendas-cotacoes-lista-templates-button-imprimir-separacao',
  templateUrl: './button-imprimir-separacao.component.html',
  styleUrls: ['./button-imprimir-separacao.component.scss'],
  providers: [WindowService, CurrencyPipe],
})
export class ComercialCicloVendasCotacoesListaTemplatesButtonImprimirSeparacaoComponent
  implements OnInit {
  @Output('loading') loading: EventEmitter<boolean> = new EventEmitter();
  @Input('cotacao') cotacao: ICotacao;

  dados: Array<any> = [];
  dadosCotacao: Array<any> = [];
  materiais: Array<any> = [];
  data: Date = new Date();

  images = {
    leftLogo: null,
    rightLogo: null,
    instagramLogo: null,
    facebookLogo: null,
    linkedinLogo: null,
  };

  constructor(
    private pdfService: PdfService,
    private currencyPipe: CurrencyPipe,
    private windowService: WindowService,
    private pnotifyService: PNotifyService,
    private cotacoesService: ComercialCicloVendasCotacoesService,
    private dateService: DateService,
  ) {}

  ngOnInit(): void {}

  onImprimir(): void {   
    this.loading.emit(true);
    this.setDocumentConfig();
  }

  setDocumentConfig(): any {
    // this.setDocumentImages();
    this.getDataDocument();
  }

  getDataDocument() {
    const milliseconds = new Date().getTime();

    this.cotacoesService
      .getImprimirSeparacao(this.cotacao.nrPedido, this.cotacao.codEmpresa)
      .pipe(
        finalize(() => {
          setTimeout(() => {
            this.pdfService.generatePdf(this.getDocument(), `${this.cotacao['nrPedido']}_${milliseconds}`);
            this.loading.emit(false);
          }, 1000);
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.hasOwnProperty('success') && response.success === true) {
            this.dados = response.data;
            this.dadosCotacao = this.dados['dados'];
            this.materiais = this.dados['materiais'];
          } else if (
            response.hasOwnProperty('success') &&
            response.success === false &&
            response.hasOwnProperty('mensagem') &&
            response.mensagem !== null
          ) {
            this.pnotifyService.error(response.mensagem);
          } else {
            this.pnotifyService.notice('Nenhuma informação encontrada');
          }
        },
        error: (error: any) => {
          if (error.error.hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
      });
  }


  getDocument(): any {
    return {
      content: [
        this.getDocumentHeader(),
        {
          text:' ',
          height: [200],
        },
        {
          text: `Pedido Nr.: ${formatNumber(this.dadosCotacao['nrPedido'], 'pt-BR', '0.0')}   Data Entrega: ${this.formatWithSlashes(this.dadosCotacao['dataEntrega'])}`,
          alignment: 'right',
          style: 'title',
        },
        {
          style: 'title',
          table :{
            widths: ['*'],
            body:[
              [
                {
                  text: `Vendedor:   ${this.dadosCotacao['codVendedor']}   ${this.dadosCotacao['nomeVendedor']}`,
                }
              ]
            ]
          },
          layout: {
            paddingTop: function(i, node) { return 5; },
            paddingBottom: function(i, node) { return 5; }
          }
        },
        {
          text: `${this.dadosCotacao['razaoSocial']}`,
          alignment: 'left',
          style: 'dados',
        },
        {
          text:' ',
          fontSize: 5,
        },
        {
          text: `${this.dadosCotacao['endereco']}, ${this.dadosCotacao['bairro']}`,
          alignment: 'left',
          style: 'dados',
        },
        {
          text: `${this.transformNumberToCEP(this.dadosCotacao['cep'])}, ${this.dadosCotacao['cidade']}, ${this.dadosCotacao['uf']}       Forma de Pagamento: ${this.dadosCotacao['formaPagamento']}`,
          alignment: 'left',
          style: 'dados',
          
        },
        {
          text:' ',
          fontSize: 5,
        },
        {
          text: `Região de Entrega: ${this.dadosCotacao['regiaoEntrega']}      Descarga: ${this.dadosCotacao['descarga']} - ${this.dadosCotacao['tipoDescarga']} - Horário Máximo: ${this.dadosCotacao['horarioMaximo']}`,
          alignment: 'left',
          style: 'dados',
        },
        {
          text: `Veiculo: ${this.dadosCotacao['tipoVeiculo']}      Dias para Entrega: ${this.dadosCotacao['diasEntrega']}`,
          style: 'dados',
          alignment: 'left',
        },
        {
          text:' ',
          height: [100],
        },
        {
          text: `Materiais da Proposta`,
          style: 'title',
          alignment: 'left',
        },
        {
          text:' ',
          fontSize: 5,
        },
        {
          style: 'tableExample',
          table: {
            widths: [
              '*',
              'auto',
              'auto',
              'auto',
              'auto',
              'auto',
              'auto',
              'auto',
              // 'auto',
              // 'auto',
            ],
            headerRows: 1,
            body: this.getMateriaisCotacao(),
          },
          layout: 'lightHorizontalLines',
        },
        {
          table :{
            widths: ['*'],
            body:[
              [
                {
                  text: `Observações:`,
                  style: 'dados',
                  alignment: 'left',
                }
              ],
              [
                {
                  text: `${this.dadosCotacao['observacao']}\n`,
                  alignment: 'left',
                  fontSize: 10
                }
              ],
            ]
          },
          layout: {
            hLineColor: function(i, node) {
                return (i === 0 || i === node.table.body.length) ? 'black' : 'white';
            },
            vLineColor: function(i, node) {
                return (i === 0 || i === node.table.widths.length) ? 'black' : 'white';
            },
            paddingLeft: function(i, node) { return 10; },
            paddingRight: function(i, node) { return 10; },
        }
        },

        
      ],
      styles: {
        title: {
          fontSize: 12,
          margin: [0, 0, 0, 5],
          bold: true,
        },
        dados:{
          fontSize: 10,
          margin: [0, 0, 0, 5],
          bold: true,
        },
        divider: {
          margin: [0, 5],
        },
        infoCotacao: {
          fontSize: 8,
          margin: [40, 50, 10, 0],
        },
        tableExample: {
          color: 'black',
          fontSize: 8,
          margin: [0, 0, 0, 5],
        },
        tableHeader: {
          bold: true,
          margin: [0, 0, 0, 5],
        },
        tableRow: {
          bold: false,
          margin: [0, 5, 0, 5],
        },
        tableTotal: {
          bold: true,
          margin: [0, 5, 0, 5],
        },
      },
    };
  }

  
  getImagePath(imagePath: string): Promise<any> {
    return this.windowService.getBase64ImageFromUrl(
      `${this.windowService.getHost()}/assets/images/impressoes/${imagePath}`
    );
  }

  formatWithSlashes(stringDate: any, type?: string): string {
    const dateSplit = stringDate.split('-');
    let date: string;
    
    if(type == 'br'){
      date = `${dateSplit[0]}/${dateSplit[1]}/${dateSplit[2]}`;
    }else{
      date = `${dateSplit[2]}/${dateSplit[1]}/${dateSplit[0]}`;
    }

    return date;
  }

  getDocumentHeader(): any {
    return {
      table: {
        widths: ['auto', '*', 'auto'],
        body: [
          [
            {
              text: `Pedido de Separação - ${this.dadosCotacao['nomeEmpresa']}`,
              style: 'title',
              alignment: 'left',
              
            },
            [],
            {
              text: `${this.formatWithSlashes(this.dateService.convertToUrlDate(this.dateService.getToday()), 'br')} - ${this.dateService.getHourMinute(this.data)}`,
              style: 'tableExample',
              alignment: 'right',
            },
          ],
        ],
      },
      layout: 'noBorders',
    };
  }

  getMateriaisCotacao(): any {
    let body = [
      [
        { text: 'CÓD.', style: 'tableHeader', alignment: 'center' },
        { text: 'MATERIAL', style: 'tableHeader',alignment: 'left' },
        { text: 'COMPLEMENTO', style: 'tableHeader', alignment: 'center' },
        { text: 'QTDE', style: 'tableHeader', alignment: 'center' },
        { text: 'COMPRIMENTO', style: 'tableHeader', alignment: 'center' },
        // { text: 'PESO (TON)', style: 'tableHeader', alignment: 'center' },
        { text: 'UNIDADE', style: 'tableHeader', alignment: 'center' },
        { text: 'TIPO MATERIAL', style: 'tableHeader', alignment: 'center' },
        { text: 'ENDEREÇAMENTO', style: 'tableHeader', alignment: 'center' },
        // { text: 'OBSERVAÇÃO', style: 'tableHeader', alignment: 'center' },
      ],
    ];

    for (let i = 0; i < this.materiais.length; i++) {
      let rowMaterial = [];
      
      for (const key in this.materiais[i]) {
        rowMaterial.push({
          text: this.columnText(key, this.materiais[i][key]),
          style: 'tableRow',
          alignment: key === 'material' ? 'left' : 'center',
        });
      }

      body.push(rowMaterial);
    }

    return body;
  }

  // getParcelas(): any {
  //   let parcela = [];

  //   this.parcelas.map(e => {
  //     parcela.push({
  //       text: `${e.nrParcela} - ${e.dataParcela}`,
  //       margin: [10, 0, 0, 5],
  //       fontSize: 9,
  //     },);
  //   });

  //   return parcela;
  // }

  transformNumberToCEP(valor: any): string {
    const resto = 8 - String(valor).length;
    valor = '0'.repeat(resto > 0 ? resto : 0) + valor;

    valor = valor.toString();

    let cep = valor.replace(
      /(\d{5})(\d{3})/g,
      '$1-$2'
    );
    return cep;
  }

  transformNumberToCPFCPNJ(valor: any): string {
    valor = valor.toString();

    let CpfCnpj = '';
    
    if(valor.length == 11) {
      CpfCnpj = valor.replace(
        /(\d{3})(\d{3})(\d{3})(\d{2})/g,
        '$1.$2.$3-$4'
      );
    } else if(valor.length == 14) {
      CpfCnpj = valor.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g,
        '$1.$2.$3/$4-$5'
      );
    } else {
      return valor;
    }

    return CpfCnpj;
  }

  columnText(key: string, string: any): string {
    switch (key) {
      case 'codMaterial':
        string = formatNumber(string, 'pt-BR', '0.0');
        break;
      case 'qtdeItem':
        string = formatNumber(string, 'pt-BR', '1.3-3');
        break;
      // case 'pesoReal':
      //   string = formatNumber(string, 'pt-BR', '1.3-3');
      //   break;
    }

    return string;
  }
}
