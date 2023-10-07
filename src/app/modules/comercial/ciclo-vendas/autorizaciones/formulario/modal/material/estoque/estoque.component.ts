import { Component, OnInit, Input } from '@angular/core';

// ngx-bootstrap
import { BsModalRef } from 'ngx-bootstrap/modal';

// Interfaces
import { IMateriaisModel } from '../../../models/materiais';

@Component({
  selector: 'comercial-ciclo-vendas-cotacoes-formulario-modal-material-estoque',
  templateUrl: './estoque.component.html',
  styleUrls: ['./estoque.component.scss'],
})
export class ComercialCicloVendasCotacoesFormularioModalMaterialEstoqueComponent
  implements OnInit {
  @Input('material') material: IMateriaisModel;
  @Input('detalhes') detalhes: any;

  constructor(private bsModalRef: BsModalRef) {}

  ngOnInit(): void {}

  onClose(): void {
    this.bsModalRef.hide();
  }
}
