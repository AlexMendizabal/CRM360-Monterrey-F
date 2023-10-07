import { Injectable, EventEmitter } from '@angular/core';
import { finalize } from 'rxjs/operators';

// ngx-bootstrap
import { BsModalService } from 'ngx-bootstrap/modal';

// Components
import { ComercialCicloVendasCotacoesListaModalConsultaLiberacaoComponent } from './consulta-liberacao.component';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialCicloVendasAutorizacionesService } from '../../../autorizaciones.service';

// Interfaces
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialCicloVendasCotacoesListaModalConsultaLiberacaoService {
  loaderNavbar: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private modalService: BsModalService,
    private pnotifyService: PNotifyService,
    private cotacoesService: ComercialCicloVendasAutorizacionesService
  ) {
    this.pnotifyService.getPNotify();
  }

  showModal(params): void {
    this.loaderNavbar.emit(true);

    this.cotacoesService
      .getSituacaoLiberacao(params)
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
              class: 'modal-xxl',
              ignoreBackdropClick: true,
              keyboard: false,
            };

            const initialState = {
              dadosLiberacao: response.data,
            };

            this.modalService.show(
              ComercialCicloVendasCotacoesListaModalConsultaLiberacaoComponent,
              Object.assign({}, modalConfig, {
                initialState,
              })
            );
          } else if (response.success === false && response.data == 'vazio'){
            this.pnotifyService.notice(response.mensagem);
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
