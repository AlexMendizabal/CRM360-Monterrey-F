import { Injectable, EventEmitter } from '@angular/core';
import { finalize } from 'rxjs/operators';

// ngx-bootstrap
import { BsModalService } from 'ngx-bootstrap/modal';

// Components
import { ComercialCicloVendasCotacoesFormularioModalDetalhesClienteComponent } from './cliente.component';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialClientesService } from 'src/app/modules/comercial/services/clientes.service';

// Interfaces
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialCicloVendasCotacoesFormularioModalDetalhesClienteService {
  loaderNavbar: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private modalService: BsModalService,
    private pnotifyService: PNotifyService,
    private clientesService: ComercialClientesService
  ) {
    this.pnotifyService.getPNotify();
  }

  showModal(codCliente: number): void {
    this.loaderNavbar.emit(true);

    this.clientesService
      .getDetalhes(codCliente)
      .pipe(
        finalize(() => {
          this.loaderNavbar.emit(false);
        })
      )
      .subscribe(
        (response: JsonResponse) => {
          if (response.success === true) {
            const modalConfig = {
              animated: false,
            };

            const initialState = {
              cliente: response.data,
            };
            console.log(initialState)

            this.modalService.show(
              ComercialCicloVendasCotacoesFormularioModalDetalhesClienteComponent,
              Object.assign({}, modalConfig, {
                initialState,
              })
            );
          } else {
            this.pnotifyService.error();
          }
        },
        (error: any) => {
          this.pnotifyService.error();
        }
);
}
}
