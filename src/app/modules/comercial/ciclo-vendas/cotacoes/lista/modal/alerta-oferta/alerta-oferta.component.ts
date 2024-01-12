import { Component, OnInit, Input } from '@angular/core';

// ngx-bootstrap
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'comercial-ciclo-vendas-cotacoes-lista-modal-alerta-oferta',
  templateUrl: './alerta-oferta.component.html',
  styleUrls: ['./alerta-oferta.component.scss'],
})
export class ComercialCicloVendasCotacoesListaModalAlertaOfertaComponent
  implements OnInit {
  //@Input('dadosLiberacao') dadosLiberacao: any = {};

  travasComercial = [];
  travasLogistica = [];
  travasFinanceira = [];

  constructor(private bsModalRef: BsModalRef) {}

  ngOnInit(): void {
    //this.getTravas();
  }

  /* getTravas(): void{

    this.travasComercial = this.dadosLiberacao['travas'].filter(
      (value: any) => value.codTipoTrava == 2
    );

    this.travasFinanceira = this.dadosLiberacao['travas'].filter(this.excluiLog);

    this.travasLogistica = this.dadosLiberacao['travas'].filter(
      (value: any) => value.desTrava == 'Faturamento inferior a 750 Kg (Liberação Logística)'
    );

  }

  excluiLog(value){
    if (value.desTrava != 'Faturamento inferior a 750 Kg (Liberação Logística)' && value.codTipoTrava == 1) {
      return value;
    }
  }
 */
  onClose(): void {
    this.bsModalRef.hide();
  }
}
