import { Injectable } from '@angular/core';

// ngx-bootstrap
import { BsModalService } from 'ngx-bootstrap/modal';

// Components
import { ComercialCicloVendasCotacoesListaModalHistoricoComercialComponent } from './historico-comercial.component';

@Injectable({
  providedIn: 'root',
})
export class ComercialCicloVendasCotacoesListaModalHistoricoComercialService {
  constructor(private modalService: BsModalService) {}

  showModal(codCliente: number): void {
    const modalConfig = {
      animated: false,
      class: 'modal-xxl',
      ignoreBackdropClick: true,
      keyboard: false,
    };

    const initialState = {
      codCliente: codCliente,
    };

    this.modalService.show(
      ComercialCicloVendasCotacoesListaModalHistoricoComercialComponent,
      Object.assign({}, modalConfig, {
        initialState,
      })
    );
  }
}
