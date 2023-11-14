import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';``
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
  myForm: FormGroup;
  checkoutForm;

  constructor(
    private _BsModalRef: BsModalRef,
    private autorizacionService: ComercialCicloVendasAutorizacionesService, //de dataFromParent
    private pnotifyService: PNotifyService,
    private formBuilder: FormBuilder,

  ) {
    this.myForm = this.formBuilder.group({
    observacion: ['', Validators.required]  // inicializa con un valor por defecto y agrega validador
  });}
  dataForm: any;
  data: [];
  oferta: Array<any> = [];
  detalle: any[];
  observacion: string = '';
  loader: boolean = false;

  ngOnInit(): void {

    this.data = this.dataForm;
    this.detalle = this.dataForm.detalle;
    this.oferta = this.data['oferta'][0];

    if(this.oferta['estado'] > 1)
    {
        this.loader = true;
    }
    else
    {
      this.loader = false;
    }
  }


  cerrar(): void {
    this._BsModalRef.hide();
  }


  onClose() {
    this._BsModalRef.hide();
  }

  boton(id_autorizacion: number, estado: number) {
    const observacionValue = this.myForm.get('observacion').value;
    const params = {
      estado: estado,
      id_autorizacion: id_autorizacion,
      descripcion_usua: observacionValue
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
            this.onClose();
          } else {
            this.pnotifyService.error("No hay datos relacionado al valor introducido");
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
