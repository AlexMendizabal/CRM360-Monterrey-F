import { Injectable, EventEmitter } from '@angular/core';
import { finalize } from 'rxjs/operators';

// ngx-bootstrap
import { BsModalService } from 'ngx-bootstrap/modal';

// Components
import { ComercialCicloVendasCotacoesFormularioModalMaterialEstoqueComponent } from './estoque.component';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialCicloVendasAutorizacionesService } from '../../../../autorizaciones.service';

// Interfaces
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialCicloVendasCotacoesFormularioModalMaterialEstoqueService {
  loaderNavbar: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private modalService: BsModalService,
    private pnotifyService: PNotifyService,
    private cotacoesService: ComercialCicloVendasAutorizacionesService
  ) {
    this.pnotifyService.getPNotify();
  }

  showModal(params: any): void {
    this.loaderNavbar.emit(true);

    this.cotacoesService
      .getEstoqueDetalhes(params.pesquisa)
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
            };

            const initialState = {
              material: params.material,
              detalhes: response.data[0],
            };

            this.modalService.show(
              ComercialCicloVendasCotacoesFormularioModalMaterialEstoqueComponent,
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
