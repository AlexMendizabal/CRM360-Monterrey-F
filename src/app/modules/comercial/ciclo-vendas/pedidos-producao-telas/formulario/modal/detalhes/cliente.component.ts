import { Component, OnInit, Input } from '@angular/core';

// ngx-bootstrap
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'comercial-cliclo-vendas-pedidos-producao-telas-formulario-modal-detalhes',
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.scss'],
})
export class ComercialCicloVendasPedidosProducaoTelasFormularioModalDetalhesComponent
  implements OnInit {
  @Input('cliente') cliente: any;

  constructor(private bsModalRef: BsModalRef) {}

  ngOnInit(): void {}

  onClose(): void {
    this.bsModalRef.hide();
  }
}
