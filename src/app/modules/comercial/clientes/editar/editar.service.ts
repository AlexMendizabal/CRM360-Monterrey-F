import { Injectable, EventEmitter } from '@angular/core';
import { finalize } from 'rxjs/operators';

// ngx-bootstrap
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

//components
import { EditarClienteComponent } from './editar.component';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

// Interfaces
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
    providedIn: 'root'
})
export class EditarClienteService {
    loaderNavbar: EventEmitter<boolean> = new EventEmitter();
    
    private modalRef: BsModalRef;

    constructor(
        private modalAutorizacionService: BsModalService,
        private pnotifyService: PNotifyService,

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

        this.modalAutorizacionService.show(EditarClienteComponent, {
            initialState: {  },
        });

    }

    hide() {
        if (this.modalRef) {
            this.modalRef.hide();
        }
    }
}
