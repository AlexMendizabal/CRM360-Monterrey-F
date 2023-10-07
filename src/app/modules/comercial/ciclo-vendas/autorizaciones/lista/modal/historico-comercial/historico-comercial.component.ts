import { Component, OnInit, Input } from '@angular/core';

// ngx-bootstrap
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'comercial-ciclo-vendas-cotacoes-lista-modal-historico-comercial',
  templateUrl: './historico-comercial.component.html',
  styleUrls: ['./historico-comercial.component.scss'],
})
export class ComercialCicloVendasCotacoesListaModalHistoricoComercialComponent
  implements OnInit {
  @Input('codCliente') codCliente: number;

  constructor(private bsModalRef: BsModalRef) {}

  ngOnInit(): void {}

  onClose(): void {
    this.bsModalRef.hide();
  }
}
