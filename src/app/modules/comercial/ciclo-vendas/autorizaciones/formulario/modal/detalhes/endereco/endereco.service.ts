import { Injectable, EventEmitter } from '@angular/core';
import { finalize } from 'rxjs/operators';

// ngx-bootstrap
import { BsModalService } from 'ngx-bootstrap/modal';

// Components
import { ComercialCicloVendasCotacoesFormularioModalDetalhesEnderecoComponent } from './endereco.component';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialClientesService } from 'src/app/modules/comercial/services/clientes.service';

@Injectable({
  providedIn: 'root',
})
export class ComercialCicloVendasCotacoesFormularioModalDetalhesEnderecoService {
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
      .subscribe(
        (response: any) => {
          if (response.responseCode === 200) {
            const modalConfig = {
              animated: false,
              class: 'modal-lg',
            };

            const initialState = {
              endereco: response.result,
            };

            this.modalService.show(
              ComercialCicloVendasCotacoesFormularioModalDetalhesEnderecoComponent,
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
