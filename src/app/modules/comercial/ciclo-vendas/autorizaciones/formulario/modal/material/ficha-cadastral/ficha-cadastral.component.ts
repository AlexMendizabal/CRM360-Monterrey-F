import { Component, OnInit, Input } from '@angular/core';

// ngx-bootstrap
import { BsModalRef } from 'ngx-bootstrap/modal';

// Interfaces
import { IFichaCadastralModel } from '../../../models/ficha-cadastral';

@Component({
  selector:
    'comercial-ciclo-vendas-cotacoes-formulario-modal-material-ficha-cadastral',
  templateUrl: './ficha-cadastral.component.html',
  styleUrls: ['./ficha-cadastral.component.scss'],
})
export class ComercialCicloVendasCotacoesFormularioModalMaterialFichaCadastralComponent
  implements OnInit {
  @Input('material') material: IFichaCadastralModel;

  constructor(private bsModalRef: BsModalRef) {}

  ngOnInit(): void {}

  onClose(): void {
    this.bsModalRef.hide();
  }
}
