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
  tipoPessoa = 'F';
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
    this.titleService.setTitle('Pré-cadastro');
    this.getFormFields();
    this.activatedRoute.queryParams.subscribe((queryParams: any) => {
      let documento = null;

      if (Object.keys(queryParams).length > 0) {
        if (queryParams['cpf']) {
          this.tipoPessoa = 'F';
          documento = queryParams['cpf'];
        } else if (queryParams['cnpj']) {
          this.tipoPessoa = 'J';
          documento = queryParams['cnpj'];
        }
      }

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
            this.cnaes = response[1].result;
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
      nome: `Nome deve conter até ${this.maxLengthRules.nome} caracteres.`,
      sobrenome: `Sobrenome deve conter até ${this.maxLengthRules.sobrenome} caracteres.`,
      razaoSocial: `Razão social deve conter até ${this.maxLengthRules.razaoSocial} caracteres.`,
      nomeFantasia: `Nome fantasia deve conter até ${this.maxLengthRules.nomeFantasia} caracteres.`,
      emailNfe: `E-mail NF-e deve conter até ${this.maxLengthRules.emailNfe} caracteres.`,
      // emailMarketing: `E-mail Marketing deve conter até ${this.maxLengthRules.emailNfe} caracteres.`,
    };
  }

  setFormBuilder(documento: string) {
    let cpf = null;
    let cnpj = null;

    if (documento != null) {
      if (this.tipoPessoa == 'F') {
        cpf = documento;
      } else if (this.tipoPessoa == 'J') {
        cnpj = documento;
      }
    }

    this.form = this.formBuilder.group({
      cpf: [cpf, [Validators.nullValidator]],
      nome: [
        null,
        [Validators.required, Validators.maxLength(this.maxLengthRules.nome)],
      ],
      sobrenome: [
        null,
        [
          Validators.required,
          Validators.maxLength(this.maxLengthRules.sobrenome),
        ],
      ],
      cnpj: [cnpj, [NgBrazilValidators.cnpj]],
      razaoSocial: [null],
      nomeFantasia: [null],
      vendedor: [null],
      cnae: [null],
      emailNfe: [
        null,
        [
          Validators.required,
          Validators.email,
          Validators.maxLength(this.maxLengthRules.emailNfe),
        ],
      ],
      // emailMarketing: [
      //   null,
      //   [Validators.email, Validators.maxLength(this.maxLengthRules.emailNfe)],
      // ],
      telefone: [null, [Validators.required]],
      atividadePrincipal: this.formBuilder.array([]),
      atividadeSecundaria: this.formBuilder.array([]),
    });

    this.setType(this.tipoPessoa);

    if (documento != null) {
      if (this.tipoPessoa == 'F') {
        this.validateCPF();
      } else if (this.tipoPessoa == 'J') {
        this.validateCNPJ();
      }
    }
  }

  setType(type: string) {
    this.tipoPessoa = type;
    this.form.reset();

    if (this.tipoPessoa == 'F') {
      this.form.controls.cpf.setValidators([Validators.required]);
      this.form.controls.cpf.updateValueAndValidity();
      this.form.controls.nome.setValidators([
        Validators.required,
        Validators.maxLength(this.maxLengthRules.nome),
      ]);
      this.form.controls.nome.updateValueAndValidity();
      this.form.controls.sobrenome.setValidators([
        Validators.required,
        Validators.maxLength(this.maxLengthRules.sobrenome),
      ]);
      this.form.controls.sobrenome.updateValueAndValidity();

      this.form.controls.cnpj.clearValidators();
      this.form.controls.cnpj.updateValueAndValidity();
      this.form.controls.razaoSocial.clearValidators();
      this.form.controls.razaoSocial.updateValueAndValidity();
      this.form.controls.nomeFantasia.clearValidators();
      this.form.controls.nomeFantasia.updateValueAndValidity();
      this.form.controls.cnae.clearValidators();
      this.form.controls.cnae.updateValueAndValidity();
    } else if (this.tipoPessoa == 'J') {
      this.form.controls.cnpj.setValidators([Validators.required]);
      this.form.controls.cnpj.updateValueAndValidity();
      this.form.controls.razaoSocial.setValidators([
        Validators.required,
        Validators.maxLength(this.maxLengthRules.razaoSocial),
      ]);
      this.form.controls.razaoSocial.updateValueAndValidity();
      this.form.controls.nomeFantasia.setValidators([
        Validators.required,
        Validators.maxLength(this.maxLengthRules.nomeFantasia),
      ]);
      this.form.controls.nomeFantasia.updateValueAndValidity();
      this.form.controls.cnae.setValidators([Validators.required]);
      this.form.controls.cnae.updateValueAndValidity();

      this.form.controls.cpf.clearValidators();
      this.form.controls.cpf.updateValueAndValidity();
      this.form.controls.nome.clearValidators();
      this.form.controls.nome.updateValueAndValidity();
      this.form.controls.sobrenome.clearValidators();
      this.form.controls.sobrenome.updateValueAndValidity();
    }
  }

  get atividadePrincipal() {
    return this.form.get('atividadePrincipal') as FormArray;
  }

  get atividadeSecundaria() {
    return this.form.get('atividadeSecundaria') as FormArray;
  }

  pushAtividadePrincipal(atividade: any) {
    while (this.atividadePrincipal.length !== 0) {
      this.atividadePrincipal.removeAt(0);
    }

    atividade.code = atividade.code.replace(/\D/g, '');

    if (atividade.code != '0000000') {
      this.atividadePrincipal.push(
        this.formBuilder.group({
          cnae: [atividade.code],
          descricao: [atividade.text],
        })
      );
    }
  }

  pushAtividadeSecundaria(atividades: any) {
    while (this.atividadeSecundaria.length !== 0) {
      this.atividadeSecundaria.removeAt(0);
    }

    if (atividades.length > 0) {
      for (let i = 0; i < atividades.length; i++) {
        atividades[i].code = atividades[i].code.replace(/\D/g, '');

        if (atividades[i].code != '0000000') {
          this.atividadeSecundaria.push(
            this.formBuilder.group({
              cnae: [atividades[i].code],
              descricao: [atividades[i].text],
            })
          );
        }
      }
    }
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
      return 'is-required';
    }
  }

  validateCPF() {
    if (this.form.controls.cpf.valid) {
      this.loaderNavbar = true;
      this.dadosCliente = {};

      this.clientesService
        .getExisteCpfCnpj(this.form.value.cpf.replace(/\D/g, ''), true)
        .pipe(
          finalize(() => {
            this.loaderNavbar = false;
          })
        )
        .subscribe((response: any) => {
          if (response.responseCode === 200) {
            if (response.result.verificacao == 1) {
              this.form.controls.cpf.setErrors({
                incorrect: true,
              });
              this.pnotifyService.notice('O CPF informado já está cadastrado.');

              if (Object.keys(response.result.dadosCliente).length > 0) {
                this.formChanged = false;
                this.dadosCliente = response.result.dadosCliente;
                this.showDetails();
              }
            }
          }
        });
    }
  }

  validateCNPJ() {
    if (this.form.controls.cnpj.valid) {
      this.loaderNavbar = true;
      this.dadosCliente = {};

      this.clientesService
        .getExisteCpfCnpj(this.form.value.cnpj.replace(/\D/g, ''), true)
        .pipe(
          finalize(() => {
            this.loaderNavbar = false;
          })
        )
        .subscribe((response: any) => {
          if (response.responseCode === 200) {
            if (response.result.verificacao == 1) {
              this.form.controls.cnpj.setErrors({
                incorrect: true,
              });
              this.pnotifyService.notice(
                'O CNPJ informado já está cadastrado.'
              );

              if (Object.keys(response.result.dadosCliente).length > 0) {
                this.formChanged = false;
                this.dadosCliente = response.result.dadosCliente;
                this.showDetails();
              }
            } else {
              this.loaderNavbar = true;

              this.getCnpjData(this.form.value.cnpj)
                .pipe(
                  finalize(() => {
                    this.loaderNavbar = false;
                  })
                )
                .subscribe((response: any) => {
                  this.form.controls.razaoSocial.setValue(response.nome);
                  this.form.controls.nomeFantasia.setValue(response.fantasia);

                  if (response.atividade_principal[0].code) {
                    this.checkCnae(response.atividade_principal[0]);
                  }

                  this.pushAtividadePrincipal(response.atividade_principal[0]);
                  this.pushAtividadeSecundaria(response.atividades_secundarias);
                });
            }
          }
        });
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

  checkCnae(data: any) {
    const cnae = {
      id: parseInt(data.code.replace(/\D/g, '')),
      descricao: data.text,
    };

    let exists = false;

    for (let i = 0; i < this.cnaes.length; i++) {
      if (this.cnaes[i].id == cnae.id) {
        exists = true;
      }
    }

    if (!exists) {
      this.cnaes.push(cnae);
    }

    this.form.controls.cnae.setValue(cnae.id);
  }

  getCnpjData(cnpj: string) {
    return this.cnpjService.getData(cnpj);
  }

  onSubmit() {
    /* this.postAkna(20081);
    return; */

    if (this.form.valid) {
      this.loaderNavbar = true;
      this.submittingForm = true;
      let formObj = {};

      if (this.tipoPessoa == 'F') {
        formObj = {
          tipoPessoa: this.tipoPessoa,
          cpf: this.form.value.cpf,
          vendedor: this.form.value.vendedor,
          nome: this.form.value.nome,
          sobrenome: this.form.value.sobrenome,
          emailNfe: this.form.value.emailNfe,
          // emailMarketing: this.form.value.emailMarketing,
          telefone: this.form.value.telefone,
        };
      } else if (this.tipoPessoa == 'J') {
        formObj = {
          tipoPessoa: this.tipoPessoa,
          cnpj: this.form.value.cnpj,
          vendedor: this.form.value.vendedor,
          razaoSocial: this.form.value.razaoSocial,
          nomeFantasia: this.form.value.nomeFantasia,
          cnae: this.functionsService.completaZeroEsquerda(
            this.form.value.cnae,
            7
          ),
          emailNfe: this.form.value.emailNfe,
          // emailMarketing: this.form.value.emailMarketing,
          telefone: this.form.value.telefone,
          atividadePrincipal: this.form.value.atividadePrincipal,
          atividadeSecundaria: this.form.value.atividadeSecundaria,
        };
      }

      this.clientesService
        .postCliente(formObj)
        .pipe(
          finalize(() => {
            this.loaderNavbar = false;
            this.submittingForm = false;
          })
        )
        .subscribe(
          (response: any) => {
            if (response.responseCode === 200) {
              this.pnotifyService.success('O cliente foi cadastrado.');
              this.formChanged = false;

              /* this.postAkna(response.result); */
              this.router.navigate(['../cadastro', response.result], {
                relativeTo: this.activatedRoute,
              });
            } else if (response.responseCode === 403) {
              this.pnotifyService.notice(
                'Falha ao atribuir vendedor ao cadastro.'
              );
            } else {
              this.pnotifyService.error(
                'Ocorreu um erro ao cadastrar o cliente.'
              );
            }
          },
          (error: any) => {
            this.pnotifyService.error(
              'Ocorreu um erro ao cadastrar o cliente.'
            );
          }
        );
    }
  }

  onInput() {
    this.formChanged = true;
  }

  formCanDeactivate() {
    if (this.formChanged) {
      if (confirm('Informações não salvas serão perdidas. Deseja continuar?')) {
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

  // Função que envia e-mail de boas vindas  para um novo cliente e grava o log dessa ação.
  /* postAkna(cliente){
    let param = {};

    if(this.form.value['nome']){
      param = {
        'codigoCliente'   : cliente,
        'nomeRemetente'   : this.form.value['nome'] + ' ' + this.form.value['sobrenome'],
        'emailRemetente'  : this.form.value['emailNfe']
      }
    } else {
      param = {
        'codigoCliente'   : cliente,
        'nomeRemetente'   : this.form.value['razaoSocial'],
        'emailRemetente'  : this.form.value['emailNfe']
      }
    }

    this.preCadastroService
      .postAkna(param)
      .subscribe((response) => {
      console.log(response)
    });
  } */
}
