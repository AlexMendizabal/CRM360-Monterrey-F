import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// ngx-bootstrap
import { BsModalService } from 'ngx-bootstrap/modal';

// Components
import { ComercialCicloVendasCotacoesListaModalTrocarClienteComponent } from './trocar-cliente.component';

// Interfaces
import { ICotacao } from '../../models/cotacao';

@Injectable({
  providedIn: 'root',
})
export class ComercialCicloVendasCotacoesListaModalTrocarClienteService {
  constructor(private modalService: BsModalService) {}

  showModal(cotacao: ICotacao): void {
    const modalConfig = {
      animated: false,
      ignoreBackdropClick: true,
      keyboard: false,
    };

    const initialState = {
      cotacao: cotacao,
    };

    this.modalService.show(
      ComercialCicloVendasCotacoesListaModalTrocarClienteComponent,
      Object.assign({}, modalConfig, {
        initialState,
      })
    );
  }
}
