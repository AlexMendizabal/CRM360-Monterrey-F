import { Component, OnInit, Input } from '@angular/core';

// ngx-bootstrap
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'comercial-ciclo-vendas-cotacoes-formulario-modal-detalhes-contato',
  templateUrl: './contato.component.html',
  styleUrls: ['./contato.component.scss'],
})
export class ComercialCicloVendasPainelBobinasFormularioModalDetalhesContatoComponent
  implements OnInit {
  @Input('contato') contato: any;

  constructor(private bsModalRef: BsModalRef) {}

  ngOnInit(): void {}

  onClose(): void {
    this.bsModalRef.hide();
  }
}
