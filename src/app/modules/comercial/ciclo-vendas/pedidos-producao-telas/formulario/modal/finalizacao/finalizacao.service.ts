import { ComercialCicloVendasPedidosProducaoTelasService } from './../../../pedidos-producao-telas.service';
import { Injectable, EventEmitter } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { Location } from '@angular/common';

// ngx-bootstrap
import { BsModalService } from 'ngx-bootstrap/modal';

// Components
import { ComercialCicloVendasPedidosProducaoTelasFormularioModalFinalizacaoPadraoComponent } from './padrao/padrao.component';
import { ComercialCicloVendasPedidosProducaoTelasFormularioModalFinalizacaoPerdidaComponent } from './perdida/perdida.component';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

// Interfaces
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialCicloVendasPedidosProducaoTelasFormularioModalFinalizacaoService {
  loaderNavbar: EventEmitter<boolean> = new EventEmitter();

  action: string;

  constructor(
    private modalService: BsModalService,
    private pnotifyService: PNotifyService,
    private cotacoesService: ComercialCicloVendasPedidosProducaoTelasService
  ) {
    this.pnotifyService.getPNotify();
  }

  sendCotacao(dataCotacao: any): void {
    this.loaderNavbar.emit(true);

    if (this.action === 'update') {
    }


    this.cotacoesService
      .postCotacao(dataCotacao)
      .pipe(
        finalize(() => {
          this.loaderNavbar.emit(false);
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.success === true) {
            dataCotacao.carrinho = [];
            dataCotacao.carrinho = response.data;

            if (dataCotacao.situacao.codTipoFinalizacao === 1) {
              this.showModal(
                ComercialCicloVendasPedidosProducaoTelasFormularioModalFinalizacaoPerdidaComponent,
                dataCotacao
              );
            } else {
              this.showModal(
                ComercialCicloVendasPedidosProducaoTelasFormularioModalFinalizacaoPadraoComponent,
                dataCotacao
              );
            }
          } else {
            this.pnotifyService.error();
          }
        },
        error: (error: any) => {
          this.pnotifyService.error();
        }
      });
  }

  showModal(component: any, dataCotacao: Object): void {
    const modalConfig = {
      animated: false,
      class: 'modal-xl',
      keyboard: false,
      ignoreBackdropClick: true,
    };

    const initialState = {
      dataCotacao: dataCotacao,
    };

    this.modalService.show(
      component,
      Object.assign({}, modalConfig, {
        initialState,
      })
    );
  }
}
