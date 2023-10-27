import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { finalize } from 'rxjs/operators';
import { JsonResponse } from 'src/app/models/json-response';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { number } from 'ng-brazil/number/validator';


@Component({
    selector: 'editar-cliente',
    templateUrl: './editar.component.html',
    styleUrls: ['./editar.component.scss']
})
export class EditarClienteComponent implements OnInit {
    @Output() fecharModal = new EventEmitter();
    @Input() datos_cliente: any;

    @Input() vendedoresList: any[];
    @Input() tipos_clientes: any[];

    @Input() cnaes: any[];
    @Input() ciudades: any[];

    @Input() latitudPromedio: number = 0;
    @Input() longitudPromedio: number = 0;


    latitud: number = 0;
    longitud: number = 0;


    loaderNavbar: boolean;


    loaderFullScreen = true;
    myForm: FormGroup;
    checkoutForm;


    private coloresDisponibles: string[] = [
        'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FF0000',
        'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FC9F3A',
        'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FFFF00',
        'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|00FF00',
        'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FFFFFF',
    ];


    nuevoContacto = {
        titulo: '',
        nombre: '',
        direccion: '',
        celular: '',
        telefono: ''
    };

    nuevaDireccion = {
        titulo: '',
        direccion: '',
        latitud: 0,
        longitud: 0,
        id_ciudad: '',
        color: '',
    };


    constructor(
        private _BsModalRef: BsModalRef,
        private pnotifyService: PNotifyService,
        private formBuilder: FormBuilder,

    ) {
        this.myForm = this.formBuilder.group({
            observacion: ['', Validators.required]   // inicializa con un valor por defecto y agrega validador
        });
    }



    dataForm: any;
    data: [];
    oferta: Array<any> = [];
    detalle: any[];
    observacion: string = '';
    id_marcador: number = 0;


    ngOnInit(): void {
        this.categorizarUbicacion();
        /* //this.data[0] = this.dataForm;
        this.data = this.dataForm;
        this.detalle = this.dataForm.detalle; */
    }

    getVendedorNome(id_vendedor: number): string {
        if (isNaN(id_vendedor)) {
            return 'NO INFORMADO';
        }

        const vendedor = this.vendedoresList.find(v => v.id === id_vendedor);
        return vendedor ? vendedor.nome : 'NO INFORMADO';
    }

    agregarContacto() {
        if (this.datos_cliente.datos_contacto.length < 5) {
            this.datos_cliente.datos_contacto.push({ ...this.nuevoContacto });
            this.nuevoContacto = {
                titulo: '',
                nombre: '',
                direccion: '',
                celular: '',
                telefono: ''
            };
        }
    }

    categorizarUbicacion() {
        this.datos_cliente.datos_direccion.forEach((direccion) => {
            direccion['color'] = this.generarColorAleatorio();
        });
    }

    eliminarContacto(index: number) {
        this.datos_cliente.datos_contacto.splice(index, 1);
    }

    agregarUbicacion() {
        this.nuevaDireccion = {
            titulo: '',
            direccion: '',
            latitud: this.latitudPromedio,
            longitud: this.longitudPromedio,
            id_ciudad: '',
            color: this.generarColorAleatorio(),
        }

        if (this.datos_cliente.datos_direccion.length < 5) {
            this.datos_cliente.datos_direccion.push({ ...this.nuevaDireccion });
            this.nuevaDireccion = {
                titulo: '',
                direccion: '',
                latitud: 0,
                longitud: 0,
                id_ciudad: '',
                color: '',
            };
        }
    }

    generarColorAleatorio(): string {
        if (this.coloresDisponibles.length === 0) {
            return null;
        }

        const indiceAleatorio = Math.floor(Math.random() * this.coloresDisponibles.length);
        const colorAleatorio = this.coloresDisponibles.splice(indiceAleatorio, 1)[0];
        return colorAleatorio;
    }

    eliminarUbicacion(index: number) {
        this.coloresDisponibles.push(this.datos_cliente.datos_direccion[index].color);
        this.datos_cliente.datos_direccion.splice(index, 1);
    }

    actualizarMarcador(index: number, latitud, longitud): void {
        this.id_marcador = index;
        this.datos_cliente.datos_direccion[index].latitud = latitud;
        this.datos_cliente.datos_direccion[index].longitud = longitud;
    }
    actualizarUbicacion(index: number) {
        console.log(this.datos_cliente.datos_direccion[index])
        this.datos_cliente.datos_direccion[index].latitud = this.latitud;
        this.datos_cliente.datos_direccion[index].longitud = this.longitud;
    }

    actualizarMapa(event: any) {
        this.latitud = event.coords.lat;
        this.longitud = event.coords.lng;
        this.actualizarMarcador(this.id_marcador, this.latitud, this.longitud);
        this.actualizarDireccion(this.id_marcador, event);

    }

    actualizarDireccion(index, event: any) {
        this.obtenerDireccion(event.coords.lat, event.coords.lng)
            .then((direccion_mapa: string) => {
                this.datos_cliente.datos_direccion[index].direccion = direccion_mapa;
            })
            .catch((error: any) => {
                /*  this.form.controls['direccion'].setValue(
                    'Error al obtener la dirección'
                 ); */
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

    onClose(): void {
        this.fecharModal.emit(true);
    }


}
