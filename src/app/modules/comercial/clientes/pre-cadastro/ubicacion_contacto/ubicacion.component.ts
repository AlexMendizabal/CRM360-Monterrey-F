import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { EMPTY } from 'rxjs';

// ngx-bootstrap
import { BsModalRef } from 'ngx-bootstrap/modal';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';

// Interfaces
import { JsonResponse } from 'src/app/models/json-response';
import { finalize } from 'rxjs/operators';


@Component({
  selector: 'app-comercial-ciclo-vendas-cotacoes-precadastro-modal-ubicacion-contacto',
  templateUrl: './ubicacion.component.html',
  styleUrls: ['./ubicacion.component.scss']
})

export class PreCadastroUbicacionContactosComponent
  implements OnInit {
  
  @Input('tipo') tipo: number;
  @Input('index') index: number;
  @Input('latitud') latitud: number;
  @Input('longitud') longitud: number;
  @Input('latitud_inicial') latitud_inicial: number;
  @Input('longitud_inicial') longitud_inicial: number;

  @Output() latLngChanged = new EventEmitter<{ latitud: number, longitud: number, direccion: any, index: number, tipo:number }>();
  @Output() fecharModal = new EventEmitter();


  loaderModal: boolean;
  swDesactivarForm = true;
  form: FormGroup;

  tipoCalculo: number;
  descPreco: string;
  descQtde: string;

  currencyMaskOptions = {
    align: 'left',
    prefix: '',
    thousands: '.',
    decimal: ',',
    precision: 3,
  };

  opcoesVenda: Array<any> = [];
  arrayPresentacion: Array<any> = [];
  swPresentacion = false;
  id_presentacion: number = 0;

  direccion: string;
  direccion_mapa_act: string;
  showModal: boolean = true;
  showImpostos = false;

  constructor(
    private formBuilder: FormBuilder,
    private bsModalRef: BsModalRef,
    private pnotifyService: PNotifyService,
    private confirmModalService: ConfirmModalService,

  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit(): void {
    this.setFormBuilder();
  }

  setFormBuilder(): void {
    this.estadoMapa()
    this.form = this.formBuilder.group({
      latitud: [this.latitud],
      longitud: [this.longitud],
      direccion: [this.direccion],

    });
  }

  estadoMapa() {
    if (this.latitud === 0) {
      this.latitud = this.latitud_inicial;
    }
    if (this.longitud === 0 ) {
      this.longitud = this.longitud_inicial;
    }
  }

  actualizarMarcador(event: any) {
    this.latitud = event.coords.lat;
    this.longitud = event.coords.lng;
    this.form.controls['latitud'].setValue(this.latitud);
    this.form.controls['longitud'].setValue(this.longitud);
    this.actualizarDireccion(event);
  }
  actualizarDireccion(event: any) {
    this.obtenerDireccion(event.coords.lat, event.coords.lng)
      .then((direccion_mapa: string) => {
        this.direccion_mapa_act = direccion_mapa;
        this.form.controls['direccion'].setValue(direccion_mapa);
      })
      .catch((error: any) => {
        this.form.controls['direccion'].setValue(
          'Error al obtener la dirección'
        );
      });
  }
  public obtenerDireccion(latitud: number, longitud: number): Promise<string> {
    return fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitud},${longitud}&key=AIzaSyDl5b7STz9xYNDhybTTer2POVncX9FYqCc`
    )
      .then((response) => response.json())
      .then((data) => {
        const resultado = data.results[0];
        if (resultado) {
          return resultado.formatted_address;
        } else {
          return 'Dirección no encontrada';
        }
      })
      .catch((error) => {
        return 'Error al obtener la dirección';
      });
  }

  emitLatLng() {
    this.latLngChanged.emit({ latitud: this.latitud, 
      longitud: this.longitud, direccion: this.direccion_mapa_act, index: this.index, tipo: this.tipo });
    this.onClose();
  }
  onSubmit(): void {
    this.emitLatLng();
  }

  onClose(): void {
    this.fecharModal.emit(true);
  }
}
