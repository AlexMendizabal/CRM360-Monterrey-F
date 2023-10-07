import { JsonResponse } from 'src/app/models/json-response';
import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { formatNumber } from '@angular/common';

import { forkJoin, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

// Services
import { PdfService } from 'src/app/shared/services/core/pdf.service';
import { WindowService } from 'src/app/shared/services/core/window.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

import { ComercialCicloVendasAutorizacionesService } from '../../../autorizaciones.service';

import { ICotacao } from '../../models/cotacao';
import { DateService } from 'src/app/shared/services/core/date.service';

@Component({
  selector: 'comercial-ciclo-vendas-cotacoes-lista-templates-button-imprimir',
  templateUrl: './button-imprimir.component.html',
  styleUrls: ['./button-imprimir.component.scss'],
  providers: [WindowService, CurrencyPipe],
})
export class ComercialCicloVendasCotacoesListaTemplatesButtonImprimirComponent
  implements OnInit {
  @Output('loading') loading: EventEmitter<boolean> = new EventEmitter();
  @Input('cotacao') cotacao: ICotacao;

  @Input('imprimirPdf') imprimirPdf: boolean;
  @Output('resetImprimir') resetImprimir: EventEmitter<boolean> = new EventEmitter();
  @Output('pdfData') pdfData: EventEmitter<any> = new EventEmitter();


  dados: Array<any> = [];
  dadosManetoni: Array<any> = [];
  pedido: Array<any> = [];
  contatos: Array<any> = [];
  enderecos: Array<any> = [];
  materiais: Array<any> = [];
  parcelas: Array<any> = [];
  dadosVendedor: Array<any> = [];

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
    private cotacoesService: ComercialCicloVendasAutorizacionesService,
    private dateService: DateService,
  ) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges) {

      if(this.imprimirPdf && changes.imprimirPdf.currentValue) {

        this.onImprimir();
      } else {
          this.imprimirPdf = false;
      }
  }

  onImprimir(): void {
    this.loading.emit(true);
    this.setDocumentConfig();
  }

  setDocumentConfig(): any {
    this.setDocumentImages();
    this.getDataDocument();
  }

  getDataDocument() {
    const milliseconds = new Date().getTime();

    this.cotacoesService
      .getImprimirCotacao(this.cotacao.nrPedido, this.cotacao.codEmpresa)
      .pipe(
        finalize(() => {
          setTimeout(() => {
            if(this.imprimirPdf) {
              let doc;
              new Promise((resolve) => {

                resolve(doc = this.pdfService.generateEmailPdf(this.getDocument()));

              }).then(() => {
                doc.getBase64((data) => {

                doc = data;
                this.pdfData.emit(doc);

                });
                this.loading.emit(false);
                this.resetImprimir.emit(false);

              }).catch(console.error);

            } else {
              this.pdfService.generatePdf(this.getDocument(), `${this.cotacao['nrPedido']}_${milliseconds}`);
              this.loading.emit(false);
            }
          }, 1000);
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.hasOwnProperty('success') && response.success === true) {
            this.dados = response.data;
            this.dadosManetoni = this.dados['dadosManetoni'];
            this.pedido = this.dados['pedido'];
            this.contatos = this.dados['contatos'];
            this.enderecos = this.dados['enderecos'];
            this.materiais = this.dados['materiais'];
            this.parcelas = this.dados['parcelas'];
            this.dadosVendedor = this.dados['dadosVendedor'];
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

  setDocumentImages(): any {
    this.getDocumentImages().subscribe((base64Url: any) => {
      this.images.leftLogo = base64Url[0];
      this.images.rightLogo = base64Url[1];
      this.images.instagramLogo = base64Url[2];
      this.images.facebookLogo = base64Url[3];
      this.images.linkedinLogo = base64Url[4];
    });
  }

  getDocumentImages(): Observable<any> {
    const leftLogo = this.getImagePath('clientes/manetoni.png');
    const rightLogo = this.getImagePath('clientes/manetoni-cercas.png');
    const instagramLogo = this.getImagePath('social/instagram.png');
    const facebookLogo = this.getImagePath('social/facebook.png');
    const linkedinLogo = this.getImagePath('social/linkedin.png');

    return forkJoin([
      leftLogo,
      rightLogo,
      instagramLogo,
      facebookLogo,
      linkedinLogo,
    ]);
  }

  getDocument(): any {
    return {
      content: [
        this.getDocumentHeader(),
        {
          style: 'divider',
          table: {
            widths: ['*'],
            headerRows: 1,
            body: [[{ text: '' }], [{ text: '' }]],
          },
          layout: 'lightHorizontalLines',
        },
        {
          columns: [
            [
              { text: 'DADOS DO CLIENTE', style: 'title' },
              {
                columns: [
                  { text: `Cód.: ${formatNumber(this.pedido[0]['codCliente'], 'pt-BR', '0.0')}`, width: '30%', margin: [0, 2] },
                  {
                    text: `Nome: ${this.pedido[0]['razaoSocial']}`,
                    width: '70%',
                    alignment: 'right',
                    margin: [0, 2],
                  },
                ],
              },
              {
                columns: [
                  { text: `CPF/CNPJ: ${this.transformNumberToCPFCPNJ(this.pedido[0]['cpf_cnpj'])}` },
                  {
                  text: `IE/RG: ${this.pedido[0]['rg_ie'] ? this.pedido[0]['rg_ie'] : 'Isento' }`,
                    alignment: 'right',
                  },
                ],
              },
              {
                style: 'divider',
                table: {
                  widths: ['*'],
                  headerRows: 1,
                  body: [[{ text: '' }], [{ text: '' }]],
                },
                layout: 'lightHorizontalLines',
              },
              { text: 'CONTATO', style: 'title' },
              {
                text: `Nome: ${this.contatos[0]['nomeContato'] ? this.contatos[0]['nomeContato'] : 'Não cadastrado'}`,
              },
              {
                text: `Telefone: ${this.contatos[0]['telefone'] ? this.contatos[0]['telefone'] : 'Não cadastrado'}`,
                margin: [0, 2],
              },
              {
                text: `E-mail: ${this.contatos[0]['email'] ? this.contatos[0]['email'] : 'Não cadastrado'}`,
              },
              {
                style: 'divider',
                table: {
                  widths: ['*'],
                  headerRows: 1,
                  body: [[{ text: '' }], [{ text: '' }]],
                },
                layout: 'lightHorizontalLines',
              },
            ],
            {
              style: 'infoCotacao',
              width: 200,
              table: {
                widths: ['auto', 'auto'],
                headerRows: 2,
                body: [
                  [
                    {
                      text: 'COTAÇÃO',
                      colSpan: 2,
                      bold: true,
                      alignment: 'center',
                      fontSize: 12,
                      margin: [0, 3, 0, 3],
                    },
                    {},

                  ],
                  [
                    { text: 'NÚM.', bold: true, alignment: 'center' },
                    {
                      text: formatNumber(this.pedido[0]['nrPedido'], 'pt-BR', '0.0'),
                      bold: true,
                      alignment: 'center',
                      fontSize: 9,
                    },


                  ],
                  [
                    { text: 'DATA', bold: true, alignment: 'center' },
                    {
                      text: `${this.formatWithSlashes(this.dateService.convertToUrlDate(this.dateService.getToday()), 'br')} - ${this.dateService.getHourMinute(this.data)}`,
                      bold: true,
                      alignment: 'center',
                      fontSize: 9,
                    },

                  ],
                  [
                    { text: 'VALID.', bold: true, alignment: 'center' },
                    {
                      text: `${this.pedido[0]['dataValidade'] ? this.convertDate(this.pedido[0]['dataValidade']) : ''}`,
                      bold: true,
                      alignment: 'center',
                      fontSize: 9,
                    },

                  ],
                ],
              },
            },
          ],
        },
        { text: 'ENDEREÇOS', style: 'title' },
        this.getEnderecos(),
        {
          style: 'divider',
          table: {
            widths: ['*'],
            headerRows: 1,
            body: [[{ text: '' }], [{ text: '' }]],
          },
          layout: 'lightHorizontalLines',
        },
         { text: 'DADOS DO VENDEDOR', style: 'title' },
         {
           text: `Proposta gerada por: ${this.dadosVendedor[0]['nome']}`,
           fontSize: 9,
           margin: [0, 0, 0, 4],
         },
         {
           text: `Telefone: ${this.dadosVendedor[0]['telefone'] ? this.dadosVendedor[0]['telefone'] : 'Não cadastrado'}`,
           fontSize: 9,
           margin: [0, 0, 0, 4],
         },
         {
           text: `WhatsApp: ${this.dadosVendedor[0]['whatsApp']? this.dadosVendedor[0]['whatsApp'] :'Não cadastrado'}`,
           fontSize: 9,
           margin: [0, 0, 0, 4],
         },
         { text:` E-mail: ${this.dadosVendedor[0]['email'] ? this.dadosVendedor[0]['email'] : 'Não cadastrado'}`, fontSize: 9 },
         {
           style: 'divider',
           table: {
             widths: ['*'],
             headerRows: 1,
             body: [[{ text: '' }], [{ text: '' }]],
           },
           layout: 'lightHorizontalLines',
         },
        { text: 'DADOS DA PROPOSTA', style: 'title' },
        {
          style: 'tableExample',
          table: {
            widths: [
              'auto',
              'auto',
              'auto',
              'auto',
              'auto',
              'auto',
              'auto',
              'auto',
              'auto',
              'auto',
              'auto',
            ],
            headerRows: 1,
            body: this.getMateriaisCotacao(),
          },
          layout: 'lightHorizontalLines',
        },
        {
          style: 'divider',
          table: {
            widths: ['*'],
            headerRows: 1,
            body: [[{ text: '' }], [{ text: '' }]],
          },
          layout: 'lightHorizontalLines',
        },
        {
          table: {
            widths: ['*'],
            headerRows: 1,
            body: [
              [
                {
                  columns: [
                    [
                      {
                        text: `${this.parcelas[0]['qtdeParcelas'] ? this.parcelas[0]['qtdeParcelas'] + ' -' : '' } ${this.parcelas[0]['formaPagamento']}'`,
                        margin: [0, 0, 0, 10],
                        fontSize: 9,
                      },
                      this.getParcelas(),
                    ],
                  ],
                  margin: 10,
                },
              ],
            ],
          },
        },
        {
          columns: [
            {
              text: `PRAZO DE ENTREGA: ${(this.pedido[0]['prazoEntrega']).toUpperCase()}`,
              margin: [0, 10, 0, 0],
              fontSize: 9,
            },
            {
              text: `FRETE POR CONTA DO ${(this.pedido[0]['fretePorConta']).toUpperCase()}`,
              margin: [0, 10, 0, 0],
              alignment: 'right',
              fontSize: 9,
            },
          ],
        },
        {
          style: 'divider',
          table: {
            widths: ['*'],
            headerRows: 1,
            body: [[{ text: '' }], [{ text: '' }]],
          },
          layout: 'lightHorizontalLines',
        },
        { text: 'OBSERVAÇÕES', style: 'title' },
        {
          text: `${this.pedido[0]['observacao'] ? this.pedido[0]['observacao'] : "Nada informado"}`,
          fontSize: 9,
          margin: [0, 0, 0, 4],
        }
      ],
      styles: {
        title: {
          fontSize: 12,
          margin: [0, 0, 0, 5],
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

  getDocumentHeader(): any {
    return {
      table: {
        widths: ['auto', '*', 'auto'],
        body: [
          [
            {
              image: this.images.leftLogo,
              width: 99,
              margin: [0, 10, 10, 0],
            },
            [
              {
                text: this.dadosManetoni[0]['razaoSocial'],
                margin: [0, 0, 0, 3],
                fontSize: 12,
              },
              {
                text: this.transformNumberToCPFCPNJ(this.dadosManetoni[0]['cnpj']),
                bold: true,
                margin: [0, 0, 0, 2],
                fontSize: 11,
              },
              {
                text: this.dadosManetoni[0]['logradouro'],
                margin: [0, 0, 0, 2],
                fontSize: 11,
              },
              {
                text: `${this.dadosManetoni[0]['cidade']}/${this.dadosManetoni[0]['uf']} - CEP: ${this.transformNumberToCEP(this.dadosManetoni[0]['cep'])}`,
                margin: [0, 0, 0, 2],
                fontSize: 11,
              },
              {
                text: `${this.dadosManetoni[0]['site']} / ${this.dadosManetoni[0]['portal']} `,
                margin: [0, 0, 0, 2],
                fontSize: 11,
                link: this.dadosManetoni[0]['site'],
              },
              {
                table: {
                  widths: ['auto', 'auto', 'auto'],
                  body: [
                    [
                      {
                        columns: [
                          {
                            image: this.images.instagramLogo,
                            width: 14,
                            margin: [0, 0, 0, 0],
                            link: this.dadosManetoni[0]['instagram'],
                          },
                          {
                            text: '@manetonidistribuidora',
                            fontSize: 7,
                            margin: [3, 3, 3, 0],
                            link: this.dadosManetoni[0]['instagram'],
                          },
                        ],
                      },
                      {
                        columns: [
                          {
                            image: this.images.facebookLogo,
                            width: 14,
                            margin: [0, 0, 0, 0],
                            link: this.dadosManetoni[0]['facebook'],
                          },
                          {
                            text: '/manetonidistribuidora',
                            fontSize: 7,
                            margin: [3, 3, 3, 0],
                            link: this.dadosManetoni[0]['facebook'],
                          },
                        ],
                      },
                      {
                        columns: [
                          {
                            image: this.images.linkedinLogo,
                            width: 14,
                            margin: [0, 0, 0, 0],
                            link: this.dadosManetoni[0]['linkedIn'],
                          },
                          {
                            text: '/company/grupo-manetoni/',
                            fontSize: 7,
                            margin: [3, 3, 3, 0],
                            link: this.dadosManetoni[0]['linkedIn'],
                          },
                        ],
                      },
                    ],
                  ],
                },
                layout: 'noBorders',
              },
            ],
            {
              image: this.images.rightLogo,
              width: 99,
              margin: [10, 10, 0, 0],
            },
          ],
        ],
      },
      layout: 'noBorders',
    };
  }

  getEnderecos(): any {
    let enderecos = [];

    this.enderecos.map(e => {
      enderecos.push( {
        text: `${e.tipoEndereco}: ${e.endereco} - ${e.bairro} - ${e.cidade}/${e.uf} - CEP: ${this.transformNumberToCEP(e.cep)}`,
        fontSize: 10,
        margin: [0, 0, 0, 4],
      },);
    });

    return enderecos;
  }

  getMateriaisCotacao(): any {
    let body = [
      [
        { text: 'CÓD.', style: 'tableHeader', alignment: 'center' },
        { text: 'MATERIAL', style: 'tableHeader',alignment: 'left' },
        { text: 'COMPLEMENTO', style: 'tableHeader', alignment: 'center' },
        { text: 'QTD (UN)', style: 'tableHeader', alignment: 'center' },
        { text: 'PESO (TON)', style: 'tableHeader', alignment: 'center' },
        { text: 'PREÇO BARRA', style: 'tableHeader', alignment: 'center' },
        { text: 'PREÇO UNIT', style: 'tableHeader', alignment: 'center' },
        { text: 'IPI', style: 'tableHeader', alignment: 'center' },
        { text: 'ICMS', style: 'tableHeader', alignment: 'center' },
        { text: 'ST', style: 'tableHeader', alignment: 'center' },
        { text: 'VALOR TOTAL', style: 'tableHeader', alignment: 'center' },
      ],
    ];

    let isLastRow: boolean;

    for (let i = 0; i < this.materiais.length; i++) {
      let rowMaterial = [];
      isLastRow = i + 1 === this.materiais.length ? true : false;

      for (const key in this.materiais[i]) {
        rowMaterial.push({
          text: this.columnText(key, this.materiais[i][key],),
          style: !isLastRow ? 'tableRow' : 'tableTotal',
          alignment: key === 'material' ? 'left' : 'center',
        });
        body[i][3].text = '';
        body[i][3].style = '';
        body[i][3].alignment = '';
      }

      body.push(rowMaterial);
    }

    return body;
  }

  getParcelas(): any {
    let parcela = [];

    this.parcelas.map(e => {
      parcela.push({
        text: `${e.nrParcela} - ${e.dataParcela}`,
        margin: [10, 0, 0, 5],
        fontSize: 9,
      },);
    });

    return parcela;
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

  convertDate(valor: any): string{
    const stringSplit = valor.split("-", 3);

    stringSplit[2] = stringSplit[2].slice(0,2);

    let res: string;

    res = `${stringSplit[2]}/${stringSplit[1]}/${stringSplit[0]}`;

    //2021-05-28 03:00:00.000
    return res;
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
      // case 'codMaterial':
      //   string = formatNumber(string, 'pt-BR', '0.0');
      //   break;
      case 'pesoTonelada':
        string = formatNumber(string, 'pt-BR', '1.3-3');
        break;
      case 'qtdePecas':
        if(string != null){
          string = formatNumber(string, 'pt-BR', '1.3-3');
        };
        break;
      case 'precoUnitario':
        string = this.currencyPipe.transform(string, 'BRL', 'symbol', '1.2-2');
        break;
      case 'precoBarra':
          string = this.currencyPipe.transform(string, 'BRL', 'symbol', '1.2-2');
          break;
      case 'valorSt':
        string = this.currencyPipe.transform(string, 'BRL', 'symbol', '1.2-2');
        break;
      case 'valorIpi':
        string = this.currencyPipe.transform(string, 'BRL', 'symbol', '1.2-2');
        break;
      case 'aliquotaIcms':
        if(string != null){
        string = `${formatNumber(string, 'pt-BR', '1.0-0')}%`;
        }
        break;
      case 'valorTotal':
        string = this.currencyPipe.transform(string, 'BRL', 'symbol', '1.2-2');
        break;
    }

    return string;
  }
}
