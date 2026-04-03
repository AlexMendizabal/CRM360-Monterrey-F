import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';``
import { BsModalRef } from 'ngx-bootstrap';
import { finalize } from 'rxjs/operators';
import { Subject } from 'rxjs';
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
  submitForm: any;
  onUpdated: Subject<boolean> = new Subject();

  ngOnInit(): void {

    this.data = this.dataForm;
    this.detalle = this.dataForm.detalle;
    // this.oferta = this.data['oferta'][0];


// Si observacion esta vacia y el usuario logeado es administrador 
// debe habilitarse el campo "observable1" para poder editar
// 

    const observable1 = document.getElementById("observacion1") as HTMLTextAreaElement;
    const datosObservacion =  this.myForm.get('observacion')?.setValue(this.data['oferta'][0].desc_usuario);
    this.oferta = this.data['oferta'][0]; 

    const id_cargo = this.user.info.none_cargo;
    const cargos = ['1','2', '3', '4', '12'];

    if (cargos.includes(id_cargo)) {
      if (this.data['oferta'].length > 0) {
        datosObservacion;
        observable1.disabled = false;
        this.admin = true;
        
      } else {
        this.admin = false;
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
  calcularTotalCantidad(): number {
    if (this.data && this.detalle) {
      return this.detalle.reduce((acc, item) => acc + (parseFloat(item.cantidad_total) || 0), 0);
    }
    return 0;
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
            this.onUpdated.next(true);
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
