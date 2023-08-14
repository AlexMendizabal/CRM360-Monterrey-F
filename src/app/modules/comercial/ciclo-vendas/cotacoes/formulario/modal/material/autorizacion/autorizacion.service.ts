import { Injectable, EventEmitter } from '@angular/core';

// ngx-bootstrap
import { BsModalService } from 'ngx-bootstrap/modal';

// Components
import { ComercialCicloVendasCotacoesFormularioModalMaterialAutorizacionComponent } from './autorizacion.component';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialClientesService } from 'src/app/modules/comercial/services/clientes.service';

@Injectable({
    providedIn: 'root',
})
export class ComercialCicloVendasCotacoesFormularioModalMaterialAutorizacionService {
    loaderNavbar: EventEmitter<boolean> = new EventEmitter();

    constructor(
        private modalService: BsModalService,
        private pnotifyService: PNotifyService,
        private clientesService: ComercialClientesService
      ) {
        this.pnotifyService.getPNotify();
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
            ComercialCicloVendasCotacoesFormularioModalMaterialAutorizacionComponent,
            Object.assign({}, modalConfig, {
                initialState,
            })
        );
    }
}
