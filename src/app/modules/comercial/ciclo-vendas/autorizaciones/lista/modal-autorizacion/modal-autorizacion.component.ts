import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { finalize } from 'rxjs/operators';

import { ComercialCicloVendasAutorizacionesService } from '../../autorizaciones.service';

import { JsonResponse } from 'src/app/models/json-response';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

@Component({
  selector: 'modal-autorizacion',
  templateUrl: './modal-autorizacion.component.html',
  styleUrls: ['./modal-autorizacion.component.scss']
})
export class ModalAutorizacionComponent implements OnInit {
  loaderNavbar: boolean;
  loaderFullScreen = true;
  datosAutorizacion: any = {};
  checkoutForm;

  constructor(
    private _BsModalRef: BsModalRef,

    private autorizacionService: ComercialCicloVendasAutorizacionesService, //de dataFromParent
    private pnotifyService: PNotifyService,


  ) { }
  dataForm: any;
  data: [];
  oferta: Array<any> = [];
  detalle: any[];
  observacion: string = '';

  ngOnInit(): void {
    //this.data[0] = this.dataForm;
    this.data = this.dataForm;
    this.detalle = this.dataForm.detalle;
  }

  cerrar(customerData): void {
    const observacion = (document.getElementById('observacion') as HTMLInputElement).value;
    //alert(observacion);
    //observacion.required;
    if (observacion !== '') {
      const rechazar = document.getElementById('rechazado') as HTMLButtonElement;
      rechazar.disabled = false;
    }
  }

  boton(id_autorizacion: number, estado: number) {
    var observacion = document.getElementById('observacion');
    const params = {
      estado: estado,
      id_autorizacion: id_autorizacion,
      descripcion_usua: observacion.value
    };

    this.loaderNavbar = true;
    this.autorizacionService
      .updateAutorizacion(params)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe(
        (response: JsonResponse) => {
          if (response.success === true) {
            this.pnotifyService.success("Operación exitosa");
          } else {
            this.pnotifyService.error();
          }
        },
        (error: any) => {
          if (error.error.hasOwnProperty('mensage')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
      );
  }
}
