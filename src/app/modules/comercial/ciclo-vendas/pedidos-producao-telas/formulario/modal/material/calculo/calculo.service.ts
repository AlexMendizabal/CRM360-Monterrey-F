import { ComercialCicloVendasPedidosProducaoTelasService } from './../../../../pedidos-producao-telas.service';
import { ICarrinhoModel } from './../../../../../cotacoes/formulario/models/carrinho';
import { Injectable, EventEmitter } from '@angular/core';
import { finalize } from 'rxjs/operators';


// ngx-bootstrap
import { BsModalService } from 'ngx-bootstrap/modal';

// Components
import { ComercialCicloVendasPedidosProducaoTelasFormularioModalMaterialCalculoComponent } from './calculo.component';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';


@Injectable({
  providedIn: 'root',
})
export class ComercialCicloVendasPedidosProducaoTelasFormularioModalMaterialCalculoService {
  loaderNavbar: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private modalService: BsModalService,
    private pnotifyService: PNotifyService,
  ) {
    this.pnotifyService.getPNotify();
  }

  showModal(index: number, material: ICarrinhoModel, codCliente: number): void {
    this.loaderNavbar.emit(false);

    const modalConfig = {
        animated: false,
        class: 'modal-lg',
        ignoreBackdropClick: true,
        keyboard: false,
      };

    const initialState = {
      index: index,
      material: material,
      codCliente: codCliente,
    };

    this.modalService.show(
      ComercialCicloVendasPedidosProducaoTelasFormularioModalMaterialCalculoComponent,
      Object.assign({}, modalConfig, {
        initialState,
      })
      )
  }

}
