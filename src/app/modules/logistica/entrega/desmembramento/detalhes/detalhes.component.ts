import { ConfirmModalService } from './../../../../../shared/modules/confirm-modal/confirm-modal.service';
import { event } from './../../../../admin/perfis/models/event';
import { LogisticaEntregaFusionService } from './../../services/fusion.service';
import { DateService } from 'src/app/shared/services/core/date.service';
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { finalize } from 'rxjs/operators';
import { LogisticaEntregaDesmembramentoService } from './../services/desmembramento.service';
import { PdfService } from 'src/app/shared/services/core/pdf.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { Component, OnInit, Output, EventEmitter, Input, OnDestroy } from '@angular/core';
import { Subscription, forkJoin } from 'rxjs';

@Component({
  selector: 'logistica-entrega-desmembramento-detalhes',
  templateUrl: './detalhes.component.html',
  styleUrls: ['./detalhes.component.scss']
})
export class LogisticaEntregaDesmembramentoDetalhesComponent implements OnInit, OnDestroy {

  @Input() pedidoSelecionado;

  @Output() close: EventEmitter<any> = new EventEmitter();
  @Output() reload: EventEmitter<any> = new EventEmitter();

  bsConfig: Partial<BsDatepickerConfig>;
  $activatedRouteSubscription: Subscription;
  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: false,
    border: false,
    small: true,
    hover: false,
    theme: {
      color: 'write',
    }
  };


  //LOADINGS
  loading = false;
  loadingProdutos: boolean;
  loadingPedidosAssociados:boolean;
  //VARIAVEIS
  produtos = [];
  quantidade: number = 1;
  produtosAssociados=[];
  pedidos = [];
  pedidosAssociados = []
  submoduloId: number;
  totalProdutos:number;

  countoValorNota: number;
  countoTotalPeso: number;
  countoTotalProdutos:number

  constructor(
    private pnotify: PNotifyService,
    private dateService: DateService,
    private localeService: BsLocaleService,
    private confirmModalService: ConfirmModalService,
    private pdfService: PdfService,
    private desmembramentoService: LogisticaEntregaDesmembramentoService,
    private fusionService: LogisticaEntregaFusionService,
  ) {
    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );
  }

  ngOnInit(): void {
    this.getProdutos();
    if(this.pedidoSelecionado.IN_DESM == 1){
      this.getPedidosAssociados({ID_REFE: this.pedidoSelecionado.ID_LOGI_FUSI_PEDI, IN_STAT: '1'})
    }
  }

  ngOnDestroy():void{
  }

  onClose(){
    this.close.emit(true);
  }


  onDownload(params?) {
    this.pnotify.notice('El documento PDF se generará pronto!')
    const romaneio = params['CD_ROMA'];
    this.pdfService.download('pedido-pdf', `ordenes- ${romaneio}`);
  }

  onPrint(){
    window.print();
  }

  getProdutos(){
    let params={
      ['ID_LOGI_FUSI_PEDI']:this.pedidoSelecionado.ID_LOGI_FUSI_PEDI
    }

    this.loadingProdutos = true;
    this.desmembramentoService
      .getProdutos(params)
      .pipe(
        finalize(() => {
          this.loadingProdutos = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.produtos = response.body['data'];
            this.totalProdutos = response.body['total'];

          } else {
            this.pnotify.notice("Ningún órdenes de venta situado")
          }
        },
        (error) => {
          this.pnotify.error();
        }
      )
  }

  onAddPedido(produtos) {

    // Verifica se o pedido já foi desmembrado, se foi, pega somente os materiais com saldo maior do que zero
    produtos = this.pedidoSelecionado?.IN_DESM == '1' ? produtos?.filter(el => el?.TT_SALD > 0): produtos;

    // Se não há produtos, finaliza a execução
    if(produtos.length == 0){
      this.pnotify.notice('el pedido no tiene saldo!')
      return;
    }

    // Cria uma cópia do objeto para evitar que exista alteração de valores no objeto pai
    let _produtos = JSON.parse(JSON.stringify(produtos))
    const peso = _produtos.reduce((acc, cur) => acc += cur['TT_PROD_PESO'], 0);

    // adiciona os novos produtos ao pedido
    this.pedidos.push({
      pedidoId: produtos[0].ID_LOGI_FUSI_PEDI,
      CD_PEDI: this.pedidoSelecionado.CD_PEDI,
      TT_PESO: peso,
      produtos:_produtos
    })

    _produtos.forEach(item => {

      let saldoPeso = item.TT_PROD_PESO;
      let saldoQuantidade = item.TT_PROD;

      // Calcula o saldo disponível
      this.produtos
        .filter(produto => (produto.CD_PROD == item.CD_PROD) && (produto.NR_SQNC == item.NR_SQNC))
        .map(produto => {

          const novoSaldoQuantidade = produto.TT_SALD - saldoQuantidade
          const novoSaldoPeso = produto.TT_SALD_PESO - saldoPeso

          if(novoSaldoQuantidade < 0 ){
            this.pnotify.notice(`La cantidad ingresada es mayor que el saldo actual`)
            produto['TT_SALD'] = novoSaldoQuantidade + item.TT_SALD
            produto['TT_SALD_PESO'] = novoSaldoPeso + item.TT_SALD_PESO
            item.TT_PROD = 0
            item.TT_PROD_PESO = 0
            item.TT_SALD = 0
            item.TT_SALD_PESO = 0
            return
          }
          produto['TT_SALD'] = novoSaldoQuantidade
          produto['TT_SALD_PESO'] = novoSaldoPeso
        })
    })

  }

  onDesmembrar(produtos){

    const _produtos:Array<any> = JSON.parse(JSON.stringify(produtos))

    // verifica se ha produto no pedido para desmembramento
    let saldo = _produtos.reduce((acc, cur) => acc += cur['TT_SALD'], 0);

    if(!saldo){
      this.pnotify.notice('el pedido no tiene saldo!')
      return;
    }

    const quantidade = this.quantidade

    _produtos.map(el => {

      el.TT_PESO_UNIT = el.TT_PROD_PESO / el.TT_PROD;

      if(quantidade == 1){
        el.TT_PROD = (el?.TT_SALD ?? el?.TT_PROD)/quantidade
        el.TT_PROD_PESO = (el?.TT_SALD_PESO ?? el?.TT_PROD_PESO)/quantidade
        return el
      }

      el.TT_PROD = Math.floor((el?.TT_SALD ?? el?.TT_PROD)/quantidade)
      el.TT_PROD_PESO = Math.floor((el?.TT_SALD_PESO ?? el?.TT_PROD_PESO)/quantidade)
      return el
    })

    for (let i = 0; i < quantidade; i++) {
      this.onAddPedido(_produtos)
    }

  }

  OnCalcPeso(event = null, item, pedido = null){

    const produtos = [];
    const pedidos = [...this.pedidos,...this.pedidosAssociados];

    pedidos
      .map(pedido => { return pedido.produtos})
      .forEach(_produtos => {
        produtos.push(..._produtos)
      })

    // Calcula o saldo consumido
    const saldoQuantidade = produtos
      .filter(produto => (produto.CD_PROD == item.CD_PROD) && (produto.NR_SQNC == item.NR_SQNC))
      .map(produto => produto.TT_PROD)
      .reduce((total, corrente) => total + corrente, 0)

    /* const saldoPeso = produtos
      .filter(produto => (produto.CD_PROD == item.CD_PROD) && (produto.NR_SQNC == item.NR_SQNC))
      .map(produto => produto.TT_PROD_PESO)
      .reduce((total, corrente) => total + corrente, 0) */

    // Calcula o saldo disponível
    this.produtos
      .filter(produto => (produto.CD_PROD == item.CD_PROD) && (produto.NR_SQNC == item.NR_SQNC))
      .map(produto => {

        const novoSaldoQuantidade = produto.TT_PROD - saldoQuantidade
        const novoSaldoPeso = novoSaldoQuantidade * (produto.TT_PROD_PESO / produto.TT_PROD);

        if(novoSaldoQuantidade < 0 ){

          this.pnotify.notice(`La cantidad ingresada es mayor que el saldo actual`)

          item.TT_PROD = 0
          item.TT_PROD_PESO = 0
          item.TT_SALD = 0
          item.TT_SALD_PESO = 0

          const saldoQuantidade = produtos
            .filter(produto => (produto.CD_PROD == item.CD_PROD) && (produto.NR_SQNC == item.NR_SQNC))
            .map(produto => produto.TT_PROD)
            .reduce((total, corrente) => total + corrente, 0)

          const saldoPeso = produtos
            .filter(produto => (produto.CD_PROD == item.CD_PROD) && (produto.NR_SQNC == item.NR_SQNC))
            .map(produto => produto.TT_PROD_PESO)
            .reduce((total, corrente) => total + corrente, 0)

          produto['TT_SALD'] = produto.TT_PROD - saldoQuantidade
          produto['TT_SALD_PESO'] = produto.TT_PROD_PESO - saldoPeso
          return
        }

        produto['TT_SALD'] = novoSaldoQuantidade
        produto['TT_SALD_PESO'] = novoSaldoPeso

      })

      item['TT_PROD_PESO'] = item['TT_PROD'] * item['TT_PESO_UNIT'];
      // calcula o peso total do pedido
      if(pedido){
        pedido.TT_PESO = pedido?.produtos
          ?.map(produto => parseFloat(produto.TT_PROD_PESO))
          ?.reduce((acc, cur) => acc += cur, 0)
          console.log(pedido)
      }

  }


  removePedido(index, pedido){
    this.pedidos.splice(index, 1);
    pedido.produtos.map(el => {
      el.TT_PROD = 0
      this.OnCalcPeso(null, el)
    })

  }

  removeProduto(indexPedido, indexProduto){

    if(this.pedidos[indexPedido].produtos.length == 1){
      this.pnotify.notice('Insertar al menos un producto!')
      return;
    }

    const produto = this.pedidos[indexPedido].produtos[indexProduto]
    produto.TT_PROD = 0;
    this.OnCalcPeso(null, produto)
    this.pedidos[indexPedido].produtos.splice(indexProduto, 1)

  }

  async postDesmembramento(){

    let request = [];

    this.loading = true;

    const promise = () => {
      this.pedidos.forEach((pedido, index) => {

        const _pedido = JSON.parse(JSON.stringify(pedido))
        if(!_pedido.prazoEntrega){
          this.pnotify.notice(`informar el tiempo de entrega del pedido ${_pedido.CD_PEDI}-${index + 1 + this.pedidosAssociados.length}`)
          return
        }

        _pedido['prazoEntrega'] = _pedido.prazoEntrega instanceof Date ? this.dateService.convertToUrlDate(_pedido.prazoEntrega) : pedido.prazoEntrega;

        request.push(this.desmembramentoService.post(_pedido))
      })
    }

    await Promise.resolve(promise());

    forkJoin(request)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(
        (responses: Array<any>) => {
          responses.forEach(response => {
            if(response.status === 200 ){

              this.pnotify.success('Pedido guardado correctamente!');
              this.reload.emit(true);
              this.close.emit(true);
            } else{
              this.pnotify.error();
            }
          });
        },
        (error: any) => {
          try {
            this.pnotify.error(error.error.message);
          } catch (error) {
            this.pnotify.error();
          }
        }
      )
  }

  sendDesmembramento(){
    const saldoTotal = this.produtos
    .map(el => el.TT_SALD)
    .reduce((total,corrente) => total + corrente)

    if(saldoTotal > 0){
      this.confirmChange()
      .subscribe(
        (response) => {

          if (response != true) {
            return
          }

          this.postDesmembramento()
        },
        (error) => {
          this.pnotify.error();
        }
      )
      return
    }
    this.postDesmembramento()
  }


  confirmChange(): any {
    return this.confirmModalService.showConfirm(
      null,
      null,
      'Este pedido aún tiene saldo, de verdad quieres continuar ?',
      'Cancelar',
      'Continuar'
    );
  }


  getPedidosAssociados(params?) {
    this.loadingPedidosAssociados = true;
    this.fusionService
      .getPedidos(params)
      .pipe(
        finalize(() => {
          this.loadingPedidosAssociados = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.pedidosAssociados = response.body['data'];
            this.pedidosAssociados.map(pedido => {
              this.getProdutosAssociados(pedido)
              pedido.prazoEntrega = new Date(pedido.DT_PRZO)
              return pedido
            })
          } else {
            /* this.pnotify.notice("Ningún órdenes de venta situado") */
          }
        },
        (error) => {
          this.pnotify.error();
        }
      )
  }

  getProdutosAssociados(pedido){
    pedido['loadingProdutosAssociados'] = true;

    this.desmembramentoService
      .getProdutos({ID_LOGI_FUSI_PEDI: pedido.ID_LOGI_FUSI_PEDI})
      .pipe(
        finalize(() => {
          pedido['loadingProdutosAssociados'] = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {

            let produtos = response.body['data'];
            pedido.produtos = produtos;

          } else {
            this.pnotify.notice("Ningún órdenes de venta situado")
          }
        },
        (error: any) => {
          try {
            this.pnotify.error(error.error.message);
          } catch (error) {
            this.pnotify.error();
          }
        }
      )
  }

  integraPedido(item) {

    item.loading = true;

    let params = {
      CD_FILI: item?.CD_FILI,
      CD_PEDI: item?.CD_PEDI,
    }

    this.fusionService
      .integraPedidoFusion(params)
      .pipe(
        finalize(() => {
          item.loading = false
        })
      )
      .subscribe(
        (response) => {
          if (response.status !== 200){
            return
          }

          this.pnotify.success();

          if (item["DS_INTE"] == "I") {
            return
          }

          item["DS_INTE"] = "I";
          item["DT_INTE"] = new Date();
          this.pedidoSelecionado.DS_INTE = "I"
          this.pedidoSelecionado.DT_INTE = new Date();
          this.reload.emit(true);
        },
        (error) => {
          const message = error?.error?.message;
          message ? this.pnotify.error(message) : this.pnotify.error();
        }
      );
  }

  onExcluirPedido(pedido){


    this.confirmModalService.showConfirm(
      'null',
      null,
      'Este pedido aún tiene saldo, de verdad quieres continuar ?',
      'Cancelar',
      'Continuar'
    ).subscribe(
      accept => {

        if(accept === false){
          return
        }

        pedido.cancelamentoLoading = true;

        const _params = {
          "ID_LOGI_FUSI_PEDI": pedido?.ID_LOGI_FUSI_PEDI,
          "DT_PRZO": pedido?.DT_PRZO,
          "IN_STAT": "0"
        }

        this.desmembramentoService
          .put(_params)
          .pipe(finalize(() => {
            //pedido.cancelamentoLoading = false;
          }))
          .subscribe(
            response => {
              if(response.status !== 200){
                this.reload.emit(true);
                return
              }

              /* if(pedido.IN_INTE == 0){
                this.pedidosAssociados = this.pedidosAssociados.filter(item => item?.ID_LOGI_FUSI_PEDI != pedido?.ID_LOGI_FUSI_PEDI);
                pedido.cancelamentoLoading = false;
                this.reload.emit(true);
                return;
              } */

              this.fusionService
                .integraPedidoFusion(_params)
                .pipe(
                  finalize(() => {
                    pedido.cancelamentoLoading = false;
                    this.reload.emit(true);
                  })
                )
                .subscribe(
                  response => {
                    if(response.status !== 200){
                      return
                    }

                    this.pedidosAssociados = this.pedidosAssociados.filter(item => item?.ID_LOGI_FUSI_PEDI != pedido?.ID_LOGI_FUSI_PEDI);
                    this.pnotify.success()
                  },
                  error => {
                    pedido.cancelamentoLoading = false;
                    this.pnotify.error("No se pudo cancelar el pedido en la Fusión")
                  }
                )
            },error => {
              this.reload.emit(true);
              this.pnotify.error()
            }
          )
      }
    )
  }

  onMarcarRetira(pedido){

    pedido.retiraLoading = true;

    let _params = {
      'ID_LOGI_FUSI_PEDI': pedido?.ID_LOGI_FUSI_PEDI,
      'TP_OPER': 'RETIRA'
    }

    this.desmembramentoService
      .put(_params)
      .subscribe(
        response => {
          if(response.status != 200){
            this.reload.emit(true);
            return
          }

          pedido.TP_OPER = 'RETIRA';

          if(pedido.DS_INTE == "N"){
            pedido.retiraLoading = false;
            this.reload.emit(true);
            return;
          }

          this.fusionService
            .integraPedidoFusion(_params)
            .pipe(
              finalize(() => {
                pedido.retiraLoading = false;
                this.reload.emit(true);
              })
            )
            .subscribe(
              response => {
                if(response.status !== 200){
                  return
                }
              },
              error => {
                this.pnotify.error("No se pudo cancelar el pedido en la Fusión")
              }
            )
        },
        error => {
          pedido.retiraLoading = false;
          this.reload.emit(true);
          this.pnotify.error("Se produjo un error al procesar la solicitud");
        }
      )
  }

}
