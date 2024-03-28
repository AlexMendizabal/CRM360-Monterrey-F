import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { ComercialVendedoresService } from 'src/app/modules/comercial/services/vendedores.service';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { PNotify } from 'pnotify/dist/es/PNotify';
import { JsonResponse } from 'src/app/models/json-response';
import { Location } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { ComercialCicloVendasCotacoesFormularioService } from './../../../formulario.service';
import { NotificacionesService } from '../../../../../../../../core/header/notificaciones/notificaciones.service';
import { ComercialClientesPreCadastroService } from 'src/app/modules/comercial/clientes/pre-cadastro/pre-cadastro.service';

import {
  Component,
  OnInit,
  Input,
  EventEmitter,
  Output,
  TemplateRef,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ComercialClientesService } from 'src/app/modules/comercial/services/clientes.service';

@Component({
  selector: 'comercial-ciclo-vendas-cotacoes-formulario-modal-agregar',
  templateUrl: './agregar.component.html',
  styleUrls: ['./agregar.component.scss'],
})
export class ComercialCicloVendasCotacoesFormularioModalAgregarComponent
  implements OnInit
{
  loaderNavbar: EventEmitter<boolean> = new EventEmitter();
  /* 
    @Output() cliente = new EventEmitter();
    @Output() clientesParams = new EventEmitter(); */

  @Input() vendedores: any = [];
  @Input() rubros: any = [];
  @Input() ciudades: any = [];

  @ViewChild('botonGuardar') botonGuardar: ElementRef;
  @Output() fecharModal = new EventEmitter();

  formClientes: FormGroup;
  loadingClientes: boolean;
  noClientes = true;
  clientes = [];
  ubicaciones: any = [
    {
      ubicacion: '',
      direccion: '',
      id_ciudad: 0,
      latitud: 0,
      longitud: 0,
    },
  ];
  isLoading = false;

  contactos: any = [
    {
      contacto: '',
      nombres_contacto: '',
      apellido_contacto: '',
      apellido2_contacto: '',
      telefono_contacto: '',
      celular_contacto: '',
      direccion_contacto: '',
      latitude_contacto: 0,
      longitude_contacto: 0,
    },
  ];

  direccion_contacto_array: string = '';
  latitud_contacto_array: number = 0;
  longitud_contacto_array: number = 0;

  indice: number = 0;
  form: FormGroup;
  swDireccion: boolean = false;
  swDireccionContacto: boolean = false;

  direccion_mapa: string = '';
  tipo_peticion: number = 0;

  latitud_inicial: number = 0;
  longitud_inicial: number = 0;

  latitud: number = 0;
  longitud: number = 0;
  id_vendedor: number = 0;
  tipos_personas: any = [];
  tipos_documentos: any = [];
  /* Pagination */
  itemsPerPage = 10;
  begin = 0;
  end = 20;
  /* Pagination */

  constructor(
    private preCadastroService: ComercialClientesPreCadastroService,
    private formBuilder: FormBuilder,
    private pnotifyService: PNotifyService,
    private bsModalRef: BsModalRef,
    private modalService: BsModalService,
    private location: Location,
    private clientesService: ComercialClientesService,
    private notificacionesService: NotificacionesService,
    private comercialService: ComercialVendedoresService
  ) {}

  ngOnInit(): void {
    this.setFormBuilder();
    this.obtenerTipoPersonas();
    this.obtenerTipoDocumento();
  }

  onClose(): void {
    this.fecharModal.emit(true);
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
            //console.log(response);
           // this.notificaciones = response.content;
          } else if (response.response === 204) {
          }
        },
        (error: any) => {
          this.pnotifyService.notice('Ocurrio un error.');
        }
      );
  }

  crearNotificacion(){
    //console.log(this.form.value.vendedor); 
    const params ={
      'titulo': 'Nuevo cliente',
      'mensaje': 'Se ha registrado un socio de negocios',
      'url': 'http://localhost:4200/#/comercial/clientes/lista',
      'id_vendedor':  this.id_vendedor
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


  openModalUbicacion(template: TemplateRef<any>, tipo: number): void {
    if (this.form.value.id_vendedor > 0) {
      this.swDireccion = true;
      this.swDireccionContacto = true;

      if (tipo === 1) {
        this.tipo_peticion = tipo;
        this.latitud = this.contactos[0].latitude_contacto;
        this.longitud = this.contactos[0].longitude_contacto;
      } else if (tipo === 2) {
        this.tipo_peticion = tipo;
        this.latitud = this.ubicaciones[0].latitud;
        this.longitud = this.ubicaciones[0].longitud;
      }
      //console.log(this.latitud);

      this.bsModalRef = this.modalService.show(template, {
        animated: false,
        class: 'modal-md',
      });
    } else {
      this.pnotifyService.notice('Primero seleccione un vendedor.');
    }
  }

  onFecharModal(event) {
    //console.log(this.modalRef);
    this.bsModalRef.hide();
  }

  changeVendedor(a) {
    this.id_vendedor = a;
    this.clientesService.getVendedorCiudad(a).subscribe(
      (response: any) => {
        if (response.responseCode === 200) {
          // console.log(response.result.latitud);
          this.latitud_inicial = response.result.latitud;
          this.longitud_inicial = response.result.longitud;
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
  handleFormFieldsError() {
    this.pnotifyService.error();
    this.location.back();
  }

  changeLatitudLongitud(event: {
    latitud: number;
    longitud: number;
    direccion: any;
    tipo: number;
  }) {
    console.log(event);

    if (event.tipo === 1) {
      this.latitud_contacto_array = event.latitud;
      this.longitud_contacto_array = event.longitud;
      this.direccion_contacto_array = event.direccion;
      this.contactos[0].latitude_contacto = this.latitud_contacto_array;
      this.contactos[0].longitude_contacto = this.longitud_contacto_array;
      console.log(this.direccion_contacto_array);
      this.form.controls['direccion_contacto'].setValue(
        this.direccion_contacto_array
      );
    } else if (event.tipo === 2) {
      this.latitud = event.latitud;
      this.longitud = event.longitud;
      this.direccion_mapa = event.direccion;
      this.ubicaciones[0].latitud = this.latitud;
      this.ubicaciones[0].longitud = this.longitud;
      this.form.controls['direccion'].setValue(this.direccion_mapa);
    }
  }

  setFormBuilder(): void {
    this.form = this.formBuilder.group({
      /* Cabecera */
      nombre: [null, Validators.required],
      razon_social: [null, Validators.required],
      id_rubro: [null],
      id_vendedor: [null, Validators.required],
      tipo_persona: [null, Validators.required],
      nombre_factura: [null],
      tipo_documento: [null, [Validators.required]],
      telefono: [null, [Validators.required, Validators.min(0)]],
      numero_documento: [null, [Validators.required, Validators.min(6)]],
      celular: [null, [Validators.required, Validators.min(0)]],

      /* Detalle-contacto */
      contacto: [null, Validators.required ],
      nombre_contacto: [null , Validators.required ],
      apellido_p_contacto: [null , Validators.required],
      apellido_m_contacto: [null],
      telefono_contacto: [null , Validators.required ],
      celular_contacto: [null/* , Validators.required */],
      direccion_contacto: [null, [Validators.required, Validators.maxLength(49)]],

      /* Detalle-direccion */
      titulo_direccion: [null, Validators.required],
      direccion: [null, [Validators.required, Validators.maxLength(49)]],
      id_ciudad: [null, Validators.required],

      //apellido_p_contacto: [null, Validators.required],
    });
  }
  onFieldError(field: string) {
    if (this.onFieldInvalid(field) != '') {
      return 'is-invalid';
    }

    return '';
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

  obtenerTipoPersonas() {
    this.clientesService.getTipoPersona().subscribe(
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

  onSubmit() {
    
    //Direcciones
    //console.log(this.form.value.id_ciudad);
    this.ubicaciones[0].ubicacion = this.form.value.titulo_direccion;
    this.ubicaciones[0].direccion = this.form.value.direccion;
    this.ubicaciones[0].id_ciudad = this.form.value.id_ciudad;
    
    //Contactos
    this.contactos[0].contacto = this.form.value.contacto;
    this.contactos[0].nombres_contacto = this.form.value.nombre_contacto;
    this.contactos[0].apellido_contacto = this.form.value.apellido_p_contacto;
    this.contactos[0].apellido2_contacto = this.form.value.apellido_m_contacto;
    this.contactos[0].telefono_contacto = this.form.value.telefono_contacto;
    this.contactos[0].celular_contacto = this.form.value.celular_contacto;
    this.contactos[0].direccion_contacto = this.form.value.direccion_contacto;

    const tipoPessoaOptions = {
      S: 'Sociedades',
      P: 'Privado',
      G: 'Gobierno',
      E: 'Empleado',
    };
    const tipopessoa = (this.form.value.tipo_persona || '').trim().toUpperCase(); // Convertir a mayúsculas
    const tipopersona = tipoPessoaOptions[tipopessoa] || 'Tipo no válido';
    
    if (this.form.valid) {
      //Array general
      this.isLoading = true;
      this.botonGuardar.nativeElement.disabled = true;
      let formObj = {
        nombres: this.form.value.nombre,
        cnpj_cpf: this.form.value.numero_documento,
        razonSocial: this.form.value.razon_social,
        tipo_documento: this.form.value.tipo_documento,
        id_vendedor: this.form.value.id_vendedor,
        nombre_factura: this.form.value.nombre_factura,
        rubro: this.form.value.id_rubro,
        ubicacion: this.ubicaciones,
        contactos: this.contactos,
        telefono: this.form.value.telefono,
        celular: this.form.value.celular,
        frontend: 1,
        tipo_persona: tipopersona,

      };
      
      //console.log(formObj);
      
      this.clientesService
      
      .sapPostClient(formObj)
      .pipe(
        finalize(() => {
          /* this.loaderNavbar = false;
          this.submittingForm = false; */
        })
        )
        .subscribe(
          (response: any) => {
            this.isLoading = false;
            this.botonGuardar.nativeElement.disabled = false;

            if (response.CodigoRespuesta === 200) {
              this.pnotifyService.success('Cliente registrado.');
              this.crearNotificacion();
              this.getNotificaciones();
              setTimeout(() => {
                location.reload();
              }, 1000);
            } else if (response.CodigoRespuesta === 204) {
              this.pnotifyService.notice('SAP: ' + response.Mensaje);
            } else {
              this.pnotifyService.notice('SAP: ' + response.Mensaje);
            }
          },
          (error: any) => {
            this.isLoading = false;
            this.botonGuardar.nativeElement.disabled = false;

            this.pnotifyService.notice('Ocurrio un error.');
          }
        );
    } else {
      this.isLoading = false;
      this.pnotifyService.notice('Porfavor complete los campos requeridos.');
    }
  }
}
