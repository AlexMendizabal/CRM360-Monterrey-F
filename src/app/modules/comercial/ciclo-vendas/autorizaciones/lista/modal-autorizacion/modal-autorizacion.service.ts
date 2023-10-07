import { Injectable, EventEmitter } from '@angular/core';
import { finalize } from 'rxjs/operators';

// ngx-bootstrap
import {BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

//components
import { ModalAutorizacionComponent } from './modal-autorizacion.component';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialCicloVendasAutorizacionesService } from '../../autorizaciones.service';
import { ComercialCicloVendasCotacoesListaComponent } from '../lista.component'

// Interfaces
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root'
})
export class ModalAutorizacionService {
  loaderNavbar: EventEmitter<boolean> = new EventEmitter();
  datos_autorizacion: any = [];
  itemsPerPage = 50;

  constructor(
    private modalAutorizacionService: BsModalService,
    private pnotifyService: PNotifyService,
    private autorizacionService: ComercialCicloVendasAutorizacionesService
  ) {
    this.pnotifyService.getPNotify();
  }

  showModal(id_autorizacion): void{
    //console.log("modal ",id_autorizacion);
    this.loaderNavbar.emit(true);
    this.autorizacionService
    .traerAutorizacion(id_autorizacion)
    .pipe(
      finalize(() => {
        this.loaderNavbar.emit(false);
      })
    )     
     .subscribe({
      next: (response: JsonResponse) => {
        if (response.success === true) {
          //console.log(this.datos_autorizacion);

          const modalConfig = {
            animated: false,
            class: 'modal-lg',
            ignoreBackdropClick: true,
            keyboard: false,
          };
          
          this.modalAutorizacionService.show( ModalAutorizacionComponent,{
            initialState: { dataForm: response.data},
          });
        } else {
          this.pnotifyService.error();
        }
      },
      error: (error: any) => {
        this.pnotifyService.error();
      }
    });
  }

  modificarBoton(){
    
  }

  modificarAutorizacion(params: any){
    //this.id_oferta = this.data.id_oferta;
  }
}
