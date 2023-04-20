import { Injectable, EventEmitter } from '@angular/core';
import { finalize } from 'rxjs/operators';

// ngx-bootstrap
import { BsModalService } from 'ngx-bootstrap/modal';

// Components
import { ComercialCicloVendasCotacoesListaModalDesdobrarPropostaComponent } from './desdobrar-proposta.component';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialCicloVendasCotacoesService } from '../../../cotacoes.service';

// Interfaces
import { ICotacao } from '../../models/cotacao';
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialCicloVendasCotacoesListaModalDesdobrarPropostaService {
  loaderNavbar: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private modalService: BsModalService,
    private pnotifyService: PNotifyService,
    private cotacoesService: ComercialCicloVendasCotacoesService
  ) {
    this.pnotifyService.getPNotify();
  }

  showModal(cotacao: ICotacao): void {
    this.loaderNavbar.emit(true);

    this.cotacoesService
      .getMateriaisCotacao(cotacao.codEmpresa, cotacao.nrPedido)
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
              ignoreBackdropClick: true,
              keyboard: false,
            };

            const initialState = {
              cotacao: cotacao,
              materiais: response.data.map((material: any) => {
                let o = Object.assign({}, material);
                o.checked = 0;
                return o;
              }),
            };

            this.modalService.show(
              ComercialCicloVendasCotacoesListaModalDesdobrarPropostaComponent,
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
