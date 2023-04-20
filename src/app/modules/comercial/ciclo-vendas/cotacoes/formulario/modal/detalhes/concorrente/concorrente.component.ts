import { Component, OnInit, Input } from '@angular/core';

// ngx-bootstrap
import { BsModalRef } from 'ngx-bootstrap/modal';

// Interfaces
import { Concorrente } from 'src/app/modules/comercial/cadastros/concorrentes/models/concorrente';

@Component({
  selector:
    'comercial-ciclo-vendas-cotacoes-formulario-modal-detalhes-concorrente',
  templateUrl: './concorrente.component.html',
  styleUrls: ['./concorrente.component.scss'],
})
export class ComercialCicloVendasCotacoesFormularioModalDetalhesConcorrenteComponent
  implements OnInit {
  @Input('concorrente') concorrente: Concorrente;

  constructor(private bsModalRef: BsModalRef) {}

  ngOnInit(): void {}

  onClose(): void {
    this.bsModalRef.hide();
  }
}
