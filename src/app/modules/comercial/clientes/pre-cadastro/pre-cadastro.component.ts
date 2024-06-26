import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  TemplateRef,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  FormArray,
  AbstractControl,
} from '@angular/forms';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

// ngx-bootstrap
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

// ng-brazil
import { MASKS, NgBrazilValidators } from 'ng-brazil';

// Interfaces
import { IFormCanDeactivate } from 'src/app/guards/iform-candeactivate';
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';

// Services
import { ComercialClientesPreCadastroService } from './pre-cadastro.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialClientesService } from 'src/app/modules/comercial/services/clientes.service';
import { CnpjService } from 'src/app/shared/services/ws/cnpj.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { FunctionsService } from 'src/app/shared/services/core/functions.service';
import { array } from '@amcharts/amcharts4/core';
import { number } from 'ng-brazil/number/validator';
import { PreCadastroUbicacionContactosService } from './ubicacion_contacto/ubicacion.service';
import { NotificacionesService } from '../../../../core/header/notificaciones/notificaciones.service';


@Component({
  selector: 'comercial-clientes-pre-cadastro',
  templateUrl: './pre-cadastro.component.html',
  styleUrls: ['./pre-cadastro.component.scss'],
})
export class ComercialClientesPreCadastroComponent
  implements OnInit, IFormCanDeactivate
{
  @ViewChild('modalDetalhesCliente', {}) modalDetalhesCliente: TemplateRef<any>;

  modalRef: BsModalRef;
  modalConfig = {
    ignoreBackdropClick: true,
  };

  loaderFullScreen = true;
  loaderNavbar = false;

  breadCrumbTree: Array<Breadcrumb> = [
    {
      descricao: 'Home',
      routerLink: '/comercial/home',
    },
    {
      descricao: 'Busqueda de clientes',
      routerLink: '/comercial/clientes',
    },
    {
      descricao: 'Registro',
    },
  ];

  public MASKS = MASKS;

  vendedores: any = [];
  cnaes: any = [];

  id_vend: number = 0;

  form: FormGroup;
  formChanged = false;
  tipoPessoa: any = {};
  tipos_personas: any = [];
  tipos_documentos: any = [];
  submittingForm = false;
  latitud: number = 0;
  longitud: number = 0;
  swActivarLatitud: boolean = false;
  maxLengthRules: any = {
    ci: 12,
  };
  maxLengthMessages: any = {};
  id_marcador: number = 0;
  disabled_form: boolean = true;

  dadosCliente: any = {};
  ciudades: any = [];

  tipos_clientes: any = [];
  index_array_ubicacion: number = 0;
  titulo_ubicacion_array: string = '';
  direccion_ubicacion_array: string = '';

  id_ciudad: number = 0;

  index_array_contactos: number = 0;
  titulo_contacto_array: string = '';
  nombre_contacto_array: string = '';
  apellido_p_contacto_array: string = '';
  apellido_m_contacto_array: string = '';
  telefono_contacto_array: string = '';
  celular_contacto_array: string = '';
  direccion_contacto_array: string = '';
  latitud_contacto_array: number = 0;
  longitud_contacto_array: number = 0;

  direccion_mapa: string = '';
  tipo_peticion: number = 0;

  latitud_inicial: number = 0;
  longitud_inicial: number = 0;

  ubicacionCollapse: boolean = false; // Inicialmente oculto
  contactoCollapse: boolean = false; // Inicialmente oculto

  ubicacionFormularios: any[] = [];
  contactoFormularios: any[] = [];
  formObj: FormGroup;
  formObjArray: any[] = [];
  ubicaciones: any[] = [];

  notificaciones: any = [];

  indice: number = 0;
  //bloquearSeleccion: boolean = true;
  ciudad_vendedor: number = 0;
  private coloresDisponibles: string[] = [
    'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FF0000',
    'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FC9F3A',
    'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FFFF00',
    'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|00FF00',
    'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FFFFFF',
  ];

  constructor(
    private preCadastroService: ComercialClientesPreCadastroService,
    private formBuilder: FormBuilder,
    private location: Location,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private clientesService: ComercialClientesService,
    private pnotifyService: PNotifyService,
    private cnpjService: CnpjService,
    private atividadesService: AtividadesService,
    private titleService: TitleService,
    private functionsService: FunctionsService,
    private modalService: BsModalService,
    private ubicacionService: PreCadastroUbicacionContactosService,
    private bsModalRef: BsModalRef,
    private notificacionesService: NotificacionesService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit() {
    this.titleService.setTitle('Pre-Registro');
    this.getFormFields();
    //this.determinarBloqueo();
    this.obtenerTiposClientes();
    this.obtenerTipoDocumento();
    this.obtenerTipoPersonas();
    this.activatedRoute.queryParams.subscribe((queryParams: any) => {
      let documento = null;

      this.registrarAcesso();
      this.setMaxLengthRules();
      this.setFormBuilder(documento);
      this.formObj = this.formBuilder.group({
        ubicacion: this.formBuilder.array([]), // Debes configurar esto según tu estructura
        contactos: this.formBuilder.array([]), // Debes configurar esto según tu estructura
        // Otros campos del formulario principal aquí
      });
    });
    this.disabled_form = true;
  }

  /* determinarBloqueo() {
    if (this.miFormulario.get('tipo_cliente').value === 0) {
      this.bloquearSeleccion = this.true;
    }
  } */

  changeVendedor(a) {
    this.id_vend = a;
    this.clientesService.getVendedorCiudad(a).subscribe(
      (response: any) => {
        if (response.responseCode === 200) {
          // console.log(response.result.latitud);
          this.latitud_inicial = response.result.latitud;
          this.longitud_inicial = response.result.longitud;
          this.ciudad_vendedor = response.result.id_ciudad;
          // console.log(this.ciudad_vendedor);
        } else {
          this.handleFormFieldsError();
        }
      },
      (error) => {
        /*           console.error('Error al cargar dependencias:', error);
         */ this.handleFormFieldsError();
      }
    );
  }

  obtenerTiposClientes() {
    this.clientesService.getTipoClientes().subscribe(
      (response: any) => {
        if (response.responseCode === 200) {
          this.tipos_clientes = response.result;
        } else {
          this.handleFormFieldsError();
        }
      },
      (error) => {
        /*           console.error('Error al cargar dependencias:', error);
         */ this.handleFormFieldsError();
      }
    );
  }
  get ciControl() {
    return this.form.get('ci');
  }

  obtenerTipoPersonas() {
    this.preCadastroService.getTipoPersona().subscribe(
      (response: any) => {
        if (response.responseCode === 200) {
            this.tipos_personas = response.result;
        } else {
          this.handleFormFieldsError();
        }
      },
      (error) => {
        /*           console.error('Error al cargar dependencias:', error);
         */ this.handleFormFieldsError();
      }
    );
  }
  obtenerTipoDocumento() {
    this.preCadastroService.getTipoDocumento().subscribe(
      (response: any) => {
        if (response.responseCode === 200) {
          console.log('Documentos', response);
          this.tipos_documentos = response.result;
        } else {
          this.handleFormFieldsError();
        }
      },
      (error) => {
        /*           console.error('Error al cargar dependencias:', error);
         */ this.handleFormFieldsError();
      }
    );
  }
  /* actualizarMarcador(event: any) {
    this.latitud = event.coords.lat;
    this.longitud = event.coords.lng;
  } */
  /*  actualizarMarcador(index: number, latitud, longitud): void {
     /* console.log(this.latitud); */

  /* this.id_marcador = index;
  this.ubicacionFormularios[index].color = 'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|00FF00';
   Actualizar solo la ubicación del marcador en la posición 'index'
  this.ubicaciones[index].latitud = latitud;
  this.ubicacionFormularios[index].latitud = latitud;
  this.ubicaciones[index].longitud = longitud
  this.ubicacionFormularios[index].longitud = longitud;


  this.cambiarColorMarcador(index);
} */

  /* cambiarColorMarcador(i: number) {
    this.ubicaciones[i].color = 'blue';
  } */

  /* actualizarMapa(event: any) {
    //console.log(event);
    this.latitud = event.coords.lat;
    this.longitud = event.coords.lng;
    this.actualizarMarcador(this.id_marcador, this.latitud, this.longitud);
    this.actualizarDireccion(this.id_marcador, event);
  }

  actualizarDireccion(index, event: any) {
    this.obtenerDireccion(event.coords.lat, event.coords.lng)
      .then((direccion_mapa: string) => {
        this.ubicacionFormularios[index].direccion = direccion_mapa;
      })
      .catch((error: any) => {
        /*  this.form.controls['direccion'].setValue(
            'Error al obtener la dirección'
         ); */
  /*       });
    } */

  /* public obtenerDireccion(latitud: number, longitud: number): Promise<string> {
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
  } */

  registrarAcesso() {
    this.atividadesService.registrarAcesso().subscribe();
  }

  getFormFields() {
    this.preCadastroService
      .loadDependencies()
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe(
        (response: any) => {
          //console.log('Datos obtenidos en loadDependencies():', response[0].data);

          if (response[0].responseCode === 200) {
            this.vendedores = response[0].data;
          } else {
            this.handleFormFieldsError();
          }

          if (response[1].responseCode === 200) {
            this.cnaes = response[1].result.map((cnae) => ({
              id_cnae: cnae.id,
              descripcion: cnae.descricao,
              codigo: cnae.codigo,
            })); ///console.log("cnaes: ", this.cnaes);
          } else {
            this.handleFormFieldsError();
          }
          if (response[2].responseCode === 200) {
            this.ciudades = response[2].result;
            //console.log(this.ciudades);
          } else {
            this.handleFormFieldsError();
          } //console.log("cnaes: ", this.ciudades);
        },
        (error) => {
          //console.error('Error al cargar dependencias:', error);
          this.handleFormFieldsError();
        }
      );
  }

  handleFormFieldsError() {
    this.pnotifyService.error();
    this.location.back();
  }

  setMaxLengthRules() {
    this.maxLengthRules = this.activatedRoute.snapshot.data.rules.data;
    //console.log(this.maxLengthRules);
    this.maxLengthMessages = {
      nome: `El nombre debe contener ${this.maxLengthRules.nome} caracteres.`,
      apellido1: `Apellido debe contener ${this.maxLengthRules.apellido1} caracteres.`,
      apellido2: `Apellido debe contener ${this.maxLengthRules.apellido1} caracteres.`,
      razaoSocial: `El nombre de la empresa debe contener ${this.maxLengthRules.razaoSocial} caracteres.`,
      nomeFantasia: `El nombre comercial debe contener hasta ${this.maxLengthRules.nomeFantasia} caracteres.`,
      email: `El correo electrónico debe llegar a ${this.maxLengthRules.email} caracteres.`,
      numero_documento: `El numero de documento no puede exceder los 15  ${this.maxLengthRules.numero_documento} caracteres.`,
    };
  }
  agregarUbicacionALaFormObj(datosUbicacion: any) {
    const ubicacionFormArray = this.formObj.get('ubicacion') as FormArray;
    ubicacionFormArray.push(this.formBuilder.group(datosUbicacion));
  }

  // Crea una función para agregar datos de contacto al formulario principal
  agregarContactoALaFormObj(datosContacto: any) {
    const contactoFormArray = this.formObj.get('contactos') as FormArray;
    contactoFormArray.push(this.formBuilder.group(datosContacto));
  }

  repetirFormulario(tipoFormulario: string) {
    this.swActivarLatitud = false;

    if (
      tipoFormulario === 'Ubicacion' &&
      this.ubicacionFormularios.length < 5
    ) {
      const nuevoFormulario = this.crearFormularioUbicacionConDatosIngresados();

      this.agregarUbicacionALaFormObj(nuevoFormulario);
      this.ubicacionFormularios.push(nuevoFormulario);
      if (this.ubicacionFormularios.length > 0) {
        this.ubicacionFormularios[this.index_array_ubicacion].ubicacion =
          this.titulo_ubicacion_array;
        this.ubicacionFormularios[this.index_array_ubicacion].id_ciudad =
          this.id_ciudad;
      }
      //console.log(this.index_array);

      // También debes agregar este formulario al formulario principal.
      this.formObjArray[0].ubicacion.push(nuevoFormulario);
    } else if (
      tipoFormulario === 'Contacto' &&
      this.contactoFormularios.length < 5
    ) {
      const nuevoFormulario = this.crearFormularioContactoConDatosIngresados();

      this.agregarContactoALaFormObj(nuevoFormulario);
      this.contactoFormularios.push(nuevoFormulario);

      if (this.contactoFormularios.length > 0) {
        //console.log(this.titulo_contacto_array);

        this.contactoFormularios[this.index_array_contactos].titulo_contacto =
          this.titulo_contacto_array;
        this.contactoFormularios[this.index_array_contactos].nombres_contacto =
          this.nombre_contacto_array;
        this.contactoFormularios[this.index_array_contactos].apellido_contacto =
          this.apellido_p_contacto_array;
        this.contactoFormularios[
          this.index_array_contactos
        ].apellido2_contacto = this.apellido_m_contacto_array;
        this.contactoFormularios[this.index_array_contactos].telefono_contacto =
          this.telefono_contacto_array;
        this.contactoFormularios[
          this.index_array_contactos
        ].direccion_contacto = this.direccion_contacto_array;
        this.contactoFormularios[this.index_array_contactos].latitude_contacto =
          this.latitud_contacto_array;
        this.contactoFormularios[
          this.index_array_contactos
        ].longitude_contacto = this.longitud_contacto_array;
      }

      //console.log(this.contactoFormularios);
      (this.formObj.get('contactos') as FormArray).push(nuevoFormulario);
    } else {
      /* console.log('Se alcanzó el máximo de formularios permitidos para este tipo.'); */
    }
  }

  eliminarContacto(index, tipo) {
    if (tipo == 1) {
      this.contactoFormularios.splice(index, 1);
    } else if (tipo == 2) {
      this.ubicacionFormularios.splice(index, 1);
    }
  }

  crearFormularioUbicacionConDatosIngresados(): any {
    return {
      ubicacion: '',
      direccion: '',
      id_ciudad: this.ciudad_vendedor,
      latitud: 0,
      longitud: 0,
      swActivarLatitud: this.swActivarLatitud,
    };
  }

  openModalUbicacion(
    template: TemplateRef<any>,
    index: number,
    tipo: number
  ): void {
    if (this.form.value.vendedor > 0) {
      this.indice = index;
      if (tipo === 1) {
        this.tipo_peticion = tipo;
        this.latitud = this.contactoFormularios[index].latitude_contacto;
        this.longitud = this.contactoFormularios[index].longitude_contacto;
      } else if (tipo === 2) {
        this.tipo_peticion = tipo;
        this.latitud = this.ubicacionFormularios[index].latitud;
        this.longitud = this.ubicacionFormularios[index].longitud;
      }
      //console.log(this.latitud);

      this.modalRef = this.modalService.show(template, {
        animated: false,
        class: 'modal-lg',
      });
    } else {
      this.pnotifyService.notice('Porfavor seleccione un vendedor.');
    }

    //this.ubicacionService.showModal();
  }

  onFecharModal(event) {
    //console.log(this.modalRef);
    this.modalRef.hide();
  }

  crearFormularioContactoConDatosIngresados(): any {
    return {
      titulo_contacto: '',
      nombres_contacto: '',
      apellido_contacto: '',
      apellido2_contacto: '',
      telefono_contacto: '',
      celular_contacto: '',
      direccion_contacto: '',
      latitude_contacto: 0,
      longitude_contacto: 0,
    };
  }

  changeLatitudLongitud(event: {
    latitud: number;
    longitud: number;
    direccion: any;
    index: number;
    tipo: number;
  }) {
    //console.log(event.tipo)

    if (event.tipo === 1) {
      this.latitud_contacto_array = event.latitud;
      this.longitud_contacto_array = event.longitud;
      this.direccion_contacto_array = event.direccion;

      this.contactoFormularios[event.index].latitude_contacto =
        this.latitud_contacto_array;
      this.contactoFormularios[event.index].longitude_contacto =
        this.longitud_contacto_array;
      this.contactoFormularios[event.index].direccion_contacto =
        this.direccion_contacto_array;
    } else if (event.tipo === 2) {
      this.latitud = event.latitud;
      this.longitud = event.longitud;
      this.direccion_mapa = event.direccion;
      this.ubicacionFormularios[event.index].latitud = this.latitud;
      this.ubicacionFormularios[event.index].longitud = this.longitud;
      this.ubicacionFormularios[event.index].direccion = this.direccion_mapa;
    }
  }

  setFormBuilder(documento: string) {
    this.form = this.formBuilder.group({
      //cnpj_cpf: [null,Validators.required],
      numero_documento: [null, [Validators.required, Validators.min(0)]],
      tipo_documento: [
        null,
        [
          Validators.required,
          Validators.maxLength(15),Validators.min(0)
        ],
      ],

      nome: [
        null,
        [Validators.required, Validators.maxLength(this.maxLengthRules.nome)],
      ],

      contacto: [null],
      razaoSocial: [null],
      nomeFantasia: [null],
      nombre_factura: [null /* Validators.required */],
      vendedor: [null, Validators.required],
      cnae: [null],
      email: [
        null,
        [
          ,
          /* Validators.email */ Validators.maxLength(
            this.maxLengthRules.email
          ),
        ],
      ],
      telefone: [null, [Validators.required, Validators.min(0)]],
      celular: [null, [Validators.required, Validators.min(0)]],
      direccion: [null],
      tipopessoa: [null, Validators.required],
      nombres_contacto: [null],
      apellido_contacto: [null],
      apellido2_contacto: [null],
      telefono_contacto: [null, [Validators.required, Validators.min(0)]],
      celular_contacto: [Validators.min(0)],
      ciudad: [null],
      direccion_contacto: [null],
      ciudadUbi: [null],
      titulo_contacto: [null],
      titulo_ubicacion: [],
      ubicacion: this.formBuilder.array([]),
      contactos: this.formBuilder.array([]),
      nombre_ciudad: [null, Validators.required],
      tipo_cliente: [0],
    });

    this.form.get('tipopessoa').valueChanges.subscribe((value) => {
      if (value === 'P' || value === 'G' || value === 'E') {
        //this.form.get('nit').setValidators([Validators.required]);
        this.form.get('razaoSocial').setValidators([Validators.required]);
      } else {
        //this.form.get('nit').clearValidators();
        this.form.get('razaoSocial').clearValidators();
      }
      //this.form.get('nit').updateValueAndValidity();
      this.form.get('razaoSocial').updateValueAndValidity();
    });
  }


  onSubmit() {
    alert(
      'Se recomienda no salir de la ventana mientras se realiza el proceso de registro'
    );
    var swDireccion = false;
    var swContactos = false;
    /* this.postAkna(20081);
    return; */

    const tipoPessoaOptions = {
      S: 'Sociedades',
      P: 'Privado',
      G: 'Gobierno',
      E: 'Empleado',
    };
    const tipopessoa = (this.form.value.tipopessoa || '').trim().toUpperCase(); // Convertir a mayúsculas
    const tipopersona = tipoPessoaOptions[tipopessoa] || 'Tipo no válido';

    //console.log(tipopersona);
    const data = {
      ubicacion: [],
      contactos: [],
    };
    const contactoFormulario = this.contactoFormularios;
    //console.log(this.contactoFormularios);
    const requiredAttributes = [
      'titulo_contacto',
      'nombres_contacto',
      'apellido_contacto',
      'telefono_contacto',
      'direccion_contacto',
    ];
    const allFieldsFilledInContactoFormulario = contactoFormulario.every(
      (contacto) => {
        // Verificar que los atributos requeridos estén llenos en cada objeto
        return requiredAttributes.every(
          (key) =>
            contacto[key] !== null &&
            contacto[key] !== undefined &&
            contacto[key] !== ''
        );
      }
    );

    if (allFieldsFilledInContactoFormulario) {
      swContactos = true;

      data.contactos = contactoFormulario;
    } else {
      this.pnotifyService.notice(
        'Por favor, llene todos los campos requeridos de contacto.'
      );
    }
    const ubicacionFormulario = this.ubicacionFormularios;

    if (
      ubicacionFormulario &&
      ubicacionFormulario.length > 0 &&
      ubicacionFormulario[0].id_ciudad !== null &&
      ubicacionFormulario[0].id_ciudad !== undefined &&
      ubicacionFormulario[0].id_ciudad !== ''
    ) {
      if (
        ubicacionFormulario[0].ubicacion &&
        ubicacionFormulario[0].ubicacion.length > 0
      ) {
        const direccionValida = ubicacionFormulario.every(
          (direccion) =>
            direccion.direccion === null ||
            direccion.direccion === undefined ||
            (typeof direccion.direccion === 'string' &&
              direccion.direccion.length < 50)
        );

        if (direccionValida) {
          data.ubicacion = ubicacionFormulario;
          swDireccion = true;
        } else {
          this.pnotifyService.notice(
            'La dirección debe tener menos de 50 caracteres.'
          );
        }
      } else {
        this.pnotifyService.notice(
          'El nombre de ubicacion es un dato requerido'
        );
      }
    } else {
      this.pnotifyService.notice('El campo de ciudad es obligatorio');
    }

    if (this.form.valid && swDireccion === true && swContactos === true) {
      this.loaderNavbar = true;
      this.submittingForm = true;
      let formObj = {};

      formObj = {
        tipo_pessoa: tipopessoa,
        tipo_persona: tipopersona,
        id_vendedor: this.form.value.vendedor,
        nombres: this.form.value.nome,
        razonSocial: this.form.value.razaoSocial,
        nombre_factura: this.form.value.nombre_factura,
        tipo_documento: this.form.value.tipo_documento,
        cnpj_cpf: this.form.value.numero_documento,
        id_rubro: this.form.value.cnae,
        email: this.form.value.email,
        telefono: this.form.value.telefone,
        celular: this.form.value.celular,
        ubicacion: data.ubicacion /* this.ubicacionFormularios */, // Asigna los datos de ubicación directamente aquí
        contactos: /* data.contactos */ this.contactoFormularios,
        id_tipo_cliente: 0,
        frontend: 1,
      };

      this.clientesService

        .sapPostClient(formObj)
        .pipe(
          finalize(() => {
            this.loaderNavbar = false;
            this.submittingForm = false;
          })
        )
        .subscribe(
          (response: any) => {
            if (response.CodigoRespuesta === 200) {
              this.pnotifyService.success(response.Mensaje);
              this.formChanged = false;
              this.form.reset();
              this.crearNotificacion();
              
              /* this.router.navigate(['../cadastro', response.Mensaje], {
                relativeTo: this.activatedRoute,
              }); */
              this.router.navigate(['/comercial/clientes/lista']);
              this.getNotificaciones();
            } else if (response.CodigoRespuesta === 204) {
              this.pnotifyService.notice(response.Mensaje);
            }
          },
          (error: any) => {
            this.pnotifyService.notice('Ocurrio un error.');
          }
        );
    }
    /* } else {
      this.pnotifyService.notice(
        'Debe registrar al menos 1 contacto y dirección.'
      );
    } */
  }

  crearNotificacion(){
    console.log(this.form.value.vendedor); 
    const params ={
      'titulo': 'Nuevo cliente',
      'mensaje': 'Se ha registrado un socio de negocios',
      'url': 'http://localhost:4200/#/comercial/clientes/lista',
      'id_vendedor':  this.id_vend
    }

    this.notificacionesService.createNotificacion(params)
    .pipe(
      finalize(() => {
       
      })
    )
    .subscribe(
      (response: any) => {
        if (response.responseCode === 200) {
        }
      },
      (error: any) => {
       // this.pnotifyService.notice('Ocurrio un error.');
      }
    );

  }

  getNotificaciones() {
    this.notificacionesService.getNotificaciones();

    this.notificacionesService

      .getNotificaciones()
      .pipe(
        finalize(() => {
          /*  this.loaderNavbar = false;
           this.submittingForm = false; */
        })
      )
      .subscribe(
        (response: any) => {
          if (response.responseCode === 200) {
            this.notificaciones = response.content;
          } else if (response.response === 204) {
          }
        },
        (error: any) => {
          this.pnotifyService.notice('Ocurrio un error.');
        }
      );
  }

  setType(type: string) {
    // this.tipoPessoa = type;
    this.form.reset();
  }

  onFieldError(field: string) {
    if (this.onFieldInvalid(field) != '') {
      return 'is-invalid';
    }

    return '';
  }

  agregarDireccion(index: number) {
    //console.log(index);
    this.ubicaciones[index] = {
      latitud: this.latitud,
      longitud: this.longitud,
      color: this.generarColorAleatorio(),
    };
    if (index >= 0) {
      this.ubicacionFormularios[index].swActivarLatitud = true;
    } else {
      this.ubicacionFormularios[index].swActivarLatitud = false;
    }
  }

  generarColorAleatorio(): string {
    if (this.coloresDisponibles.length === 0) {
      return null; // No quedan colores disponibles
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
  
  actualizarUbicacion(index: number) {
    // Actualiza las coordenadas de la ubicación en el arreglo
    this.ubicaciones[index].latitud = this.latitud;
    this.ubicaciones[index].longitud = this.longitud;
  }
  onFieldInvalid(field: any) {
    field = this.form.get(field);

    if (field.errors != null) {
      if (field.errors.hasOwnProperty('required') && field.touched) {
        return 'required';
      }

      if (field.errors.hasOwnProperty('maxlength') && field.touched) {
        return 'maxlength';
      }
    }

    return '';
  }

  onFieldRequired(field: string) {
    let required = false;
    let formControl = new FormControl();

    if (this.form.controls[field].validator) {
      let validationResult = this.form.controls[field].validator(formControl);
      required =
        validationResult !== null && validationResult.required === true;
    }

    if (required) {
      return 'is-required ';
    }
  }

  /* showDetails(): void {
    this.modalRef = this.modalService.show(
      this.modalDetalhesCliente,
      this.modalConfig
    );
  }

  onCloseDetails(): void {
    this.modalRef.hide();
  } */

  onNavigateDetail(): void {
    if (this.dadosCliente.podeAcessar == 1) {
      /* this.onCloseDetails();
      this.router.navigate(['../detalhes', this.dadosCliente.codCliente], {
        relativeTo: this.activatedRoute,
      }); */
    } else {
      this.pnotifyService.notice('Este cliente no pertenece a su cartera');
    }
  }

  onInput() {
    this.formChanged = true;
  }

  actualizarPosicion(atributo, index) {
    //console.log(atributo)
    //this.ubicacionFormularios[index].titulo_ubicacion = atributo;
    //console.log(this.ubicacionFormularios[index].titulo_ubicacion)
    this.titulo_ubicacion_array = atributo;
    this.index_array_ubicacion = index;

    this.ubicacionFormularios[index].ubicacion = atributo;
    //console.log(this.ubicacionFormularios)
  }
  actualizarDireccion(atributo, index, tipo) {
    if (tipo === 1) {
      this.index_array_ubicacion = index;
      this.ubicacionFormularios[index].direccion = atributo;
    } else if (tipo === 2) {
    }
    //this.direccion_ubicacion_array = atributo;
  }
  actualizarContacto(atributo, tipo, index) {
    /*  console.log(atributo) */
    this.index_array_contactos = index;
    switch (tipo) {
      case 1:
        this.titulo_contacto_array = atributo;
        this.contactoFormularios[index].titulo_contacto =
          this.titulo_contacto_array;
        break;
      case 2:
        this.nombre_contacto_array = atributo;
        this.contactoFormularios[index].nombres_contacto =
          this.nombre_contacto_array;
        break;
      case 3:
        this.apellido_p_contacto_array = atributo;
        this.contactoFormularios[index].apellido_contacto =
          this.apellido_p_contacto_array;
        break;
      case 4:
        this.apellido_m_contacto_array = atributo;
        this.contactoFormularios[index].apellido2_contacto =
          this.apellido_m_contacto_array;
        break;
      case 5:
        this.telefono_contacto_array = atributo;
        this.contactoFormularios[index].telefono_contacto =
          this.telefono_contacto_array;
        break;
      case 6:
        this.celular_contacto_array = atributo;
        this.contactoFormularios[index].celular_contacto =
          this.celular_contacto_array;
        break;
      case 7:
        this.direccion_contacto_array = atributo;
        this.contactoFormularios[index].direccion_contacto =
          this.direccion_contacto_array;
        break;
      default:
        break;
    }
  }

  cambiarCiudad(id, index) {
    this.id_ciudad = id;
    this.index_array_ubicacion = index;
    this.ubicacionFormularios[index].id_ciudad = id;

    //console.log(this.id_ciudad);
  }

  formCanDeactivate() {
    if (this.formChanged) {
      if (confirm('Este cliente no forma parte de tu cartera?')) {
        return true;
      } else {
        return false;
      }
    }
    return true;
  }

  onCancel() {
    this.location.back();
  }
}
