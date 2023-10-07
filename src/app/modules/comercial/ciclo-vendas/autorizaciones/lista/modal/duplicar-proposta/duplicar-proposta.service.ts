import { Injectable } from '@angular/core';

// ngx-bootstrap
import { BsModalService } from 'ngx-bootstrap/modal';

// Components
import { ComercialCicloVendasCotacoesListaModalDuplicarPropostaComponent } from './duplicar-proposta.component';

// Interfaces
import { ICotacao } from '../../models/cotacao';

@Injectable({
  providedIn: 'root',
})
export class ComercialCicloVendasCotacoesListaModalDuplicarPropostaService {
  constructor(private modalService: BsModalService) {}

  showModal(vendedores: any[], cotacao: ICotacao): void {
    const modalConfig = {
      animated: false,
      ignoreBackdropClick: true,
      keyboard: false,
    };

    const initialState = {
      vendedores,
      cotacao,
    };

    this.modalService.show(
      ComercialCicloVendasCotacoesListaModalDuplicarPropostaComponent,
      Object.assign({}, modalConfig, {
        initialState,
      })
    );
  }
}
