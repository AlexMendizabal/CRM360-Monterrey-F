import { Injectable, EventEmitter } from '@angular/core';
import { finalize } from 'rxjs/operators';

// ngx-bootstrap
import { BsModalService } from 'ngx-bootstrap/modal';

// Components
import { ComercialCicloVendasCotacoesFormularioModalMaterialCalculoComponent } from './calculo.component';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialCicloVendasCotacoesService } from '../../../../cotacoes.service';

// Interfaces
import { ICarrinhoModel } from '../../../models/carrinho';
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialCicloVendasCotacoesFormularioModalMaterialCalculoService {
  loaderNavbar: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private modalService: BsModalService,
    private pnotifyService: PNotifyService,
    private cotacoesService: ComercialCicloVendasCotacoesService
  ) {
    this.pnotifyService.getPNotify();
  }

  showModal(index: number, material: ICarrinhoModel, codCliente?: number, codFormaPagamento?: number, codEndereco?: number ): void {
    this.loaderNavbar.emit(true);

    this.cotacoesService
      .getTipoCalculoMaterial(material.codMaterial, codFormaPagamento)
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
              index: index,
              material: material,
              tipoCalculo1: response.data.codTipoCalculo_1,
              nomeTipoCalculo1: response.data.nomeTipoCalculo_1,
              tipoCalculo2: response.data.codTipoCalculo_2,
              nomeTipoCalculo2: response.data.nomeTipoCalculo_2,
              tipoLancamento: response.data.codTipoLancamento_1,
              nomeTipoLancamento: response.data.nomeTipoLancamento_1,
              codCliente: codCliente,
              medida: response.data.medida,
              codEndereco: codEndereco,
              precio: material.precio,

            };
            //console.log(initialState)
            this.modalService.show(
              ComercialCicloVendasCotacoesFormularioModalMaterialCalculoComponent,
              Object.assign({}, modalConfig, {
                initialState,
              })
            );
          } else {
            this.pnotifyService.notice(response.mensagem);
          }
        },
        error: (error: any) => {
          this.pnotifyService.error();
        }
      });
  }
}
