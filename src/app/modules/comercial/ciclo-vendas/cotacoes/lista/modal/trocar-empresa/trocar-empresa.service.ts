import { Injectable, EventEmitter } from '@angular/core';
import { finalize } from 'rxjs/operators';

// ngx-bootstrap
import { BsModalService } from 'ngx-bootstrap/modal';

// Components
import { ComercialCicloVendasCotacoesListaModalTrocarEmpresaComponent } from './trocar-empresa.component';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

// Interfaces
import { ICotacao } from '../../models/cotacao';

@Injectable({
  providedIn: 'root',
})
export class ComercialCicloVendasCotacoesListaModalTrocarEmpresaService {
  constructor(
    private modalService: BsModalService,
    private pnotifyService: PNotifyService
  ) {
    this.pnotifyService.getPNotify();
  }

  showModal(empresas: any, depositos: any, cotacao: ICotacao): void {
    const modalConfig = {
      animated: false,
      ignoreBackdropClick: true,
      keyboard: false,
    };

    const initialState = {
      empresas,
      depositos,
      cotacao,
    };

    this.modalService.show(
      ComercialCicloVendasCotacoesListaModalTrocarEmpresaComponent,
      Object.assign({}, modalConfig, {
        initialState,
      })
    );
  }
}
