import { Injectable, EventEmitter } from '@angular/core';
import { finalize } from 'rxjs/operators';

// ngx-bootstrap
import { BsModalService } from 'ngx-bootstrap/modal';

// Components
import { ComercialCicloVendasCotacoesListaModalEmailCotacaoComponent } from './email-cotacao.component';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialClientesService } from 'src/app/modules/comercial/services/clientes.service';

// Interfaces
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialCicloVendasCotacoesListaModalEmailCotacaoService {
  loaderNavbar: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private modalService: BsModalService,
    private pnotifyService: PNotifyService,
    private clientesService: ComercialClientesService
  ) {
    this.pnotifyService.getPNotify();
  }

  showModal(codCliente: number, pdf: any, codCotacao: number): void {
    this.loaderNavbar.emit(true);

    this.clientesService
      .getListaEmails(codCliente)
      .pipe(
        finalize(() => {
          this.loaderNavbar.emit(false);
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if(response != null){
            if (response.success === true) {
              const modalConfig = {
                animated: false,
                ignoreBackdropClick: true,
                keyboard: false,
              };
              const initialState = {
                codCotacao: codCotacao,
                codCliente: codCliente,
                emailsCliente: response.data,
                pdf: pdf
              };

              this.modalService.show(
                ComercialCicloVendasCotacoesListaModalEmailCotacaoComponent,
                Object.assign({}, modalConfig, {
                  initialState,
                })
              );
            } else {
              this.pnotifyService.error();
            }
        } else {
          this.pnotifyService.notice('Não há e-mails cadastrados.');
        }
        },
        error: (error: any) => {
          this.pnotifyService.error(error);
        }
      });
  }
}
