import { Injectable, EventEmitter } from '@angular/core';
import { finalize } from 'rxjs/operators';

// ngx-bootstrap
import { BsModalService } from 'ngx-bootstrap/modal';

// Components
import { ComercialCicloVendasCotacoesFormularioModalDuplicatasComponent } from './duplicatas.component';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialCicloVendasAutorizacionesService } from '../../../autorizaciones.service';

// Interfaces
import { ICarrinhoModel } from '../../models/carrinho';
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialCicloVendasCotacoesFormularioModalDuplicatasService {
  loaderNavbar: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private modalService: BsModalService,
    private pnotifyService: PNotifyService,
    private cotacoesService: ComercialCicloVendasAutorizacionesService
  ) {
    this.pnotifyService.getPNotify();
  }

  geraDuplicatas(
    codCotacao: number,
    codEmpresa: number,
    codFormaPagamento: number,
    podeEditarDuplicata: boolean,
    valorProposta: number,
    valorIcmsSt: number
  ): void {
    this.loaderNavbar.emit(true);

    this.cotacoesService
      .postGerarDuplicatas({
        codCotacao,
        codEmpresa,
        codFormaPagamento,
        valorProposta,
        valorIcmsSt
      })
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.success === true) {
            this.showModal(
              codCotacao,
              codEmpresa,
              codFormaPagamento,
              podeEditarDuplicata,
              valorProposta,
              valorIcmsSt);
          } else {
            this.pnotifyService.notice(response.mensagem);
          }
        },
        error: (error: any) => {
          if (error['error'].hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
      });
  }

  showModal(codCotacao: number,
    codEmpresa: number,
    codFormaPagamento: number,
    podeEditarDuplicata: boolean,
    valorProposta: number,
    valorIcmsSt: number
  ): void {
    this.cotacoesService
    .getDuplicatas({
      codCotacao,
      codEmpresa
    })
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
            ignoreBackdropClick: true,
          };

          const initialState = {
            codCotacao,
            codEmpresa,
            codFormaPagamento,
            podeEditarDuplicata,
            valorProposta,
            valorIcmsSt,
            duplicatas: response.data,
          };

          this.modalService.show(
            ComercialCicloVendasCotacoesFormularioModalDuplicatasComponent,
            Object.assign({}, modalConfig, {
              initialState,
            })
          );
        } else {
          this.pnotifyService.notice(response.mensagem);
        }
      },
      error: (error: any) => {
        if (error['error'].hasOwnProperty('mensagem')) {
          this.pnotifyService.error(error.error.mensagem);
        } else {
          this.pnotifyService.error();
        }
      }
    });

  }


}
