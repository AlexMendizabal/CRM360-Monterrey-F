import { Injectable, EventEmitter } from '@angular/core';
import { finalize } from 'rxjs/operators';

// ngx-bootstrap
import { BsModalService } from 'ngx-bootstrap/modal';

// Components
import { ComercialCicloVendasCotacoesFormularioModalHistoricoComprasComponent } from './historico-compras.component';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialCicloVendasAutorizacionesService } from '../../../../autorizaciones.service';

// Interfaces
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialCicloVendasCotacoesFormularioModalHistoricoComprasService {
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
      .getHistoricoCompras(params)
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
              class: 'modal-xl',
            };

            const initialState = {
              codEmpresa: params.codEmpresa,
              codCliente: params.codCliente,
              _ultimasCompras: response.data.ultimasCompras,
              _maisComprados: response.data.maisComprados,
            };

            this.modalService.show(
              ComercialCicloVendasCotacoesFormularioModalHistoricoComprasComponent,
              Object.assign({}, modalConfig, {
                initialState,
              })
            );
          } else if (response.success === false && response.data == 'vazio'){
            this.pnotifyService.notice(response.mensagem);
          } else{
            this.pnotifyService.error();
          }
        },
        (error: any) => {
          this.pnotifyService.error();
        }
      );
  }
}
