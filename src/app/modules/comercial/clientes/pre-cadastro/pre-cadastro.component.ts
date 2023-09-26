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

@Component({
  selector: 'comercial-clientes-pre-cadastro',
  templateUrl: './pre-cadastro.component.html',
  styleUrls: ['./pre-cadastro.component.scss'],
})
export class ComercialClientesPreCadastroComponent
  implements OnInit, IFormCanDeactivate {
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
      descricao: 'Pre-Registro',
    },
  ];

  public MASKS = MASKS;

  vendedores: any = [];
  cnaes: any = [];

  form: FormGroup;
  formChanged = false;
  tipoPessoa: any = {};
  submittingForm = false;
  latitud: number = -17.78629;
  longitud: number = -63.18117;
  swActivarLatitud: boolean = false;
  maxLengthRules: any = {};
  maxLengthMessages: any = {};
  id_marcador: number = 0;

  dadosCliente: any = {};
  ciudades: any = [];

  ubicacionCollapse: boolean = false; // Inicialmente oculto
  contactoCollapse: boolean = false; // Inicialmente oculto

  ubicacionFormularios: any[] = [];
  contactoFormularios: FormGroup[] = [];
  formObj: FormGroup;
  formObjArray: any[] = [];
  ubicaciones : any[] = [];



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
    private modalService: BsModalService

  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit() {
    this.titleService.setTitle('Pre-Registro');
    this.getFormFields();
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
  }

  /* actualizarMarcador(event: any) {
    this.latitud = event.coords.lat;
    this.longitud = event.coords.lng;
  } */
  actualizarMarcador( index: number) {
    /* console.log(this.latitud); */
    this.id_marcador = index; 
    // Actualizar solo la ubicación del marcador en la posición 'index'
    this.ubicaciones[index].latitud = this.latitud;
    this.ubicacionFormularios[index].latitud = this.latitud;
    this.ubicaciones[index].longitud = this.longitud
    this.ubicacionFormularios[index].longitud = this.longitud;


    
  }
 actualizarMapa(event: any){
  console.log(event);
  this.latitud = event.coords.lat;
  this.longitud = event.coords.lng;
  this.actualizarMarcador(this.id_marcador);
  this.actualizarDireccion(this.id_marcador, event);
 }

  actualizarDireccion(index, event: any) {
    this.obtenerDireccion(event.coords.lat, event.coords.lng)
      .then((direccion_mapa: string) => {
        this.ubicacionFormularios[index].direccion= direccion_mapa;
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
          console.log('Datos obtenidos en loadDependencies():', response);

          if (response[0].responseCode === 200) {
            this.vendedores = response[0].result;
          } else {
            this.handleFormFieldsError();
          }

          if (response[1].responseCode === 200) {
            this.cnaes = response[1].result.map(cnae => ({
              id_cnae: cnae.id,
              descripcion: cnae.descricao,
              codigo: cnae.codigo
            })); console.log("cnaes: ", this.cnaes);
          } else {
            this.handleFormFieldsError();
          }
          if (response[2].responseCode === 200) {
            this.ciudades = response[2].result;
            console.log(this.ciudades);
          } else {
            this.handleFormFieldsError();
          } console.log("cnaes: ", this.ciudades);
        },
        (error) => {
          console.error('Error al cargar dependencias:', error);
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
    this.maxLengthMessages = {
      nome: `El nombre debe contener ${this.maxLengthRules.nome} caracteres.`,
      apellido1: `Apellido debe contener ${this.maxLengthRules.apellido1} caracteres.`,
      apellido2: `Apellido debe contener ${this.maxLengthRules.apellido1} caracteres.`,
      razaoSocial: `El nombre de la empresa debe contener ${this.maxLengthRules.razaoSocial} caracteres.`,
      nomeFantasia: `El nombre comercial debe contener hasta ${this.maxLengthRules.nomeFantasia} caracteres.`,
      email: `El correo electrónico debe llegar a ${this.maxLengthRules.email} caracteres.`,
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
    if (tipoFormulario === 'Ubicacion' && this.ubicacionFormularios.length < 5) {
      const nuevoFormulario = this.crearFormularioUbicacionConDatosIngresados();

      this.agregarUbicacionALaFormObj(nuevoFormulario);
      this.ubicacionFormularios.push(nuevoFormulario);

      console.log(this.ubicacionFormularios);


      // También debes agregar este formulario al formulario principal.
      this.formObjArray[0].ubicacion.push(nuevoFormulario);
    } else if (tipoFormulario === 'Contacto' && this.contactoFormularios.length < 5) {
      const nuevoFormulario = this.crearFormularioContactoConDatosIngresados();
      this.agregarContactoALaFormObj(nuevoFormulario.value);
      this.contactoFormularios.push(nuevoFormulario);
      (this.formObj.get('contactos') as FormArray).push(nuevoFormulario);
    } else {
      console.log('Se alcanzó el máximo de formularios permitidos para este tipo.');
    }
  }



  crearFormularioUbicacionConDatosIngresados(): any {

    return {
      titulo_ubicacion: '',
      direccion: '',
      ciudad:   '',   
      latitud: '',
      longitud: '' ,
      swActivarLatitud : this.swActivarLatitud
    };

  }

  crearFormularioContactoConDatosIngresados(): FormGroup {
    return this.formBuilder.group({
      titulo_contacto: [''],
      nombres_contacto: [''],
      apellido_contacto: [''],
      apellido2_contacto: [''],
      telefono_contacto: [''],
      celular_contacto: [''],
      direccion_contacto: [''],
    });
  }




  setFormBuilder(documento: string) {

    this.form = this.formBuilder.group({
      //cnpj_cpf: [null,Validators.required],
      nit: [null, Validators.required],
      nome: [
        null,
        [Validators.required, Validators.maxLength(this.maxLengthRules.nome)],
      ],

      contacto: [null],
      razaoSocial: [null],
      nomeFantasia: [null],
      vendedor: [null, Validators.required],
      cnae: [null],
      email: [null,
        [
          Validators.email,
          Validators.maxLength(this.maxLengthRules.email),
        ],
      ],
      telefone: [null],
      celular: [null],
      direccion: [null],
      tipopessoa: [null],
      nombres_contacto: [null],
      apellido_contacto: [null],
      apellido2_contacto: [null],
      telefono_contacto: [null],
      celular_contacto: [null],
      ciudad: [null],
      direccion_contacto: [null],
      ciudadUbi: [null],
      titulo_contacto: [null],
      titulo_ubicacion: [],
      ubicacion: this.formBuilder.array([]),
      contactos: this.formBuilder.array([]),
      nombre_ciudad : []



    });

    this.form.get('tipopessoa').valueChanges.subscribe((value) => {
      if (value === 'P' || value === 'G' || value === 'E') {
        this.form.get('nit').setValidators([Validators.required]);
        this.form.get('razaoSocial').setValidators([Validators.required]);
      } else {
        this.form.get('nit').clearValidators();
        this.form.get('razaoSocial').clearValidators();
      }
      this.form.get('nit').updateValueAndValidity();
      this.form.get('razaoSocial').updateValueAndValidity();
    });

  }
  onSubmit() {
    /* this.postAkna(20081);
    return; */

    const tipoPessoaOptions = {
      S: 'Sociedades',
      P: 'Privado',
      G: 'Gobierno',
      E: 'Empleado'
    };
    const tipopessoa = this.form.value.tipopessoa;
    const tipopersona = tipoPessoaOptions[tipopessoa];
    const data = {
      ubicacion: [],
      contactos: [],
    };
    this.ubicacionFormularios.forEach((formulario) => {

      data.ubicacion.push(formulario.value);
    });

    // Agregar datos de contactos desde contactoFormularios
    this.contactoFormularios.forEach((formulario) => {
      data.contactos.push(formulario.value);
    });

    if (this.form.valid) {
      this.loaderNavbar = true;
      this.submittingForm = true;
      let formObj = {};

      formObj = {
        tipo_pessoa: tipopessoa,
        tipo_persona: tipopersona,
        id_vendedor: this.form.value.vendedor,
        nombres: this.form.value.nome,
        razonSocial: this.form.value.razaoSocial,
        nomeFantasia: this.form.value.nomeFantasia,
        nit: this.form.value.nit,
        id_rubro: this.form.value.cnae,
        email: this.form.value.email,
        telefono: this.form.value.telefone,
        celular: this.form.value.celular,
        nombre_factura: '',
        ubicacion: data.ubicacion, // Asigna los datos de ubicación directamente aquí
        contactos: data.contactos,

      }; console.log('Datos antes de enviarlos:', formObj);

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

            if (response.response === 200) {
              this.pnotifyService.success('Cliente registrado.');
              this.formChanged = false;
              this.router.navigate(['../cadastro', response.result], {
                relativeTo: this.activatedRoute,
              });
            } else if (response.response === 204) {
              this.pnotifyService.notice('No se registro.');
            } else {
              this.pnotifyService.notice(` ${response.detalle}`);
            }
          },
          (error: any) => {
            this.pnotifyService.notice('Ocurrio un error.');
          }
        );

    }
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
   this.ubicaciones[index] =  { latitud: -17.78629, longitud: -63.18117 }
    if (index >= 0) {
      this.ubicacionFormularios[index].swActivarLatitud= true
    } else {
      this.ubicacionFormularios[index].swActivarLatitud= false
    }
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
      return 'is-required';
    }
  }

  showDetails(): void {
    this.modalRef = this.modalService.show(
      this.modalDetalhesCliente,
      this.modalConfig
    );
  }

  onCloseDetails(): void {
    this.modalRef.hide();
  }

  onNavigateDetail(): void {
    if (this.dadosCliente.podeAcessar == 1) {
      this.onCloseDetails();
      this.router.navigate(['../detalhes', this.dadosCliente.codCliente], {
        relativeTo: this.activatedRoute,
      });
    } else {
      this.pnotifyService.notice('Este cliente no pertenece a su cartera');
    }
  }

  onInput() {
    this.formChanged = true;

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
