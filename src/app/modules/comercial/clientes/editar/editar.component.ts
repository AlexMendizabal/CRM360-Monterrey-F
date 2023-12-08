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

  @ViewChild('botonGuardar') botonGuardar: ElementRef;

  latitud: number = 0;
  longitud: number = 0;

  latitud_inicial: number;
  longitud_inicial: number;

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
      carnet: [null, Validators.required],
      nit: [null, Validators.required],
      nombre: [null, Validators.required],
      nombre_factura: [null, Validators.required],
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

    //console.log(this.latitudPromedio)
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
    this.nuevaDireccion = {
      ubicacion: '',
      direccion: '',
      latitud: this.latitudPromedio,
      longitud: this.longitudPromedio,
      id_ciudad: '',
      color: this.generarColorAleatorio(),
    };

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
        console.log(error);
      });
  }

  actualizarDireccionContacto(index, event: any) {
    console.log(this.datos_cliente);
    this.obtenerDireccion(event.coords.lat, event.coords.lng)
      .then((direccion_mapa: string) => {
        this.datos_cliente.datos_contacto[index].direccion_contacto =
          direccion_mapa;
      })
      .catch((error: any) => {
        console.log(error);
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
    this.datos_cliente.datos_direccion[index].id_ciudad = id_ciudad;
  }

  actualizarCliente() {
    var swContacto = false;
    var swDireccion = false;
    /*  console.log(this.datos_cliente.datos_direccion.lenght)
    console.log(this.datos_cliente.datos_contacto.lenght) */

    if (
      this.datos_cliente.datos_direccion.length > 0 &&
      this.datos_cliente.datos_contacto.length > 0
    ) {
      const allFieldsFilledExceptIdContacto =
        this.datos_cliente.datos_contacto.every((contacto) => {
          // Verificar que todos los campos, excepto id_contacto, en cada objeto estén llenos
          const fieldsToCheck = Object.keys(contacto).filter(
            (key) => key !== 'id_contacto'
          );
          return fieldsToCheck.every(
            (key) =>
              contacto[key] !== null &&
              contacto[key] !== undefined &&
              contacto[key] !== ''
          );
        });
      /* console.log(allFieldsFilledExceptIdContacto);
      console.log(this.datos_cliente.datos_contacto); */

      if (allFieldsFilledExceptIdContacto) {
        swContacto = true;
      } else {
        this.pnotifyService.error(
          'Complete todos los campos requeridos de contacto'
        );
      }

      console.log(this.datos_cliente.datos_direccion);
      const allFieldsFilledInDatosDireccion =
        this.datos_cliente.datos_direccion.every((direccion) => {
          // Verificar que todos los campos en cada objeto estén llenos
          return Object.keys(direccion).every(
            (key) =>
              direccion[key] !== null &&
              direccion[key] !== undefined &&
              direccion[key] !== ''
          );
        });
      if (allFieldsFilledInDatosDireccion) {
        swDireccion = true;
      } else {
        this.pnotifyService.error(
          'Complete todos los campos requeridos de dirección'
        );
      }
      if (swDireccion === true && swContacto === true) {
        this.prepararPeticion();
      }
    } else if (
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
      this.pnotifyService.error('Debe registrar al menos 1 dirección de cliente');
    } else {
      this.pnotifyService.error(
        'Debe registrar al menos 1 contacto y 1 dirección de cliente'
      );
    }
  }

  prepararPeticion() {
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
    // @ts-ignore: Ignorar error TS2339
    var idRazonSocialInput = document.getElementById('razon_social').value;
    // @ts-ignore: Ignorar error TS2339
    var idRubroInput = document.getElementById('id_rubro').value;
    // @ts-ignore: Ignorar error TS2339
    var idEstadoInput = document.getElementById('id_estado').value;
    const tipoPessoaOptions = {
      S: 'Sociedades',
      P: 'Privado',
      G: 'Gobierno',
      E: 'Empleado',
    };

    const tipopersona = tipoPessoaOptions[idTipoPersonaInput];
    const ubicacion = this.datos_cliente.datos_direccion;
    const contactos = this.datos_cliente.datos_contacto;

    const data = {
      codigo_cliente: codigoClienteInput,
      id_cliente: idClienteInput,
      nit: nitInput,
      ci: ciInput,
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
    };
    const allFieldsFilled = Object.values(data).every((value) => {
      return value !== null && value !== undefined && value !== '';
    });

    if (allFieldsFilled) {
      this.enviarPeticion(data);
    } else {
      this.pnotifyService.error(
        'Porfavor complete todos los campos requeridos.'
      );
    }
  }

  enviarPeticion(data: any): void {
    this.isLoading = true;
    this.botonGuardar.nativeElement.disabled = true;
    this.preCadastroService
      .updateCliente(data)
      .pipe(finalize(() => {}))
      .subscribe(
        (response: JsonResponse) => {
          this.isLoading = false;
          this.botonGuardar.nativeElement.disabled = false;
          if (response.response == 200) {
            setTimeout(() => {
              this.pnotifyService.success('Cliente editado exitosamente');
              this.onClose();
            }, 200);
            location.reload();
          } else {
            this.pnotifyService.error(response.detalle);
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
