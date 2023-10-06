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
      descricao: 'Pre-Registro',
    },
  ];

  public MASKS = MASKS;

  vendedores: any = [];
  cnaes: any = [];

  form: FormGroup;
  formChanged = false;
  tipoPessoa : any = {};
  submittingForm = false;

  maxLengthRules: any = {};
  maxLengthMessages: any = {};

  dadosCliente: any = {};

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

      // if (Object.keys(queryParams).length > 0) {
      //   if (queryParams['cpf']) {
      //     this.tipoPessoa = 'F';
      //     documento = queryParams['cpf'];
      //   } else if (queryParams['cnpj']) {
      //     this.tipoPessoa = 'J';
      //     documento = queryParams['cnpj'];
      //   }
      // }

      this.registrarAcesso();
      this.setMaxLengthRules();
      this.setFormBuilder(documento);
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
          if (response[0].responseCode === 200) {
            this.vendedores = response[0].result;
          } else {
            this.handleFormFieldsError();
          }

          if (response[1].responseCode === 200) {
            this.cnaes = response[1].result.map(cnae => ({
              id: cnae.codigo,
              descricao: cnae.descricao,
              codigo: cnae.codigo 
            }));
          } else {
            this.handleFormFieldsError();
          }
        },
        (error: any) => {
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

  setFormBuilder(documento: string) {
    

    // if (documento != null) {
    //   if (this.tipoPessoa == 'F') {
    //     cpf = documento;
    //   } else if (this.tipoPessoa == 'J') {
    //     cnpj = documento;
    //   }
    // }

    this.form = this.formBuilder.group({
      cnpj_cpf: [null,Validators.required],
      nome: [
        null,
        [Validators.required, Validators.maxLength(this.maxLengthRules.nome)],
      ],
      apellido1: [
        null,
        [
          Validators.required,
          Validators.maxLength(this.maxLengthRules.apellido1),
        ],
      ],
      apellido2: [
        null,
        [
          Validators.required,
          Validators.maxLength(this.maxLengthRules.apellido2),
        ],
      ],
      
      nit: [null],
      contacto:[null],
      razaoSocial: [null],
      nomeFantasia: [null],
      vendedor: [null],
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
      // atividadePrincipal: this.formBuilder.array([]),
      // atividadeSecundaria: this.formBuilder.array([]),
      //CAMPOS DE CONTACTO 
      nombrecontacto: [null],
      apellido_contacto: [null],
      apellido2_contacto: [null],
      telefonocontacto: [null],
      celularcontacto: [null],
      direccion_contacto: [null],
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

  setType(type: string) {
    // this.tipoPessoa = type;
    this.form.reset();

    // if (this.tipoPessoa == 'F') {
    //   this.form.controls.cpf.setValidators([Validators.required]);
    //   this.form.controls.cpf.updateValueAndValidity();
    //   this.form.controls.nome.setValidators([
    //     Validators.required,
    //     Validators.maxLength(this.maxLengthRules.nome),
    //   ]);
    //   this.form.controls.nome.updateValueAndValidity();
    //   this.form.controls.sobrenome.setValidators([
    //     Validators.required,
    //     Validators.maxLength(this.maxLengthRules.sobrenome),
    //   ]);
    //   this.form.controls.sobrenome.updateValueAndValidity();

    //   this.form.controls.cnpj.clearValidators();
    //   this.form.controls.cnpj.updateValueAndValidity();
    //   this.form.controls.razaoSocial.clearValidators();
    //   this.form.controls.razaoSocial.updateValueAndValidity();
    //   this.form.controls.nomeFantasia.clearValidators();
    //   this.form.controls.nomeFantasia.updateValueAndValidity();
    //   this.form.controls.cnae.clearValidators();
    //   this.form.controls.cnae.updateValueAndValidity();
    // } else if (this.tipoPessoa == 'J') {
    //   this.form.controls.cnpj.setValidators([Validators.required]);
    //   this.form.controls.cnpj.updateValueAndValidity();
    //   this.form.controls.razaoSocial.setValidators([
    //     Validators.required,
    //     Validators.maxLength(this.maxLengthRules.razaoSocial),
    //   ]);
    //   this.form.controls.razaoSocial.updateValueAndValidity();
    //   this.form.controls.nomeFantasia.setValidators([
    //     Validators.required,
    //     Validators.maxLength(this.maxLengthRules.nomeFantasia),
    //   ]);
    //   this.form.controls.nomeFantasia.updateValueAndValidity();
    //   this.form.controls.cnae.setValidators([Validators.required]);
    //   this.form.controls.cnae.updateValueAndValidity();

    //   this.form.controls.cpf.clearValidators();
    //   this.form.controls.cpf.updateValueAndValidity();
    //   this.form.controls.nome.clearValidators();
    //   this.form.controls.nome.updateValueAndValidity();
    //   this.form.controls.sobrenome.clearValidators();
    //   this.form.controls.sobrenome.updateValueAndValidity();
    // }
  }

  // get atividadePrincipal() {
  //   return this.form.get('atividadePrincipal') as FormArray;
  // }

  // get atividadeSecundaria() {
  //   return this.form.get('atividadeSecundaria') as FormArray;
  // }

  // pushAtividadePrincipal(atividade: any) {
  //   while (this.atividadePrincipal.length !== 0) {
  //     this.atividadePrincipal.removeAt(0);
  //   }

  //   atividade.code = atividade.code.replace(/\D/g, '');

  //   if (atividade.code != '0000000') {
  //     this.atividadePrincipal.push(
  //       this.formBuilder.group({
  //         cnae: [atividade.code],
  //         descricao: [atividade.text],
  //       })
  //     );
  //   }
  // }

  // pushAtividadeSecundaria(atividades: any) {
  //   while (this.atividadeSecundaria.length !== 0) {
  //     this.atividadeSecundaria.removeAt(0);
  //   }

  //   if (atividades.length > 0) {
  //     for (let i = 0; i < atividades.length; i++) {
  //       atividades[i].code = atividades[i].code.replace(/\D/g, '');

  //       if (atividades[i].code != '0000000') {
  //         this.atividadeSecundaria.push(
  //           this.formBuilder.group({
  //             cnae: [atividades[i].code],
  //             descricao: [atividades[i].text],
  //           })
  //         );
  //       }
  //     }
  //   }
  // }

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
  
    if (this.form.valid) {
      this.loaderNavbar = true;
      this.submittingForm = true;
      let formObj = {};
  
      
      formObj = {
        tipo_pessoa: tipopessoa,
        tipo_persona: tipopersona,
        carnet: this.form.value.cnpj_cpf,
        id_vendedor: this.form.value.vendedor,
        nombre: this.form.value.nome,
        apellido1: this.form.value.apellido1,
        apellido2: this.form.value.apellido2,
        razonSocial: this.form.value.razaoSocial,
        nomeFantasia: this.form.value.nomeFantasia,
        nit: this.form.value.nit,
        id_rubro: this.form.value.cnae,
        email: this.form.value.email,
        // emailMarketing: this.form.value.emailMarketing,
        telefono: this.form.value.telefone,
        celular: this.form.value.celular,
        // atividadePrincipal: this.form.value.atividadePrincipal,
        // atividadeSecundaria: this.form.value.atividadeSecundaria,
        Ubicacion: [
          {
              direccion: this.form.value.direccion,
              id_ciudad: ''
          }
        ],
        nombre_factura:'',
        contactos:[
          {
        contacto:this.form.value.contacto,
        nombres_contacto:this.form.value.nombrecontacto,
        apellido_contacto:this.form.value.apellido_contacto,
        apellido2_contacto:this.form.value.apellido2_contacto,
        telefono_contacto:this.form.value.telefonocontacto,
        celular_contacto:this.form.value.celularcontacto,
        direccion_contacto:this.form.value.direccion_contacto,
        latitude_contacto:0,
        longitude_contacto:0,
        codigo_cliente:'',
        }
      ],

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
            console.log(response);
            if (response.responseCode === 200 && response.detalle === "Se creo registro") {
              this.pnotifyService.success('Cliente registrado.');
              this.formChanged = false;
              this.router.navigate(['../cadastro', response.result], {
                relativeTo: this.activatedRoute,
              });
            } else if (response.responseCode === 403) {
              this.pnotifyService.notice('Falha ao atribuir vendedor ao cadastro.');
            } else {  
              this.pnotifyService.notice(` ${response.detalle}`);
            }
          },
          (error: any) => {
            this.pnotifyService.notice('Ocorreu um erro ao cadastrar o cliente.');
          }
        );
        
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
