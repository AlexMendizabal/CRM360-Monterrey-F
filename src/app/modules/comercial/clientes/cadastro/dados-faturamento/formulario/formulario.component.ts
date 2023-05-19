import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
  FormArray
} from '@angular/forms';
import { Location } from '@angular/common';
import { take, switchMap, finalize } from 'rxjs/operators';
import { Subscription, EMPTY } from 'rxjs';

// ng-brazil
import { NgBrazilValidators } from 'ng-brazil';
import { utilsBr } from 'js-brasil';

// Interfaces
import { IFormCanDeactivate } from 'src/app/guards/iform-candeactivate';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { ComercialClientesCadastroDadosFaturamentoFormularioService } from './formulario.service';
import { ComercialClientesCadastroService } from '../../cadastro.service';
import { ComercialClientesService } from 'src/app/modules/comercial/services/clientes.service';
import { ComercialService } from 'src/app/modules/comercial/comercial.service';

@Component({
  selector: 'comercial-clientes-cadastro-dados-faturamento-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss']
})
export class ComercialClientesCadastroDadosFaturamentoFormularioComponent
  implements OnInit, AfterViewInit, OnDestroy, IFormCanDeactivate {
  private subscriptionCancel: Subscription;
  private subscriptionSubmit: Subscription;

  public MASKS = utilsBr.MASKS;

  profile: any = {};
  showPermissionDenied = false;
  disable: boolean;

  loaderFullScreen = true;
  showAtividadesSecundarias = false;

  tipoPessoa = '';
  codCliente: number;

  form: FormGroup;
  formChanged = false;
  formRules: any = {};

  tiposCadastro: any = [];
  regimesTributacao: any = [];
  contribuintes: any = [];
  setorAtividades: any = [];
  finalidadesMaterial: any = [];
  cnaes: any = [];

  selectedAtividadeSecundaria: any;

  originalValues: any = {};

  maxLengthRules: any = {};
  maxLengthMessages: any = {};

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private formService: ComercialClientesCadastroDadosFaturamentoFormularioService,
    private cadastroService: ComercialClientesCadastroService,
    private comercialService: ComercialService,
    private location: Location,
    private clientesService: ComercialClientesService,
    private pnotifyService: PNotifyService,
    private confirmModalService: ConfirmModalService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit() {
    this.cancelSubscription();
    this.submitSubscription();
    this.getPerfil()

    const snapshot = this.activatedRoute.snapshot.data;

    if (snapshot.data.responseCode === 200) {
      this.getFormFields(snapshot.data.result);
      this.setMaxLengthRules();
      this.setFormBuilder(snapshot.data.result);
      this.activatedRoute.parent.parent.params.subscribe(params => {
        this.codCliente = params.id;
      });
    } else {
      this.pnotifyService.error();
      this.location.back();
    }
  }

  ngAfterViewInit() {
    this.cadastroService.onNotifyLoaded(true);
  }

  ngOnDestroy() {
    this.subscriptionCancel.unsubscribe();
    this.subscriptionSubmit.unsubscribe();
  }

  cancelSubscription() {
    this.subscriptionCancel = this.cadastroService.notifyCancelObservable$.subscribe(
      (response: any) => {
        if (response) {
          this.onCancel();
        }
      }
    );
  }

  submitSubscription() {
    this.subscriptionSubmit = this.cadastroService.notifySubmitObservable$.subscribe(
      (response: any) => {
        if (response) {
          this.onSubmit();
        }
      }
    );
  }

  getPerfil() {
    this.comercialService
      .getPerfil()
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.responseCode === 200) {
            this.profile = response.result;
            //console.log(this.profile)
            if (
              this.profile.coordenador === true ||
              this.profile.gestor === true
            ) {
              this.setNotaEnable();
              //this.disable = false;
              //console.log(this.disable);
            } else if (
              this.profile.vendedor === true
            ) {
              this.setNotaDisable();
              //this.disable = true;
              //console.log(this.disable);
            } else {
              this.showPermissionDenied = true;
            }
          } else {
            this.showPermissionDenied = true;
          }
        },
        error: (error: any) => {
          this.showPermissionDenied = true;
        }
      });
  }

  setNotaDisable() {
    this.form.controls.notaCliente.disable();
  }

  setNotaEnable() {
    this.form.controls.notaCliente.enable();
  }

  setMaxLengthRules() {
    this.maxLengthRules = this.activatedRoute.snapshot.data.rules.data;
    this.maxLengthMessages = {
      nome: `Nome deve conter até ${this.maxLengthRules.nome} caracteres.`,
      sobrenome: `Sobrenome deve conter até ${this.maxLengthRules.sobrenome} caracteres.`,
      razaoSocial: `Razão social deve conter até ${this.maxLengthRules.razaoSocial} caracteres.`,
      nomeFantasia: `Nome fantasia deve conter até ${this.maxLengthRules.nomeFantasia} caracteres.`,
      rg: `RG deve conter até ${this.maxLengthRules.rg} caracteres.`,
      inscricaoEstadual: `Inscrição estadual deve conter até ${this.maxLengthRules.inscricaoEstadual} caracteres.`,
      inscricaoProdRural: `Inscrição produtor rural deve conter até ${this.maxLengthRules.inscricaoProdRural} caracteres.`
    };
  }

  setFormBuilder(data: any) {
    let autoUpdateNota = data.autoUpdateNota == 1 ? false : true;

    if (data.tipoPessoa == 'F') {
      this.tipoPessoa = 'F';

      this.form = this.formBuilder.group({
        notaCliente: [0, [Validators.required]],
        autoUpdateNota: [autoUpdateNota],
        codCliente: [data.codCliente],
        tipoPessoa: [data.tipoPessoa],
        cpf: [data.cpf, [NgBrazilValidators.cpf, Validators.required]],
        rg: [
          data.rg,
          [Validators.required, Validators.maxLength(this.maxLengthRules.rg)]
        ],
        nome: [
          data.nome,
          [Validators.required, Validators.maxLength(this.maxLengthRules.nome)]
        ],
        sobrenome: [
          data.sobrenome,
          [
            Validators.required,
            Validators.maxLength(this.maxLengthRules.sobrenome)
          ]
        ],
        tipoCadastro: [{ value: data.idTipoCadastro, disabled: true }],
        inscricaoProdRural: [
          data.inscricaoProdRural,
          Validators.maxLength(this.maxLengthRules.inscricaoProdRural)
        ],
        contribuinte: [data.idContribuinte],
        setorAtividade: [
          {
            value: data.idSetorAtividade != null ? data.idSetorAtividade : 2,
            disabled: true
          }
        ],
        limiteCredito: [{ value: data.limiteCredito, disabled: true }],
        creditoSeguradora: [{ value: data.creditoSeguradora, disabled: true }],
        dataInclusao: [{ value: data.dataInclusao, disabled: true }],
        proximaAnaliseCredito: [
          { value: data.proximaAnaliseCredito, disabled: true }
        ],
        quemCadastrou: [{ value: data.quemCadastrou, disabled: true }],
        somenteCarteira: [
          {
            value: data.somenteCarteira == 0 ? false : true,
            disabled: true
          }
        ],
        boletoDescontado: [
          {
            value: data.boletoDescontado == 0 ? false : true,
            disabled: true
          }
        ],
        somenteAVista: [
          {
            value: data.somenteAVista == 0 ? false : true,
            disabled: true
          }
        ],
        exigePesagem: [
          {
            value: data.exigePesagem == 0 ? false : true,
            disabled: true
          }
        ]
      });

      this.checkValidatorsContribuinte(data.inscricaoProdRural);
    } else if (data.tipoPessoa == 'J') {
      this.tipoPessoa = 'J';

      this.form = this.formBuilder.group({
        notaCliente: [data.notaCliente, Validators.required],
        autoUpdateNota: [autoUpdateNota],
        codCliente: [data.codCliente],
        tipoPessoa: [data.tipoPessoa],
        cnpj: [data.cnpj, [NgBrazilValidators.cnpj]],
        razaoSocial: [
          data.razaoSocial,
          [Validators.maxLength(this.maxLengthRules.razaoSocial)]
        ],
        nomeFantasia: [
          data.nomeFantasia,
          [
            Validators.required,
            Validators.maxLength(this.maxLengthRules.nomeFantasia)
          ]
        ],
        tipoCadastro: [{ value: data.idTipoCadastro, disabled: true }],
        tributacao: [data.idTributacao],
        contribuinte: [data.idContribuinte],
        inscricaoEstadual: [data.inscricaoEstadual],
        setorAtividade: [data.idSetorAtividade, [Validators.required]],
        cnae: [data.idCnae, [Validators.required]],
        finalidadeMaterial: [data.idFinalidadeMaterial],
        atividadesSecundarias: this.formBuilder.array([]),
        limiteCredito: [{ value: data.limiteCredito, disabled: true }],
        creditoSeguradora: [{ value: data.creditoSeguradora, disabled: true }],
        dataInclusao: [{ value: data.dataInclusao, disabled: true }],
        proximaAnaliseCredito: [
          { value: data.proximaAnaliseCredito, disabled: true }
        ],
        quemCadastrou: [{ value: data.quemCadastrou, disabled: true }],
        somenteCarteira: [
          {
            value: data.somenteCarteira == 0 ? false : true,
            disabled: true
          }
        ],
        boletoDescontado: [
          {
            value: data.boletoDescontado == 0 ? false : true,
            disabled: true
          }
        ],
        somenteAVista: [
          {
            value: data.somenteAVista == 0 ? false : true,
            disabled: true
          }
        ],
        exigePesagem: [
          {
            value: data.exigePesagem == 0 ? false : true,
            disabled: true
          }
        ],
        marca: [
          {
            value: data.marca == 0 ? false : true,
            disabled: true
          }
        ]
      });

      Object.assign(this.originalValues, {
        finalidadeMaterial: data.idFinalidadeMaterial
      });

      this.checkValidatorsCnpj(data.cnpj);
      this.checkValidatorsRazaoSocial(data.razaoSocial);
      this.checkValidatorsInscricaoEstadual(data.idContribuinte);
      this.checkValidatorsFinalidadesMaterial(data.idFinalidadeMaterial);
      this.setFormAtividadesSecundarias(data.atividadesSecundarias);
    }
  }

  checkValidatorsContribuinte(inscricaoProdRural: string) {
    if (inscricaoProdRural != null) {
      this.form.controls.contribuinte.enable();
      this.form.controls.contribuinte.setValidators([Validators.required]);
    } else {
      this.form.controls.contribuinte.disable();
      this.form.controls.contribuinte.clearValidators();
    }
    this.form.controls.contribuinte.updateValueAndValidity();
  }

  checkValidatorsCnpj(cnpj: string) {
    if (cnpj.length == 0) {
      this.form.controls.cnpj.enable();
      this.form.controls.cnpj.setValidators([Validators.required]);
    } else {
      this.form.controls.cnpj.disable();
      this.form.controls.cnpj.clearValidators();
    }
    this.form.controls.cnpj.updateValueAndValidity();
  }

  checkValidatorsRazaoSocial(razaoSocial: string) {
    if (razaoSocial.length == 0) {
      this.form.controls.razaoSocial.enable();
      this.form.controls.razaoSocial.setValidators([Validators.required]);
    } else {
      this.form.controls.razaoSocial.disable();
      this.form.controls.razaoSocial.clearValidators();
    }
    this.form.controls.razaoSocial.updateValueAndValidity();
  }

  checkValidatorsInscricaoEstadual(contribuinte: number | string) {
    if (contribuinte == 1) {
      this.form.controls.inscricaoEstadual.setValidators([
        Validators.required,
        Validators.maxLength(18)
      ]);
    } else {
      this.form.controls.inscricaoEstadual.clearValidators();
    }
    this.form.controls.inscricaoEstadual.updateValueAndValidity();
  }

  checkValidatorsFinalidadesMaterial(finalidadeMaterial: number | string) {
    if (finalidadeMaterial == '' || finalidadeMaterial == null) {
      this.form.controls.finalidadeMaterial.enable();
      this.form.controls.finalidadeMaterial.setValidators([
        Validators.required
      ]);
    } else {
      this.form.controls.finalidadeMaterial.disable();
      this.form.controls.finalidadeMaterial.clearValidators();
    }
    this.form.controls.finalidadeMaterial.updateValueAndValidity();
  }

  setFormAtividadesSecundarias(data: any) {
    if (data.length > 0 && data != null) {
      for (let i = 0; i < data.length; i++) {
        this.pushAtividadeSecundaria(data[i]);
      }
    }
  }

  onChangeContribuinte(contribuinte: number | string) {
    if (contribuinte == 9) {
      this.form.controls.finalidadeMaterial.setValue(5);
      this.form.controls.finalidadeMaterial.disable();
    } else {
      this.form.controls.finalidadeMaterial.setValue(
        this.originalValues.finalidadeMaterial
      );
    }
  }

  getFormFields(data: any) {
    if (data.tipoPessoa == 'F') {
      this.formService
        .loadDependenciesPF()
        .pipe(
          finalize(() => {
            this.loaderFullScreen = false;
            this.cadastroService.onNotifyLoaded(false);
          })
        )
        .subscribe({
          next: (response: any) => {
            if (response[0].responseCode === 200) {
              this.tiposCadastro = response[0].result;
            } else {
              this.handleFormFieldsError();
            }

            if (response[1].responseCode === 200) {
              this.contribuintes = response[1].result;
            } else {
              this.handleFormFieldsError();
            }

            if (response[2].responseCode === 200) {
              this.setorAtividades = response[2].result;
            } else {
              this.handleFormFieldsError();
            }
          },
          error: (error: any) => {
            this.handleFormFieldsError();
          }
        });
    } else if (data.tipoPessoa == 'J') {
      this.formService
        .loadDependenciesPJ()
        .pipe(
          finalize(() => {
            this.loaderFullScreen = false;
            this.cadastroService.onNotifyLoaded(false);
          })
        )
        .subscribe({
          next: (response: any) => {
            if (response[0].responseCode === 200) {
              this.tiposCadastro = response[0].result;
            }

            if (response[1].responseCode === 200) {
              this.regimesTributacao = response[1].result;
            } else {
              this.handleFormFieldsError();
            }

            if (response[2].responseCode === 200) {
              this.contribuintes = response[2].result;
            } else {
              this.handleFormFieldsError();
            }

            if (response[3].responseCode === 200) {
              this.setorAtividades = response[3].result;
            } else {
              this.handleFormFieldsError();
            }

            if (response[4].responseCode === 200) {
              this.finalidadesMaterial = response[4].result;
            } else {
              this.handleFormFieldsError();
            }

            if (response[5].responseCode === 200) {
              this.cnaes = response[5].result;
            } else {
              this.handleFormFieldsError();
            }
          },
          error: (error: any) => {
            this.handleFormFieldsError();
          }
        });
    }
  }

  handleFormFieldsError() {
    this.pnotifyService.error();
    this.location.back();
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

  onInscricaoProdutorRural() {
    if (this.form.value.inscricaoProdRural.length > 0) {
      this.form.controls.contribuinte.enable();
      this.form.controls.contribuinte.setValidators([Validators.required]);
      this.form.controls.contribuinte.updateValueAndValidity();
    } else {
      this.form.controls.contribuinte.disable();
      this.form.controls.contribuinte.clearValidators();
      this.form.controls.contribuinte.updateValueAndValidity();
    }
  }

  get atividadesSecundarias() {
    return this.form.get('atividadesSecundarias') as FormArray;
  }

  pushAtividadeSecundaria(data: any) {
    this.atividadesSecundarias.push(
      this.formBuilder.group({
        id: [data.id],
        idCnae: [data.idCnae],
        descCnae: [data.descCnae]
      })
    );
  }

  onAtividadesSecundarias() {
    this.showAtividadesSecundarias = !this.showAtividadesSecundarias;
  }

  onAddAtividadeSecundaria() {
    if (this.selectedAtividadeSecundaria != null) {
      for (let i = 0; i < this.cnaes.length; i++) {
        if (this.cnaes[i].id == this.selectedAtividadeSecundaria) {
          this.atividadesSecundarias.push(
            this.formBuilder.group({
              id: [null],
              idCnae: [this.cnaes[i].id],
              descCnae: [this.cnaes[i].descricao]
            })
          );

          this.selectedAtividadeSecundaria = null;
        }
      }
      this.onInput();
    }
  }

  onDeleteAtividadeSecundaria(index: number) {
    if (this.atividadesSecundarias.controls[index].value.idCnae == null) {
      this.atividadesSecundarias.removeAt(index);
    } else {
      let confirm$ = this.confirmModalService.showConfirm(
        'delete',
        'Confirmar exclusão',
        'Deseja realmente prosseguir com a exclusão do registro?',
        'Cancelar',
        'Confirmar'
      );

      confirm$
        .asObservable()
        .pipe(
          take(1),
          switchMap(result =>
            result
              ? this.deleteAtividadeSecundaria(
                  this.atividadesSecundarias.controls[index].value.idCnae
                )
              : EMPTY
          )
        )
        .subscribe({
          next: (success) => {
            this.pnotifyService.success();
            this.atividadesSecundarias.removeAt(index);
            this.cadastroService.onNotifyLoaded(false);
          },
          error: (error) => {
            this.pnotifyService.error(
              'Erro ao excluir atividade. Tente novamente!'
            );
            this.cadastroService.onNotifyLoaded(false);
          }
        });
    }
  }

  deleteAtividadeSecundaria(codCnae: number) {
    this.cadastroService.onNotifyLoaded(true);
    return this.clientesService.deleteAtividadeSecundaria(
      this.codCliente,
      codCnae
    );
  }

  onInput() {
    
    this.formChanged = true;
    this.form.markAsDirty();
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

  onSubmit() {

    if(this.form.getRawValue().notaCliente == null) { 
      this.form.controls.notaCliente.setValue(0);
    }
   
    if (this.form.pristine) {
      this.location.back();
    } else {

      if (this.form.valid) {
        
        this.cadastroService.onNotifyLoaded(true);
        
        this.clientesService
          .updateDadosFaturamento(this.form.getRawValue())
          .subscribe({
            next: (response: any) => {
              if (response.responseCode === 200) {
                this.onSended();
                this.pnotifyService.success();
                this.cadastroService.onNotifyLoaded(false);
                this.formChanged = false;
                this.location.back();
              } else {
                this.handleSubmitError();
              }
            },
            error: (error: any) => {
              this.handleSubmitError();
            }
          });
      } else {
        this.pnotifyService.notice('Preencha todos os campos obrigatórios.');
      }
    }
  }

  handleSubmitError() {
    this.pnotifyService.error('Ocorreu um erro ao salvar o cadastro.');
    this.cadastroService.onNotifyLoaded(false);
  }

  onSended() {
    this.cadastroService.onNotifySended(true);
  }

}
