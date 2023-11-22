import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { finalize } from 'rxjs/operators';
import { JsonResponse } from 'src/app/models/json-response';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { number } from 'ng-brazil/number/validator';

import { ComercialClientesPreCadastroService } from '../pre-cadastro/pre-cadastro.service';

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

    @Input() latitudPromedioContacto: number = 0;
    @Input() longitudPromedioContacto: number = 0;

    @Input() tipos_personas: any[];


    latitud: number = 0;
    longitud: number = 0;


    loaderNavbar: boolean;


    loaderFullScreen = true;
    form: FormGroup;
    checkoutForm;


    private coloresDisponibles: string[] = [
        'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FF0000',
        'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FC9F3A',
        'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FFFF00',
        'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|00FF00',
        'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FFFFFF',
    ];

    private coloresDisponiblesContacto: string[] = [
        'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FF0000',
        'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FC9F3A',
        'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FFFF00',
        'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|00FF00',
        'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FFFFFF',
    ];


    nuevoContacto = {
        contacto: '',
        nombres_contacto: '',
        apellido_contacto: '',
        direccion_contacto: '',
        celular_contacto: '',
        telefono_contacto: '',
        color: '',
    };

    nuevaDireccion = {
        ubicacion: '',
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
        private preCadastroService: ComercialClientesPreCadastroService,

    ) {
        this.form = this.formBuilder.group({
            //observacion: ['', Validators.required],
            codigo_cliente: [''],
            carnet: [''],
            nit: [''],
            nombre: [''],
            nombre_factura: [''],
            id_tipo_persona: [],
            email: [''],
            telefono: [''],
            celular: [''],
            id_rubro: [],
            id_tipo_cliente: [],
            id_vendedor: [''],
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
        this.categorizarContacto();
        if (this.latitudPromedio === null || this.latitudPromedio === undefined) {
            this.latitudPromedio = -17.7834799;
        }
        if (this.longitudPromedio === null || this.longitudPromedio === undefined) {
            this.longitudPromedio = -63.1819648;
        }
    }

    getVendedorNome(id_vendedor: number): string {
        if (isNaN(id_vendedor)) {
            return 'NO INFORMADO';
        }

        const vendedor = this.vendedoresList.find(v => v.id === id_vendedor);
        return vendedor ? vendedor.nome : 'NO INFORMADO';
    }


    agregarContacto() {
        console.log('aqui');
        if (this.datos_cliente.datos_contacto > 0) {
            if (this.datos_cliente.datos_contacto.length < 5) {
                this.datos_cliente.datos_contacto.push({ ...this.nuevoContacto });
                this.nuevoContacto = {
                    contacto: '',
                    nombres_contacto: '',
                    apellido_contacto: '',
                    direccion_contacto: '',
                    celular_contacto: '',
                    telefono_contacto: '',
                    color: this.generarColorAleatorioContacto()
                };
            }
        } else {
            this.datos_cliente.datos_contacto.push({ ...this.nuevoContacto });
            this.nuevoContacto = {
                contacto: '',
                nombres_contacto: '',
                apellido_contacto: '',
                direccion_contacto: '',
                celular_contacto: '',
                telefono_contacto: '',
                color: '',
            };
        }
        console.log(this.datos_cliente.datos_contacto)
    }

    categorizarUbicacion() {
        if (this.datos_cliente.datos_direccion && this.datos_cliente.datos_direccion.length > 0) {
            this.datos_cliente.datos_direccion.forEach((direccion) => {
                direccion['color'] = this.generarColorAleatorio();
            });
        }
    }

    categorizarContacto() {
        if (this.datos_cliente.datos_contacto && this.datos_cliente.datos_contacto.length > 0) {
            this.datos_cliente.datos_contacto.forEach((direccion) => {
                direccion['color'] = this.generarColorAleatorioContacto();
            });
        }
    }

    eliminarContacto(index: number) {
        this.datos_cliente.datos_contacto.splice(index, 1);
    }

    agregarUbicacion() {
        this.nuevaDireccion = {
            ubicacion: '',
            direccion: '',
            latitud: this.latitudPromedio,
            longitud: this.longitudPromedio,
            id_ciudad: '',
            color: this.generarColorAleatorio(),
        }

        if (this.datos_cliente.datos_direccion.length < 5) {
            this.datos_cliente.datos_direccion.push({ ...this.nuevaDireccion });
            this.nuevaDireccion = {
                ubicacion: '',
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

    generarColorAleatorioContacto(): string {
        console.log(this.coloresDisponiblesContacto)
        if (this.coloresDisponiblesContacto.length === 0) {
            return null;
        }

        const indiceAleatorio = Math.floor(Math.random() * this.coloresDisponiblesContacto.length);
        const colorAleatorio = this.coloresDisponiblesContacto.splice(indiceAleatorio, 1)[0];
        //console.log(colorAleatorio);
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

    actualizarMarcadorContacto(index: number, latitud, longitud): void {
        this.id_marcador = index;
        this.datos_cliente.datos_contacto[index].latitude_contacto = latitud;
        this.datos_cliente.datos_contacto[index].longitude_contacto = longitud;
    }
    actualizarUbicacion(index: number) {
        this.datos_cliente.datos_direccion[index].latitud = this.latitud;
        this.datos_cliente.datos_direccion[index].longitud = this.longitud;
    }

    actualizarMapa(event: any) {
        this.latitud = event.coords.lat;
        this.longitud = event.coords.lng;
        this.actualizarMarcador(this.id_marcador, this.latitud, this.longitud);
        this.actualizarDireccion(this.id_marcador, event);
    }

    actualizarMapaContacto(event: any) {
        this.latitud = event.coords.lat;
        this.longitud = event.coords.lng;
        this.actualizarMarcadorContacto(this.id_marcador, this.latitud, this.longitud);
        this.actualizarDireccionContacto(this.id_marcador, event);
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

    actualizarDireccionContacto(index, event: any) {
        this.obtenerDireccion(event.coords.lat, event.coords.lng)
            .then((direccion_mapa: string) => {
                this.datos_cliente.datos_contacto[index].direccion = direccion_mapa;
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

    actualizarCiudad(index: number, id_ciudad: number) {
        this.datos_cliente.datos_direccion[index].id_ciudad = id_ciudad
    }

    actualizarCliente() {
        // @ts-ignore: Ignorar error TS2339
        var idClienteInput = document.getElementById('id_cliente').value;
        // @ts-ignore: Ignorar error TS2339
        var codigoClienteInput = document.getElementById('codigo_cliente').value;
        // @ts-ignore: Ignorar error TS2339
        var ciInput = document.getElementById('carnet').value;
        // @ts-ignore: Ignorar error TS2339
        var nitInput = document.getElementById('nit').value;
        // @ts-ignore: Ignorar error TS2339
        var nombreInput = document.getElementById('nombre').value;
        // @ts-ignore: Ignorar error TS2339
        var nombreFacturaInput = document.getElementById('nombre_factura').value;
        // @ts-ignore: Ignorar error TS2339      
        var idTipoPersonaInput = document.getElementById('id_tipo_persona').value;
        // @ts-ignore: Ignorar error TS2339
        var emailInput = document.getElementById('email').value;
        // @ts-ignore: Ignorar error TS2339
        var telefonoInput = document.getElementById('telefono').value;
        // @ts-ignore: Ignorar error TS2339
        var celularInput = document.getElementById('celular').value;
        // @ts-ignore: Ignorar error TS2339
        var tipoClienteInput = document.getElementById('id_tipo_cliente').value;
        // @ts-ignore: Ignorar error TS2339
        var idVendedorInput = document.getElementById('id_vendedor').value;

        const ubicacion = this.datos_cliente.datos_direccion;
        const contactos = this.datos_cliente.datos_contacto
        const data = {
            'codigo_cliente': codigoClienteInput,
            'id_cliente': idClienteInput,
            'nit': nitInput,
            'ci': ciInput,
            'nombres': nombreInput,
            'tipo_pessoa': idTipoPersonaInput,
            'id_vendedor': idVendedorInput,
            'situacion': 1,
            'telefono': telefonoInput,
            'celular': celularInput,
            'nombre_factura': nombreFacturaInput,
            'email': emailInput,
            'id_tipo_cliente': tipoClienteInput,
            'ubicacion': ubicacion,
            'contactos': contactos
        };
        this.enviarPeticion(data);
    }

    enviarPeticion(data: any): void {
        this.preCadastroService
            .updateCliente(data)
            .pipe(
                finalize(() => {
                })
            )
            .subscribe(
                (response: JsonResponse) => {
                    if (response.codigoRespuesta == 200) {
                        setTimeout(() => {
                            this.pnotifyService.success('Cliente editado exitosamente');
                            this.onClose();

                        }, 200)
                        location.reload();
                    } else {
                        this.pnotifyService.error(response.mensagem);
                    }
                },
                (error: any) => {
                    this.pnotifyService.error(error.error.mensagem);
                }
            );
    }
}
