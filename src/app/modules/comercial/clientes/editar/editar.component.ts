import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { finalize } from 'rxjs/operators';
import { JsonResponse } from 'src/app/models/json-response';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { number } from 'ng-brazil/number/validator';
import { ComercialClientesService } from 'src/app/modules/comercial/services/clientes.service';

import { ComercialClientesPreCadastroService } from '../pre-cadastro/pre-cadastro.service';

@Component({
  selector: 'editar-cliente',
  templateUrl: './editar.component.html',
  styleUrls: ['./editar.component.scss'],
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
  @Input() tipos_documentos: any[];

  @ViewChild('botonGuardar') botonGuardar: ElementRef;

  latitud: number = 0;
  longitud: number = 0;

  latitud_inicial: number;
  longitud_inicial: number;

  id_client: number = 0;

  loaderNavbar: boolean;

  loaderFullScreen = true;
  estados: { [key: number]: string } = {
    1: 'Activo',
    0: 'Inactivo',
  };
  isLoading = false;

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
    apellido2_contacto: '',
    direccion_contacto: '',
    celular_contacto: '',
    telefono_contacto: '',
    color: '',
    latitude_contacto: 0,
    longitude_contacto: 0,
  };

  nuevaDireccion = {
    ubicacion: '',
    direccion: '',
    latitud: 0,
    longitud: 0,
    id_ciudad: '',
    id_cliente: this.id_client,
    color: '',
  };

  constructor(
    private _BsModalRef: BsModalRef,
    private pnotifyService: PNotifyService,
    private formBuilder: FormBuilder,
    private preCadastroService: ComercialClientesPreCadastroService,
    private clientesService: ComercialClientesService
  ) {
    this.form = this.formBuilder.group({
      //observacion: ['', Validators.required],
      codigo_cliente: [null, Validators.required],
      tipo_documento: [null, Validators.required],
      numero_documento: [null, Validators.required],
      nombre: [null, Validators.required],
      nombre_factura: [null],
      razon_social: [null, Validators.required],
      id_tipo_persona: [],
      email: [null, Validators.required],
      telefono: [null, Validators.required],
      celular: [null, Validators.required],
      id_rubro: [],
      id_tipo_cliente: [],
      id_vendedor: [null, Validators.required],
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
    this.ciudadVendedor();
    console.log(this.datos_cliente.datos_cliente);
    this.id_client = this.datos_cliente.datos_cliente.id_cliente;

 
  }

  getVendedorNome(id_vendedor: number): string {
    if (isNaN(id_vendedor)) {
      return 'NO INFORMADO';
    }

    const vendedor = this.vendedoresList.find((v) => v.id === id_vendedor);
    return vendedor ? vendedor.nome : 'NO INFORMADO';
  }

  categorizarUbicacion() {
    if (
      this.datos_cliente.datos_direccion &&
      this.datos_cliente.datos_direccion.length > 0
    ) {
      this.datos_cliente.datos_direccion.forEach((direccion) => {
        direccion['color'] = this.generarColorAleatorio();
      });
    }
  }

  categorizarContacto() {
    if (
      this.datos_cliente.datos_contacto &&
      this.datos_cliente.datos_contacto.length > 0
    ) {
      this.datos_cliente.datos_contacto.forEach((direccion) => {
        direccion['color'] = this.generarColorAleatorioContacto();
      });
    }
  }

  ciudadVendedor() {
    /* console.log('aqui'); */
    // @ts-ignore: Ignorar error TS2339
    var idVendedorInput = this.datos_cliente.datos_cliente.id_vendedor;
    /*  console.log(idVendedorInput); */
    this.clientesService.getVendedorCiudad(idVendedorInput).subscribe(
      (response: any) => {
        if (response.responseCode === 200) {
          // console.log(response.result.latitud);
          this.latitud_inicial = response.result.latitud;
          this.longitud_inicial = response.result.longitud;

          if (
            this.latitudPromedio === null ||
            this.latitudPromedio === undefined ||
            this.latitudPromedio === 0
          ) {
            this.latitudPromedio = this.latitud_inicial;
          }
          if (
            this.longitudPromedio === null ||
            this.longitudPromedio === undefined ||
            this.longitudPromedio === 0
          ) {
            this.longitudPromedio = this.longitud_inicial;
          }

          if (
            this.latitudPromedioContacto === null ||
            this.latitudPromedioContacto === undefined ||
            this.latitudPromedioContacto === 0
          ) {
            this.latitudPromedioContacto = this.latitud_inicial;
          }
          if (
            this.longitudPromedioContacto === null ||
            this.longitudPromedioContacto === undefined ||
            this.longitudPromedioContacto === 0
          ) {
            this.longitudPromedioContacto = this.longitud_inicial;
          }
        } else {
          //this.handleFormFieldsError();
        }
      },
      (error) => {
        /*           console.error('Error al cargar dependencias:', error);
         */
        //this.handleFormFieldsError();
      }
    );
  }

  agregarUbicacion() {
   
    if (this.latitudPromedio > 0 && this.longitudPromedio > 0) {
      this.nuevaDireccion = {
        ubicacion: '',
        direccion: '',
        latitud: this.latitudPromedio,
        longitud: this.longitudPromedio,
        id_ciudad: '',
        id_cliente: this.id_client,
        color: this.generarColorAleatorio(),
      };
    } else {
      
      this.nuevaDireccion = {
        ubicacion: '',
        direccion: '',
        latitud: this.latitudPromedio,
        longitud: this.longitudPromedio,
        id_ciudad: '',
        id_cliente: this.id_client,
        color: this.generarColorAleatorio(),
      };
    }

    if (this.datos_cliente.datos_direccion.length < 5) {
      this.datos_cliente.datos_direccion.push({ ...this.nuevaDireccion });
      this.nuevaDireccion = {
        ubicacion: '',
        direccion: '',
        latitud: 0,
        longitud: 0,
        id_ciudad: '',
        id_cliente: this.id_client,
        color: '',
      };
    }
  }

  agregarContacto() {
    this.nuevoContacto = {
      contacto: '',
      nombres_contacto: '',
      apellido_contacto: '',
      apellido2_contacto: '',
      direccion_contacto: '',
      celular_contacto: '',
      telefono_contacto: '',
      latitude_contacto: this.latitudPromedioContacto,
      longitude_contacto: this.longitudPromedioContacto,
      color: this.generarColorAleatorioContacto(),
    };
    /* console.log('aqui'); */
    /* if (this.datos_cliente.datos_contacto > 0) { */
    if (this.datos_cliente.datos_contacto.length < 5) {
      this.datos_cliente.datos_contacto.push({ ...this.nuevoContacto });
      this.nuevoContacto = {
        contacto: '',
        nombres_contacto: '',
        apellido_contacto: '',
        apellido2_contacto: '',
        direccion_contacto: '',
        celular_contacto: '',
        telefono_contacto: '',
        latitude_contacto: 0,
        longitude_contacto: 0,
        color: '',
      };
    }
    /* } */
  }

  generarColorAleatorio(): string {
    if (this.coloresDisponibles.length === 0) {
      return null;
    }

    const indiceAleatorio = Math.floor(
      Math.random() * this.coloresDisponibles.length
    );
    const colorAleatorio = this.coloresDisponibles.splice(
      indiceAleatorio,
      1
    )[0];
    return colorAleatorio;
  }

  generarColorAleatorioContacto(): string {
    if (this.coloresDisponiblesContacto.length === 0) {
      return null;
    }

    const indiceAleatorio = Math.floor(
      Math.random() * this.coloresDisponiblesContacto.length
    );
    const colorAleatorio = this.coloresDisponiblesContacto.splice(
      indiceAleatorio,
      1
    )[0];
    //console.log(colorAleatorio);
    return colorAleatorio;
  }

  eliminarUbicacion(index: number) {
    this.coloresDisponibles.push(
      this.datos_cliente.datos_direccion[index].color
    );
    this.datos_cliente.datos_direccion.splice(index, 1);
  }

  eliminarContacto(index: number) {
    this.coloresDisponiblesContacto.push(
      this.datos_cliente.datos_contacto[index].color
    );
    this.datos_cliente.datos_contacto.splice(index, 1);
  }

  actualizarMarcador(index: number, latitud, longitud): void {
    this.id_marcador = index;
    /* this.latitud = latitud
    this.longitud = longitud; */
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
    this.actualizarMarcadorContacto(
      this.id_marcador,
      this.latitud,
      this.longitud
    );
    this.actualizarDireccionContacto(this.id_marcador, event);
  }

  actualizarDireccion(index, event: any) {
    this.obtenerDireccion(event.coords.lat, event.coords.lng)
      .then((direccion_mapa: string) => {
        this.datos_cliente.datos_direccion[index].direccion = direccion_mapa;
      })
      .catch((error: any) => {
        //console.log(error);
      });
  }

  actualizarDireccionContacto(index, event: any) {
    //console.log(this.datos_cliente);
    this.obtenerDireccion(event.coords.lat, event.coords.lng)
      .then((direccion_mapa: string) => {
        this.datos_cliente.datos_contacto[index].direccion_contacto =
          direccion_mapa;
      })
      .catch((error: any) => {
        //console.log(error);
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
          return resultado.formatted_address.substring(0, 49);
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
    this.datos_cliente.datos_direccion[index].id_ciudad = id_ciudad;
  }

  actualizarCliente() {
    var swContacto = false;
    var swDireccion = false;
    /*  console.log(this.datos_cliente.datos_direccion.lenght)
    console.log(this.datos_cliente.datos_contacto.lenght) */

    /*  if (
      this.datos_cliente.datos_direccion.length > 0 &&
      this.datos_cliente.datos_contacto.length > 0
    ) { */
    //console.log(this.datos_cliente.datos_direccion.lenght)
    if (this.datos_cliente.datos_direccion.length > 0) {
      const isIdCiudadRequired =
        this.datos_cliente.datos_direccion[0].id_ciudad !== null &&
        this.datos_cliente.datos_direccion[0].id_ciudad !== undefined &&
        this.datos_cliente.datos_direccion[0].id_ciudad !== '';

      const isDireccionValid = this.datos_cliente.datos_direccion.every(
        (direccion) => {
          // Verificar que la dirección y la ubicación no excedan los 50 caracteres
          const direccionValida =
            direccion.direccion === null ||
            direccion.direccion === undefined ||
            direccion.direccion.length <= 50;
          return direccionValida;
        }
      );

      const isUbicacionValid = this.datos_cliente.datos_direccion.every(
        (direccion) => {
          const ubicacionValida =
            direccion.ubicacion !== undefined &&
            direccion.ubicacion !== '';
          return ubicacionValida;
        }
      );

      if (isIdCiudadRequired) {
        if (isUbicacionValid) {
          if (isDireccionValid) {
            swDireccion = true;
          } else {
            this.pnotifyService.error(
              'La dirección no debe exceder los 50 caracteres ni ser numerica.'
            );
          }
        } else {
          this.pnotifyService.error(
            'El nombre de la ubicación es un campo obligatorio.'
          );
        }
      } else {
        this.pnotifyService.error(
          'Complete todos los campos requeridos de dirección.'
        );
      }
    } else {
      this.pnotifyService.error('Debe registrar al menos una dirección.');
    }

    const direccionContactoValido = this.datos_cliente.datos_contacto.every(
      (contacto) =>
        
        contacto.direccion_contacto === undefined ||
        (typeof contacto.direccion_contacto === 'string' &&
          contacto.direccion_contacto.length <= 50)
    );

    if (direccionContactoValido) {
      swContacto = true;
    } else {
      this.pnotifyService.error(
        'La dirección del contacto no debe exceder los 50 caracteres.'
      );
    }

    //console.log(this.datos_cliente.datos_direccion);

    if (swDireccion === true && swContacto === true) {
      this.prepararPeticion();
    }
    /* } else if (
      this.datos_cliente.datos_direccion.length > 0 &&
      this.datos_cliente.datos_contacto.length <= 0
    ) {
      this.pnotifyService.error(
        'Debe registrar al menos 1 contacto del cliente'
      );
    } else if (
      this.datos_cliente.datos_direccion.length <= 0 &&
      this.datos_cliente.datos_contacto.length > 0
    ) {
      this.pnotifyService.error(
        'Debe registrar al menos 1 dirección de cliente'
      );
    } else {
      this.pnotifyService.error(
        'Debe registrar al menos 1 contacto y 1 dirección de cliente'
      );
    } */
  }

  /* actualizarInput(form, value){
    form.control.get(form).setValue(value);

  }
 */
  prepararPeticion() {
    // @ts-ignore: Ignorar error TS2339
    var idClienteInput = document.getElementById('id_cliente').value;
    // @ts-ignore: Ignorar error TS2339
    var codigoClienteInput = document.getElementById('codigo_cliente').value;
    // @ts-ignore: Ignorar error TS2339
    var numero_documentoInput = document.getElementById('numero_documento').value;
    // @ts-ignore: Ignorar error TS2339
    var tipo_documentoInput = document.getElementById('tipo_documento').value;
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
    // @ts-ignore: Ignorar error TS2339
    var idRazonSocialInput = document.getElementById('razon_social').value;
    // @ts-ignore: Ignorar error TS2339
    var idRubroInput = document.getElementById('id_rubro').value;
    // @ts-ignore: Ignorar error TS2339
    var idEstadoInput = document.getElementById('id_estado').value;

    console.log(celularInput);
    const tipoPessoaOptions = {
      S: 'Sociedades',
      P: 'Privado',
      G: 'Gobierno',
      E: 'Empleado',
    };
    var tipoPersona = idTipoPersonaInput.trim().toUpperCase();
    const tipopersona = tipoPessoaOptions[tipoPersona];
    const ubicacion = this.datos_cliente.datos_direccion;
    const contactos = this.datos_cliente.datos_contacto;

    const data = {
      codigo_cliente: codigoClienteInput,
      id_cliente: idClienteInput,
      tipo_documento: tipo_documentoInput,
      numero_documento: numero_documentoInput,
      razon_social: idRazonSocialInput,
      nombres: nombreInput,
      tipo_pessoa: idTipoPersonaInput,
      tipo_persona: tipopersona,
      id_vendedor: idVendedorInput,
      situacion: 1,
      telefono: telefonoInput,
      celular: celularInput,
      nombre_factura: nombreFacturaInput,
      email: emailInput,
      id_tipo_cliente: tipoClienteInput,
      ubicacion: ubicacion,
      contactos: contactos,
      id_rubro: idRubroInput,
      id_estado: idEstadoInput,
      frontend: 1,
      ciudad: ubicacion[0]['ciudad']
    };

    console.log(data);

    // Especifica los campos requeridos
    const requiredFields = [
      'codigo_cliente',
      'id_cliente',
      'tipo_documento',
      'numero_documento',
      'razon_social',
      'nombres',
      'tipo_pessoa',
      'tipo_persona',
      'id_vendedor',
      'telefono',
      'celular',
      'ubicacion',
      'contactos',
    ];

    // Verifica si todos los campos requeridos tienen un valor válido
    const allFieldsFilled = requiredFields.every((field) => {
      const value = data[field];
      //console.log(value);
      return value !== null && value !== undefined && value !== '';
    });

    if (allFieldsFilled) {
      this.enviarPeticion(data);
    } else {
      this.pnotifyService.error(
        'Por favor, complete todos los campos requeridos.'
      );
    }
  }

  enviarPeticion(data: any): void {
    this.isLoading = true;
    this.botonGuardar.nativeElement.disabled = true;
    console.log();
    this.preCadastroService
      .updateCliente(data)
      .pipe(finalize(() => {}))
      .subscribe(
        (response: JsonResponse) => {
          this.isLoading = false;
          this.botonGuardar.nativeElement.disabled = false;
          if (response.CodigoRespuesta == 200) {
            setTimeout(() => {
              this.pnotifyService.success('Cliente editado exitosamente');
              this.onClose();
              location.reload();
            }, 200);
          } else {
            this.pnotifyService.error(response.Mensaje);
          }
        },
        (error: any) => {
          this.isLoading = false;
          this.botonGuardar.nativeElement.disabled = false;
          this.pnotifyService.error(error.error.mensagem);
        }
      );
  }
}
