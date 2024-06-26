import { Injectable, EventEmitter } from '@angular/core';
import { finalize } from 'rxjs/operators';

// ngx-bootstrap
import { BsModalService } from 'ngx-bootstrap/modal';

// Components
import { ComercialCicloVendasCotacoesFormularioModalFinalizacaoPadraoComponent } from './padrao/padrao.component';
import { ComercialCicloVendasCotacoesFormularioModalFinalizacaoPerdidaComponent } from './perdida/perdida.component';
import { ComercialCicloVendasCotacoesFormularioModalFinalizacaoFinalizacion } from './finalizacion/finalizacion.component';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialCicloVendasCotacoesService } from '../../../cotacoes.service';

// Interfaces
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialCicloVendasCotacoesFormularioModalFinalizacaoService {
  loaderNavbar: EventEmitter<boolean> = new EventEmitter();
  private eventDirty: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private modalService: BsModalService,
    private pnotifyService: PNotifyService,
    private cotacoesService: ComercialCicloVendasCotacoesService
  ) {
    this.pnotifyService.getPNotify();
  }

  sendCotacao(dataCotacao: any): void {
    this.loaderNavbar.emit(true);

    this.cotacoesService
      .postCotacao(dataCotacao)
      .pipe(
        finalize(() => {
          this.loaderNavbar.emit(false);
        })
      )
      .subscribe(
        (response: JsonResponse) => {
          this.eventDirty.emit(true)
          if (response.success === true) {
            dataCotacao.carrinho = [];
            dataCotacao.carrinho = response.data;
            setTimeout(()=>{
              if (dataCotacao.situacao.codTipoFinalizacao === 1) {
                this.showModal(
                  ComercialCicloVendasCotacoesFormularioModalFinalizacaoPerdidaComponent,
                  dataCotacao
                );
              } else {
                this.showModal(
                  ComercialCicloVendasCotacoesFormularioModalFinalizacaoPadraoComponent,
                  dataCotacao
                );
              }
            }, 200)
          } else {
            this.pnotifyService.error(response.mensagem);
          }
        },
        (error: any) => {
          this.pnotifyService.error(error.error.mensagem);
        }
      );
  }

  sendCotizacion(dataCotacao: any): void{
    this.loaderNavbar.emit(true);
    console.log("al final: ",dataCotacao);
    this.cotacoesService
      .postCotizacion(dataCotacao)
      .pipe(
        finalize(() => {
          this.loaderNavbar.emit(false);
        })
      )
      .subscribe(
        (response: JsonResponse) => {
              this.eventDirty.emit(true)
          // @ts-ignore: Ignorar error TS2339
          if (response.success == true) {
         /*     dataCotacao.carrinho = [];
            dataCotacao.carrinho = response.data; */
            console.log('datos del post oferta', response);
            dataCotacao['id_oferta'] = response['data'];
            this.showModal(
              ComercialCicloVendasCotacoesFormularioModalFinalizacaoFinalizacion,
              dataCotacao
            );
            /* setTimeout(()=>{
               if (dataCotacao.id_oferta.codTipoFinalizacao >0) {
                this.showModal(
                  ComercialCicloVendasCotacoesFormularioModalFinalizacaoPerdidaComponent,
                  dataCotacao
                );
              } else { 
                //aqui va el modal de finalizar en la otra version
               } 
            }, 200) */
          } else {
            this.pnotifyService.error(response.mensagem);
          }
        },
        (error: any) => {
          this.pnotifyService.error(error.error.mensagem);
        }
      );
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

  makeFormAsDirty(){

    return this.eventDirty;
  }
}
