import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';``
import { BsModalRef } from 'ngx-bootstrap';
import { finalize } from 'rxjs/operators';
import { userInfo } from 'os';
import { ComercialCicloVendasAutorizacionesService } from '../../autorizaciones.service';
import { AuthService } from 'src/app/shared/services/core/auth.service';

import { JsonResponse } from 'src/app/models/json-response';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';


@Component({
  selector: 'modal-autorizacion',
  templateUrl: './modal-autorizacion.component.html',
  styleUrls: ['./modal-autorizacion.component.scss']
})
export class ModalAutorizacionComponent implements OnInit {
  private user = this.authService.getCurrentUser();
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
    private authService: AuthService,
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
  admin:  boolean = false;
  loading: boolean = false;
  observa1: boolean = false;

  ngOnInit(): void {
    this.data = this.dataForm;
    this.detalle = this.dataForm.detalle;
    this.oferta = this.data['oferta'][0];

    const observable1 = document.getElementById("observacion1") as HTMLTextAreaElement;
    const datosObservacion =  this.myForm.get('observacion')?.setValue(this.data['oferta'][0].desc_usuario);

    if(this.user.info.none_cargo === '1')
    {
      if(this.data['oferta'][0].desc_usuario !== null)
      {
        datosObservacion;
        observable1.disabled = true;
        this.admin = false;
      }
      else
      {
        this.admin = true; 
      }
    }
    else{
      datosObservacion;
      observable1.disabled = true;
    }

    if(this.oferta['estado'] == 10)
    {
        this.loader = false;
    }
    else
    {
        this.loader = true;
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
  
    // Iniciar loader y deshabilitar botones
    this.loader = true;
    this.loading = true;

    this.autorizacionService
      .updateAutorizacion(params)
      .pipe(
        finalize(() => {
          // Finalizar loader y habilitar botones
          this.loader = false;
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
    setTimeout(() => {
      this.loading = false;
    }, 8000)
  }

}
