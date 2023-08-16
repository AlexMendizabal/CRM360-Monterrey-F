import { Injectable, EventEmitter } from '@angular/core';
import { finalize } from 'rxjs/operators';

// ngx-bootstrap
import { BsModalService } from 'ngx-bootstrap/modal';

// Components
import { ComercialCicloVendasCotacoesFormularioModalMaterialSimilaridadeComponent } from './similaridade.component';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialCicloVendasCotacoesService } from '../../../../cotacoes.service';

// Interfaces
import { JsonResponse } from 'src/app/models/json-response';
import { IMateriaisModel } from '../../../models/materiais';
import { ISimilaridadeModel } from '../../../models/similaridade';

@Injectable({
  providedIn: 'root',
})
export class ComercialCicloVendasCotacoesFormularioModalMaterialSimilaridadeService {
  loaderNavbar: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private modalService: BsModalService,
    private pnotifyService: PNotifyService,
    private cotacoesService: ComercialCicloVendasCotacoesService
  ) {
    this.pnotifyService.getPNotify();
  }

  showModal(material: IMateriaisModel, codCliente , codEndereco, codFormaPagamento, freteConta): void {
    this.loaderNavbar.emit(true);

    this.cotacoesService
    // @ts-ignore: Ignorar error TS2339
      .getSimilaridadeMaterial(material.codEmpresa, material.codMaterial, codCliente, codEndereco, codFormaPagamento, freteConta)
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
              title: material.nomeMaterial,
              materiais: response.data.map((material: ISimilaridadeModel) => {
                let o = Object.assign({}, material);
                o.onCarrinho = false;
                return o;
              }),
            };

            this.modalService.show(
              ComercialCicloVendasCotacoesFormularioModalMaterialSimilaridadeComponent,
              Object.assign({}, modalConfig, {
                initialState,
              })
            );
          } else {
            this.pnotifyService.notice('Nenhuma similaridade encontrada.');
          }
        },
        error: (error: any) => {
          this.pnotifyService.error();
        }
      });
  }
}
