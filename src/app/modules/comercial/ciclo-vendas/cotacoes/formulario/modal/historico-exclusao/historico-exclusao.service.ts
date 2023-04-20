import { Injectable, EventEmitter } from '@angular/core';
import { finalize } from 'rxjs/operators';

// ngx-bootstrap
import { BsModalService } from 'ngx-bootstrap/modal';

// Components
import { ComercialCicloVendasCotacoesFormularioModalHistoricoExclusaoComponent } from './historico-exclusao.component';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialCicloVendasCotacoesService } from '../../../cotacoes.service';

// Interfaces
import { ICarrinhoModel } from '../../models/carrinho';
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialCicloVendasCotacoesFormularioModalHistoricoExclusaoService {
  loaderNavbar: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private modalService: BsModalService,
    private pnotifyService: PNotifyService,
    private cotacoesService: ComercialCicloVendasCotacoesService
  ) {
    this.pnotifyService.getPNotify();
  }

  showModal(params: any): void {
    this.loaderNavbar.emit(true);

    this.cotacoesService
      .getHistoricoExclusao(params)
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
              ComercialCicloVendasCotacoesFormularioModalHistoricoExclusaoComponent,
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
