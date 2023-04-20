import { Injectable, EventEmitter } from '@angular/core';
import { finalize } from 'rxjs/operators';

// ngx-bootstrap
import { BsModalService } from 'ngx-bootstrap/modal';

// Components
import { ComercialCicloVendasCotacoesFormularioModalMaterialLoteComponent } from './lote.component';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialCicloVendasCotacoesService } from '../../../../cotacoes.service';

// Interfaces
import { ICarrinhoModel } from '../../../models/carrinho';
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialCicloVendasCotacoesFormularioModalMaterialLoteService {
  loaderNavbar: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private modalService: BsModalService,
    private pnotifyService: PNotifyService,
    private cotacoesService: ComercialCicloVendasCotacoesService
  ) {
    this.pnotifyService.getPNotify();
  }

  showModal(index: number, material: ICarrinhoModel): void {
    this.loaderNavbar.emit(true);

    this.cotacoesService
      .getLoteMaterial(material.codMaterial, material.codDeposito)
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
              index,
              material,
              lotes: response.data
            };

            this.modalService.show(
              ComercialCicloVendasCotacoesFormularioModalMaterialLoteComponent,
              Object.assign({}, modalConfig, {
                initialState,
              })
            );
          } else {
            this.pnotifyService.notice("Nenhum resultado encontrado");
          }
        },
        error: (error: any) => {
          this.pnotifyService.error();
        }
      });
  }
}
