import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { finalize } from 'rxjs/operators';
import { ComercialCicloVendasAutorizacionesService } from '../../autorizaciones.service';
import { JsonResponse } from 'src/app/models/json-response';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { FormGroup, FormControl } from '@angular/forms'; // Importa FormGroup y FormControl

@Component({
  selector: 'modal-autorizacion',
  templateUrl: './modal-autorizacion.component.html',
  styleUrls: ['./modal-autorizacion.component.scss']
})
export class ModalAutorizacionComponent implements OnInit {
  loaderNavbar: boolean;
  loaderFullScreen = true;
  datosAutorizacion: any = {};
  checkoutForm: FormGroup; // Declarar checkoutForm como un FormGroup

  constructor(
    private _BsModalRef: BsModalRef,
    private autorizacionService: ComercialCicloVendasAutorizacionesService,
    private pnotifyService: PNotifyService,
  ) { }

  dataForm: any;
  data: [];
  observacion: string = '';

  ngOnInit(): void {
    this.data = this.dataForm;

    // Inicializa checkoutForm en el constructor o en el método ngOnInit
    this.checkoutForm = new FormGroup({
      firstName: new FormControl()
    });
  }

  cerrar(customerData): void {
    const observacion = (document.getElementById('observacion') as HTMLInputElement).value;

    if (observacion !== '') {
      const rechazar = document.getElementById('rechazado') as HTMLButtonElement;
      rechazar.disabled = false;
    }
  }
}
