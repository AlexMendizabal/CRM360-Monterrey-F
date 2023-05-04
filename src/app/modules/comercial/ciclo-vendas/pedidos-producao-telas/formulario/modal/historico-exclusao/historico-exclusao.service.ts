import { ComercialCicloVendasPedidosProducaoTelasService } from './../../../pedidos-producao-telas.service';
import { Injectable, EventEmitter } from '@angular/core';
import { finalize } from 'rxjs/operators';

// ngx-bootstrap
import { BsModalService } from 'ngx-bootstrap/modal';

// Components
import { ComercialCicloVendasPedidosProducaoTelasFormularioModalHistoricoExclusaoComponent } from './historico-exclusao.component';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

// Interfaces
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialCicloVendasPedidosProducaoTelasFormularioModalHistoricoExclusaoService {
  loaderNavbar: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private modalService: BsModalService,
    private pnotifyService: PNotifyService,
    private cotacoesService: ComercialCicloVendasPedidosProducaoTelasService
  ) {
    this.pnotifyService.getPNotify();
  }

  showModal(codCotacao: number): void {
    this.loaderNavbar.emit(true);

    this.cotacoesService
      .getHistoricoExclusao(codCotacao)
      .pipe(
        finalize(() => {
          this.loaderNavbar.emit(false);
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.success === true) {
            const modalConfig = {
              animated: false,
              class: 'modal-lg',
            };

            const initialState = {
              exclusoes: response.data,
            };

            this.modalService.show(
              ComercialCicloVendasPedidosProducaoTelasFormularioModalHistoricoExclusaoComponent,
              Object.assign({}, modalConfig, {
                initialState,
              })
            );
          } else {
            this.pnotifyService.notice('Nenhuma informação encontrada.');
          }
        },
        error: (error: any) => {
          this.pnotifyService.error();
        }
      });
  }
}
