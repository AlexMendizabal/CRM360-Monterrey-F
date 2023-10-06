import { Injectable, EventEmitter } from '@angular/core';
import { finalize } from 'rxjs/operators';

// ngx-bootstrap
import { BsModalService } from 'ngx-bootstrap/modal';

// Components
import { ComercialCicloVendasCotacoesFormularioModalMaterialComboComponent } from './combo.component';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialCicloVendasCotacoesService } from '../../../../cotacoes.service';

// Interfaces
import { ICarrinhoModel } from '../../../models/carrinho';
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialCicloVendasCotacoesFormularioModalMaterialComboService {
  loaderNavbar: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private modalService: BsModalService,
    private pnotifyService: PNotifyService,
    private cotacoesService: ComercialCicloVendasCotacoesService
  ) {
    this.pnotifyService.getPNotify();
  }

  showModal(material: ICarrinhoModel, codCliente?, codEndereco?, codFormaPagamento?, freteConta?): void {
    this.loaderNavbar.emit(true);
    /* console.log('datos');  */
    this.cotacoesService
      .getMateriaisCombo(material.codEmpresa, material.codMaterial, codCliente, codEndereco, codFormaPagamento, freteConta)
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
              material: material,
              materialAssoc: response.data.map(function (el: any) {
                var o = Object.assign({}, el);
                o.checked = 0;
                return o;
              }),
            };

            this.modalService.show(
              ComercialCicloVendasCotacoesFormularioModalMaterialComboComponent,
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
