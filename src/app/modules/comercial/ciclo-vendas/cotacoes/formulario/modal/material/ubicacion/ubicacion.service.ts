import { Injectable, EventEmitter } from '@angular/core';
import { finalize } from 'rxjs/operators';

// ngx-bootstrap
import { BsModalService } from 'ngx-bootstrap/modal';

// Components
import { ComercialCicloVendasCotacoesFormularioModalMaterialUbicacionComponent } from './ubicacion.component';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialCicloVendasCotacoesService } from '../../../../cotacoes.service';

// Interfaces
import { ICarrinhoModel } from '../../../models/carrinho';
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
    providedIn: 'root',
})
export class ComercialCicloVendasCotacoesFormularioModalMaterialUbicacionService {
    loaderNavbar: EventEmitter<boolean> = new EventEmitter();

    constructor(
        private modalService: BsModalService,
        private pnotifyService: PNotifyService,
        private cotacoesService: ComercialCicloVendasCotacoesService
    ) {
        this.pnotifyService.getPNotify();
    }

    showModal(): void {
        this.loaderNavbar.emit(true);
        const modalConfig = {
            animated: false,
            class: 'modal-lg',
            ignoreBackdropClick: true,
            keyboard: false,
        };
        const initialState = {
   
        };
        this.modalService.show(
            ComercialCicloVendasCotacoesFormularioModalMaterialUbicacionComponent,
            Object.assign({}, modalConfig, {
              initialState,
            })
          );

    }
}
