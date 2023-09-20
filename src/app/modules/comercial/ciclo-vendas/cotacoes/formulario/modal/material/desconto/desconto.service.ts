import { Injectable, EventEmitter } from '@angular/core';

// ngx-bootstrap
import { BsModalService } from 'ngx-bootstrap/modal';

// Components
import { ComercialCicloVendasCotacoesFormularioModalMaterialDescontoComponent } from './desconto.component';

// Interfaces
import { IDescontoCarrinhoModel } from '../../../models/descontos';
import { ICarrinhoModel } from '../../../models/carrinho';

@Injectable({
  providedIn: 'root',
})
export class ComercialCicloVendasCotacoesFormularioModalMaterialDescontoService {
  loaderNavbar: EventEmitter<boolean> = new EventEmitter();

  constructor(private modalService: BsModalService) {}

  descontoCarrinho(descontoCarrinho: IDescontoCarrinhoModel): void {
    this.showModal({
      aplicarDesconto: 'carrinho',
      descontoCarrinho: descontoCarrinho,
    });
  }

  descontoMaterial(index: number, material: ICarrinhoModel, descuento): void {
    this.showModal({
      aplicarDesconto: 'material',
      index: index,
      material: material,
      descuento
    });
  }



  showModal(params: any): void {
    const modalConfig = {
      animated: false,
      ignoreBackdropClick: true,
      keyboard: false,
    };

    const initialState = {
      params: params,
    };

    this.modalService.show(
      ComercialCicloVendasCotacoesFormularioModalMaterialDescontoComponent,
      Object.assign({}, modalConfig, {
        initialState,
      })
    );
  }
}
