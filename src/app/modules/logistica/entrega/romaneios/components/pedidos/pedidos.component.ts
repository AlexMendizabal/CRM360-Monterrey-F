import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';

import { finalize } from 'rxjs/operators';

import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

import { LogisticaEntregaRomaneiosService } from '../../services/romaneios.service';

import { ILogisticaEntregaRomaneio } from '../../models/romaneio';

@Component({
  selector: 'logistica-entrega-romaneios-pedidos',
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.scss']
})
export class LogisticaEntregaRomaneiosPedidosComponent implements OnInit, OnChanges {

  pedidos = [];
  loadingPedidos: boolean = false;

  ctes = [];
  loadingCtes: boolean = false;

  @Input() entrega;

  notificacoes = {
    entrega: {
      faturamento: {
        tooltips:{
          0: 'Entrega não marcada para faturamento de cte',
          1: 'Entrega para faturamento de cte'
        },
        cor:{
          0: 'text-warning',
          1: 'text-success'
        }
      },
      cte:{
        tooltips:{
          0: 'Cte\'s não emitidos',
          1: 'Cte\'s emitidos'
        },
        cor:{
          0: 'text-danger',
          1: 'text-success'
        }
      },
      entrega:{
        tooltips:{
          0: 'Entrega realizada',
          1: 'Entrega não realizada'
        },
        cor:{
          0: 'text-danger',
          1: 'text-success'
        }
      },
      situacao:{
        tooltips:{
          0: 'Entrega inativa',
          1: 'Entrega ativa'
        },
        cor:{
          0: 'text-danger',
          1: 'text-success'
        }
      }
    },
    pedido:{
      faturamento: {
        tooltips:{
          0: 'Nota Fiscal não marcada para faturamento de cte',
          1: 'Nota Fiscal para faturamento de cte'
        },
        cor:{
          0: 'text-warning',
          1: 'text-success'
        }
      },
      cte:{
        tooltips:{
          0: 'Cte\'s não emitidos',
          1: 'Cte\'s emitidos'
        },
        cor:{
          0: 'text-danger',
          1: 'text-success'
        }
      },
      entrega:{
        tooltips:{
          0: 'Entrega realizada',
          1: 'Entrega não realizada'
        },
        cor:{
          0: 'text-danger',
          1: 'text-success'
        }
      },
      situacao:{
        tooltips:{
          0: 'Nota Fiscal inativa',
          1: 'Nota Fiscal ativa'
        },
        cor:{
          0: 'text-danger',
          1: 'text-success'
        }
      }
    }
  }

  arrow = {
    entrega: true,
    pedidos: true
  }

  @Input() inSomenteEntregaFaturamento: boolean;

  constructor(
    private romaneiosService: LogisticaEntregaRomaneiosService,
    private pnotifyService: PNotifyService
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges){
    
    if(!changes?.entrega?.currentValue){
      return
    }

    if(Object.keys(changes?.entrega?.currentValue)?.length != 0 && changes?.entrega?.firstChange){
      this.getPedidos();
    }
  }

  getMateriais(pedido){
    
    if(pedido?.materiais)
      return

    pedido.loadingMateriais = true;

    const _params = {
      "CD_PEDI": pedido?.CD_PEDI ?? '',
      "CD_EMPR": pedido?.CD_EMPR ?? '',
      "CD_ROMA": pedido?.CD_ROMA ?? ''
    }

    this.romaneiosService
      .getMateriais(_params)
      .pipe(
        finalize(() => {
          pedido.loadingMateriais = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status !== 200) {
            
          }

          pedido.materiais = response.body['data'];
        },
        (error) => {
          
        }
      )
  }

  getCtes(){
    
    if(this.ctes.length !== 0)
      return;

    if(this.arrow['ctes'] === false)
      return

    this.loadingCtes = true;

    const params = {
      'CD_ROMA': this.entrega?.CD_ROMA ?? '',
      'CD_PEDI':this.entrega?.CD_PEDI ?? '',
      'CD_CLIE': this.entrega?.CD_CLIE ?? '',
      'DS_LOCA_ENTR': this.entrega?.DS_LOCA_ENTR ?? '',
      'DS_CIDA': this.entrega?.DS_CIDA ?? '',
      'DS_BAIR': this.entrega?.DS_BAIR ?? '',
      'DS_ESTA': this.entrega?.DS_ESTA ?? ''
    }

    this.romaneiosService
      .getCtes(params)
      .pipe(
        finalize(() => {
          this.loadingCtes = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status !== 200){
            this.ctes = [];
            return
          }
          
          this.ctes = response.body['data'];
        },
        (error) => {
          this.ctes = [];
        }
      ) 
  }

  getPedidos() {
    
    if(this.pedidos.length !== 0){
      return
    }

    this.loadingPedidos = true;

    const params = {
      'CD_ROMA': this.entrega?.CD_ROMA ?? '',
      'CD_CLIE': this.entrega?.CD_CLIE ?? '',
      'DS_LOCA_ENTR': this.entrega?.DS_LOCA_ENTR ?? '',
      'DS_CIDA': this.entrega?.DS_CIDA ?? '',
      'DS_BAIR': this.entrega?.DS_BAIR ?? '',
      'DS_ESTA': this.entrega?.DS_ESTA ?? ''
    }

    this.romaneiosService
      .getPedidos(params)
      .pipe(
        finalize(() => {
          this.loadingPedidos = false;
        })
      )
      .subscribe(
        (response) => {
          
          if (response.status !== 200) {
            return;
          }

          const pedidos: Array<any> = response.body['data'];
          this.pedidos = pedidos;
          
        },
        (error) => {
          
        }
      )
  }

  copyToClipboard(value) {
    var txtArea = document.createElement("textarea");
    txtArea.id = 'txt';
    txtArea.style.position = 'fixed';
    txtArea.style.top = '0';
    txtArea.style.left = '0';
    txtArea.style.opacity = '0';
    txtArea.value = value;
    document.body.appendChild(txtArea);
    txtArea.select();
    document.execCommand("copy");
    this.pnotifyService.success("Copiado");
  }

  onToggleArrow(status, type){
    this.arrow[type] = status
  }

  onCorCancelado(item){
    if (item.IN_STAT == 0)
      return 'text-muted';

    return;
  }
  
}
