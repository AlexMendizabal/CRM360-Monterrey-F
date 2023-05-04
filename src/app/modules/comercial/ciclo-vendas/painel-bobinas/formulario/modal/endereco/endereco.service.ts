import { Injectable, EventEmitter } from '@angular/core';
import { finalize } from 'rxjs/operators';

// ngx-bootstrap
import { BsModalService } from 'ngx-bootstrap/modal';

// Components
import { ComercialCicloVendasPainelBobinasFormularioModalDetalhesEnderecoComponent } from './endereco.component';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialClientesService } from 'src/app/modules/comercial/services/clientes.service';

@Injectable({
  providedIn: 'root',
})
export class ComercialCicloVendasPainelBobinasFormularioModalDetalhesEnderecoService {
  loaderNavbar: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private modalService: BsModalService,
    private pnotifyService: PNotifyService,
    private clienteService: ComercialClientesService
  ) {
    this.pnotifyService.getPNotify();
  }

  showModal(codCliente: number, codEndereco: number): void {
    this.loaderNavbar.emit(true);

    this.clienteService
      .getEndereco(codCliente, codEndereco, 1)
      .pipe(
        finalize(() => {
          this.loaderNavbar.emit(false);
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.responseCode === 200) {
            const modalConfig = {
              animated: false,
              class: 'modal-lg',
            };

            const initialState = {
              endereco: response.result,
            };

            this.modalService.show(
              ComercialCicloVendasPainelBobinasFormularioModalDetalhesEnderecoComponent,
              Object.assign({}, modalConfig, {
                initialState,
              })
            );
          } else {
            this.pnotifyService.error();
          }
        },
        error: (error: any) => {
          this.pnotifyService.error();
        }
      });
  }
}
