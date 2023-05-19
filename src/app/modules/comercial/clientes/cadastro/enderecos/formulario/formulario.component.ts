import { ComercialVendedoresService } from './../../../../services/vendedores.service';
import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  TemplateRef, 
  EventEmitter,
   Output
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
  FormArray,
} from '@angular/forms';
import { Location } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { Subscription, EMPTY } from 'rxjs';

// ng-brazil
import { NgBrazilValidators } from 'ng-brazil';
import { utilsBr } from 'js-brasil';

// ngx-bootstrap
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { ComercialClientesCadastroEnderecosFormularioService } from './formulario.service';
import { ComercialClientesCadastroService } from '../../cadastro.service';
import { ComercialClientesService } from 'src/app/modules/comercial/services/clientes.service';
import { EstadosService } from 'src/app/shared/services/requests/estados.service';
import { CepService } from 'src/app/shared/services/ws/cep.service';

// Interfaces
import { IFormCanDeactivate } from 'src/app/guards/iform-candeactivate';
import { JsonResponse } from 'src/app/models/json-response';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';

@Component({
  selector: 'comercial-clientes-cadastro-enderecos-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss'],
})
export class ComercialClientesCadastroEnderecosFormularioComponent
  implements OnInit, AfterViewInit, OnDestroy, IFormCanDeactivate {
  public MASKS = utilsBr.MASKS;

  private subscriptionCancel: Subscription;
  private subscriptionSubmit: Subscription;

  loaderNavbar = false;
  loaderFullScreen = true;

  codCliente: number;

  form: FormGroup;
  formEnderecos: FormGroup;
  formChanged = false;

  action: string;
  podeEditarEnderecoPrincipal = true;
  podeEditarEnderecoCobranca = true;
  exibirDadosEntrega = false;
  exibirSelecaoCliente = false;

  tableConfigAnexos: Partial<CustomTableConfig> = {
    fixedHeader: false,
    bodyHeight: 230,
    hover: false,
  };

  estados: any = [];
  regioesAtuacaoComercial: any = [];
  regioesEntrega: any = [];
  tiposMaterial: any = [];
  tiposDescarga: any = [];
  modosDescarga: any = [];
  tiposVeiculos: any = [];
  dadosEspeciais: any = [];

  enderecosOp: any = [];
  enderecosLoading: boolean = false;
  enderecoLoaded: boolean = false;

  cidadeRetorno: string = '';
  estadoRetorno: string = '';

  maxLengthRules: any = {};
  maxLengthMessages: any = {};

  modalRef: BsModalRef;

  showAnexos: boolean = false;
  formData: Array<FormData> = [];

  @Output() cliente = new EventEmitter();
  @Output() fecharModal = new EventEmitter();
  @Output() clientesParams = new EventEmitter();
  formClientes: FormGroup;
  loadingClientes:boolean
  noClientes = true;
  clientes = [];

    /* Pagination */
    itemsPerPage = 10;
    begin = 0;
    end = 20;
    /* Pagination */

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private formService: ComercialClientesCadastroEnderecosFormularioService,
    private cadastroService: ComercialClientesCadastroService,
    private location: Location,
    private modalService: BsModalService,
    private clientesService: ComercialClientesService,
    private estadosService: EstadosService,
    private cepService: CepService,
    private pnotifyService: PNotifyService,
    private confirmModalService: ConfirmModalService,
    private comercialService: ComercialVendedoresService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit() {
    this.cancelSubscription();
    this.submitSubscription();

    if (this.activatedRoute.snapshot.data.data.responseCode === 200) {
      this.activatedRoute.parent.parent.params.subscribe((params: any) => {
        this.codCliente = params.id;
        this.checkUrlParams();
        this.getFormFields();
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
    this.cadastroService.onNotifyLoaded(false);
  }

  checkUrlParams() {
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.idEndereco) {
        this.action = 'editar';
      } else {
        this.action = 'novo';
      }
    });

    this.setMaxLengthRules();
    this.setFormBuilder(
      this.codCliente,
      this.activatedRoute.snapshot.data.data.result
    );
  }

  getFormFields() {
    this.estados = this.estadosService.getEstados();

    this.activatedRoute.parent.parent.params.subscribe((params: any) => {
      this.formService
        .loadDepencies(params.id)
        .pipe(
          finalize(() => {
            this.loaderFullScreen = false;
            this.cadastroService.onNotifyLoaded(false);
          })
        )
        .subscribe({
          next: (response: Array<any | JsonResponse>) => {
            if (response[0].responseCode === 200) {
              this.regioesAtuacaoComercial = response[0].result;
            } else {
              this.handleFormFieldsError();
            }

            if (response[1].responseCode === 200) {
              this.regioesEntrega = response[1].result;
            } else {
              this.handleFormFieldsError();
            }

            if (response[2].responseCode === 200) {
              this.tiposMaterial = response[2].result;
            } else {
              this.handleFormFieldsError();
            }

            if (response[3].responseCode === 200) {
              this.tiposDescarga = response[3].result;
            } else {
              this.handleFormFieldsError();
            }

            if (response[4].responseCode === 200) {
              this.modosDescarga = response[4].result;
            } else {
              this.handleFormFieldsError();
            }

            if (response[5].success === true) {
              this.setValidatorsPrincipalCobranca(response[5].data.enderecos);
            } else {
              this.setValidatorsPrincipalCobranca([]);
            }

            if (response[6].responseCode === 200) {
              this.tiposVeiculos = response[6].result;
            } else {
              this.handleFormFieldsError();
            }

            if (response[7].responseCode === 200) {
              this.dadosEspeciais = response[7].result;
            } else {
              this.handleFormFieldsError();
            }
          },
          error: (error: any) => {
            this.handleFormFieldsError();
          }
        });
    });
  }

  handleFormFieldsError() {
    this.pnotifyService.error();
    this.location.back();
  }

  setValidatorsPrincipalCobranca(enderecos: any) {
    if(enderecos){
      if (enderecos.length > 0) {
        for (let i = 0; i < enderecos.length; i++) {
          if (enderecos[i].principal === true || enderecos[i].principal == 1) {
            this.podeEditarEnderecoPrincipal = false;
          }

          if (enderecos[i].cobranca === true || enderecos[i].cobranca == 1) {
            this.podeEditarEnderecoCobranca = false;
          }
        }
      }
    }

    this.checkValidatorsPrincipalCobranca();
  }

  checkValidatorsPrincipalCobranca() {
    if (!this.podeEditarEnderecoPrincipal) {
      this.form.controls.principal.disable();
    }

    if (!this.podeEditarEnderecoCobranca) {
      this.form.controls.cobranca.disable();
    }
  }

  setMaxLengthRules() {
    this.maxLengthRules = this.activatedRoute.snapshot.data.rules.data;
    this.maxLengthMessages = {
      bairro: `Bairro deve conter até ${this.maxLengthRules.bairro} caracteres.`,
      cidade: `Cidade deve conter até ${this.maxLengthRules.cidade} caracteres.`,
      complemento: `Complemento deve conter até ${this.maxLengthRules.complemento} caracteres.`,
      endereco: `Endereço deve conter até ${this.maxLengthRules.endereco} caracteres.`,
      referencia: `Referência deve conter até ${this.maxLengthRules.referencia} caracteres.`,
      titulo: `Título do local de entrega deve conter até ${this.maxLengthRules.titulo} caracteres.`,
    };
  }

  setFormBuilder(codCliente: number, data: any) {
    if (data.entrega === true || data.entrega == 1) {
      this.exibirDadosEntrega = true;
    }

    this.form = this.formBuilder.group({
      codCliente: [codCliente],
      situacao: [data.situacao],
      id: [data.id],
      codEndereco: [data.codEndereco != 'null' ? data.codEndereco : null],
      cep: [
        {
          value: data.cep,
          disabled: this.action == 'novo' || data.situacao == 4 ? false : true,
        },
        [Validators.required, NgBrazilValidators.cep],
      ],
      endereco: [
        {
          value: data.endereco,
          disabled: this.action == 'novo' || data.situacao == 4 ? false : true,
        },
        [
          Validators.required,
          Validators.maxLength(this.maxLengthRules.endereco),
        ],
      ],
      status: [
        {
          value:
            this.action == 'editar' &&
            (data.situacao == 1 || data.situacao == 2)
              ? data.situacao
              : this.action == 'novo'
              ? 3
              : 1,
          disabled: true,
        },
        [Validators.required],
      ],
      complemento: [
        {
          value: data.complemento,
          disabled: this.action == 'novo' || data.situacao == 4 ? false : true,
        },
        [Validators.maxLength(this.maxLengthRules.complemento)],
      ],
      referencia: [
        {
          value: data.referencia,
          disabled: this.action == 'novo' || data.situacao == 4 ? false : true,
        },
        [Validators.maxLength(this.maxLengthRules.referencia)],
      ],
      bairro: [
        {
          value: data.bairro,
          disabled: data.situacao == 4 ? false : true,
        },
        [Validators.required, Validators.maxLength(this.maxLengthRules.bairro)],
      ],
      cidade: [
        {
          value: data.cidade,
          disabled: data.situacao == 4 ? false : true,
        },
        [Validators.required, Validators.maxLength(this.maxLengthRules.cidade)],
      ],
      uf: [
        {
          value: data.uf,
          disabled: data.situacao == 4 ? false : true,
        },
        [Validators.required],
      ],
      regiaoAtuacaoComercial: [
        {
          value: data.idAtuacaoComercial,
          disabled: this.action == 'novo' || data.situacao == 4 ? false : true,
        },
      ],
      principal: [data.principal],
      cobranca: [data.cobranca],
      entrega: [data.entrega],
      titulo: [data.titulo, [Validators.maxLength(this.maxLengthRules.titulo)]],
      regiaoEntrega: [{ value: data.idRegiaoEntrega, disabled: true }],
      diasEntrega: this.formBuilder.group({
        segunda: this.formBuilder.group({
          id: [data.diasEntrega.segunda.id],
          checked: [data.diasEntrega.segunda.checked == 0 ? false : true],
          minimo: [this.fixTime(data.diasEntrega.segunda.minimo)],
          maximo: [this.fixTime(data.diasEntrega.segunda.maximo)],
        }),
        terca: this.formBuilder.group({
          id: [data.diasEntrega.terca.id],
          checked: [data.diasEntrega.terca.checked == 0 ? false : true],
          minimo: [this.fixTime(data.diasEntrega.terca.minimo)],
          maximo: [this.fixTime(data.diasEntrega.terca.maximo)],
        }),
        quarta: this.formBuilder.group({
          id: [data.diasEntrega.quarta.id],
          checked: [data.diasEntrega.quarta.checked == 0 ? false : true],
          minimo: [this.fixTime(data.diasEntrega.quarta.minimo)],
          maximo: [this.fixTime(data.diasEntrega.quarta.maximo)],
        }),
        quinta: this.formBuilder.group({
          id: [data.diasEntrega.quinta.id],
          checked: [data.diasEntrega.quinta.checked == 0 ? false : true],
          minimo: [this.fixTime(data.diasEntrega.quinta.minimo)],
          maximo: [this.fixTime(data.diasEntrega.quinta.maximo)],
        }),
        sexta: this.formBuilder.group({
          id: [data.diasEntrega.sexta.id],
          checked: [data.diasEntrega.sexta.checked == 0 ? false : true],
          minimo: [this.fixTime(data.diasEntrega.sexta.minimo)],
          maximo: [this.fixTime(data.diasEntrega.sexta.maximo)],
        }),
        sabado: this.formBuilder.group({
          id: [data.diasEntrega.sabado.id],
          checked: [data.diasEntrega.sabado.checked == 0 ? false : true],
          minimo: [this.fixTime(data.diasEntrega.sabado.minimo)],
          maximo: [this.fixTime(data.diasEntrega.sabado.maximo)],
        }),
        domingo: this.formBuilder.group({
          id: [data.diasEntrega.domingo.id],
          checked: [data.diasEntrega.domingo.checked == 0 ? false : true],
          minimo: [this.fixTime(data.diasEntrega.domingo.minimo)],
          maximo: [this.fixTime(data.diasEntrega.domingo.maximo)],
        }),
      }),
      tipoMaterial: [data.idTipoMaterial],
      tipoDescarga: [data.idTipoDescarga, [Validators.required]],
      modoDescarga: [data.idModoDescarga, [Validators.required]],
      tiposVeiculos: [data.tiposVeiculos, [Validators.required]],
      dadosEspeciais: [data.dadosEspeciais],
      observacao: [data.observacaoLib],
      anexos: this.formBuilder.array([]),
      TP_ACAO: [data.TP_ACAO],
      COD_CLIE_TERC: [data.COD_CLIE_TERC],
      COD_CLIE_TERC_RAZ: [data.COD_CLIE_TERC_RAZ],
    });
    if(data.COD_CLIE_TERC > 0){
      this.getCliente(data.COD_CLIE_TERC);
    }
    this.formClientes = this.formBuilder.group({
      buscarPor: ['NM_CLIE'],
      pesquisa: [null, Validators.required],
      NM_CLIE:[null],
      registros: [this.itemsPerPage],
    });

    this.setValidatorsEntrega(data.entrega);
    this.setFormBuilderDiasEntrega(data.diasEntrega);
    this.checarAcesso(data.alteraStatus, data.situacao);
    this.getAnexos(data.entrega, this.form.value.codEndereco);
  }

  checarAcesso(acesso: any, situacao: any) {
    if (acesso === true || acesso == 1) {
      if (situacao == 1 || situacao == 2) {
        this.form.controls.status.setValidators([Validators.required]);
        this.form.controls.status.enable();
      } else {
        this.form.controls.status.clearValidators();
        this.form.controls.status.disable();
      }
    } else {
      this.form.controls.status.clearValidators();
      this.form.controls.status.disable();
    }

    this.form.controls.status.updateValueAndValidity();
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

  setValidatorsEntrega(entrega: any) {
    if (entrega === true || entrega == 1) {
      this.form.controls.tipoDescarga.setValidators([Validators.required]);
      this.form.controls.modoDescarga.setValidators([Validators.required]);
      this.form.controls.tiposVeiculos.setValidators([Validators.required]);
    } else {
      this.form.controls.tipoDescarga.clearValidators();
      this.form.controls.modoDescarga.clearValidators();
      this.form.controls.tiposVeiculos.clearValidators();
    }

    this.form.controls.tipoDescarga.updateValueAndValidity();
    this.form.controls.modoDescarga.updateValueAndValidity();
    this.form.controls.tiposVeiculos.updateValueAndValidity();
  }

  setFormBuilderDiasEntrega(diasEntrega: any) {
    for (let key in diasEntrega) {
      this.onDiaEntregas(key);
    }
  }

  getAnexos(entrega: any, codEndereco: number) {
    if ((entrega === true || entrega == 1) && codEndereco != null) {
      this.loaderNavbar = true;
      this.showAnexos = false;
      this.formService
        .getAnexos(codEndereco)
        .pipe(
          finalize(() => {
            this.loaderNavbar = false;
          })
        )
        .subscribe({
          next: (response: JsonResponse) => {
            if (
              response.hasOwnProperty('success') &&
              response.success === true
            ) {
              this.setAnexos(response.data);
              this.showAnexos = true;
            }
          },
          error: (error: any) => {
            if (error['error'].hasOwnProperty('mensagem')) {
              this.pnotifyService.error(error.error.mensagem);
            } else {
              this.pnotifyService.error();
            }
          }
        });
    }
  }

  setAnexos(anexos: any): void {
    if (anexos.length > 0) {
      for (let i = 0; i < anexos.length; i++) {
        this.onAddAnexos(anexos[i], true);
      }
    }
  }

  get anexos(): FormArray {
    return this.form.get('anexos') as FormArray;
  }

  onAddAnexos(anexo: any, manipulateForm?: boolean): void {
    if (this.checkAnexoExists(anexo) === false) {
      this.anexos.push(
        this.formBuilder.group({
          codAnexo: [anexo.codAnexo],
          nomeAnexo: [anexo.nomeAnexo],
          linkAnexo: [anexo.linkAnexo],
        })
      );

      if (manipulateForm) {
        this.form.markAsTouched();
        this.form.markAsDirty();
      }
    }
  }

  appendFile(files: FileList) {
    if (files.length === 0) return;
    const fd = new FormData();
    fd.append('file', files[0]);
    this.formData.push(fd);

    this.anexos.push(
      this.formBuilder.group({
        nomeAnexo: [files[0]['name']],
      })
    );
    if (this.showAnexos === false) {
      this.showAnexos = true;
    }

    this.form.markAsTouched();
    this.form.markAsDirty();
  }

  checkAnexoExists(anexo: any): boolean {
    return this.form.value.anexos.some((el: any) => {
      return el.codAnexo === anexo.codAnexo;
    });
  }

  onDeleteAnexo(codAnexo: number, index: number): void {
    this.confirmDelete().subscribe((r: boolean) => {
      if (codAnexo) {
        this.loaderNavbar = true;
        this.formService
          .deleteAnexo(codAnexo)
          .pipe(
            finalize(() => {
              this.loaderNavbar = false;
            })
          )
          .subscribe({
            next: (response: JsonResponse) => {
              if (
                response.hasOwnProperty('success') &&
                response.success === true
              ) {
                r ? this.deleteDocumento(index) : null;
              } else if (
                response.hasOwnProperty('success') &&
                response.success === false &&
                response.hasOwnProperty('mensagem')
              ) {
                this.pnotifyService.error(response.mensagem);
              } else {
                this.pnotifyService.error();
              }
            },
            error: (error: any) => {
              if (error['error'].hasOwnProperty('mensagem')) {
                this.pnotifyService.error(error.error.mensagem);
              } else {
                this.pnotifyService.error();
              }
            }
          });
      } else {
        r ? this.deleteDocumento(index) : null;
        this.formData.splice(index, 1);
      }
    });
  }

  confirmDelete(): any {
    return this.confirmModalService.showConfirm(
      'delete',
      'Confirmar exclusão',
      'Deseja realmente prosseguir com a exclusão do registro?',
      'Cancelar',
      'Confirmar'
    );
  }

  deleteDocumento(index: number) {
    this.anexos.removeAt(index);
    this.form.markAsTouched();
    this.form.markAsDirty();
  }

  onEnderecoEntrega() {
    this.exibirDadosEntrega = this.form.value.entrega;
    this.setValidatorsEntrega(this.form.value.entrega);
  }

  onInput() {
    this.formChanged = true;
  }

  onInputCep(detalhes: TemplateRef<any>) {
    if (this.form.get('cep').status == 'VALID') {
      this.consultaCEP(detalhes, this.form.value.cep);
    }
  }

  consultaCEP(detalhes: TemplateRef<any>, cep: string) {
    if (this.enderecosLoading == false) {
      this.cidadeRetorno = '';
      this.estadoRetorno = '';

      this.cepService
        .getData(cep)
        .pipe(
          finalize(() => {
            this.enderecosLoading = false;
          })
        )
        .subscribe((response: any) => {
          this.enderecosLoading = true;
          if (
            response.hasOwnProperty('mensagem') &&
            response.hasOwnProperty('success') &&
            response.success === true
          ) {
            if (response.data.length > 1) {
              this.formEnderecos = this.formBuilder.group({
                enderecosRetorno: ['', [Validators.required]],
              });

              this.enderecosOp = response.data;
              if ((this.enderecosLoading = true)) {
                this.openModal(detalhes);
              }
            } else {
              this.enderecoLoaded = true;
              this.setFormValues(response.data);

              this.cidadeRetorno = response.data.localidade;
              this.estadoRetorno = response.data.uf;
            }
          } else if (
            response.hasOwnProperty('mensagem') &&
            response.hasOwnProperty('success') &&
            response.success === false
          ) {
            this.pnotifyService.notice(response.mensagem);
          } else {
            this.pnotifyService.error();
          }
        });
    }
  }

  onInputCidade() {
    if (this.form.get('cidade').status == 'VALID') {
      let cidade = {
        cidade: this.form.get('cidade').value,
      };

      this.formService.getIbgeCidades(cidade).subscribe((response: any) => {
        if (response.responseCode === 200) {
          this.setRegiaoEntrega(response.result, this.form.get('cidade').value, this.form.get('bairro').value);
        } else {
          this.pnotifyService.notice(
            'Região de entrega não localizado, favor entrar em contato com o suporte'
          );
        }
      });
    }
  }

  setFormValues(enderecoSelecionado: any) {
    if (this.enderecoLoaded === true) {
      /* if (
        enderecoSelecionado.logradouro == '' &&
        enderecoSelecionado.bairro == ''
      ) {
        this.form.controls.bairro.enable();
        this.form.controls.bairro.updateValueAndValidity();
      } else {
        this.form.controls.bairro.disable();
        this.form.controls.bairro.updateValueAndValidity();
      } */
      this.form.controls.bairro.enable();
      this.form.controls.bairro.updateValueAndValidity();
      this.form.controls.endereco.setValue(enderecoSelecionado.logradouro);
      this.form.controls.bairro.setValue(enderecoSelecionado.bairro);
      this.form.controls.cidade.setValue(enderecoSelecionado.localidade);
      this.form.controls.uf.setValue(enderecoSelecionado.uf);

      this.setRegiaoEntrega(enderecoSelecionado.ibge, enderecoSelecionado.localidade, enderecoSelecionado.bairro);
      /* this.setLatLong(enderecoSelecionado); */
    }
  }

  setRegiaoEntrega(ibge: number, cidade: string, bairro: string) {
    const getRegiao = cidade == "São Paulo" ? this.formService.getRegiaoEntregaPorBairro(bairro) : this.formService.getRegiaoEntrega(ibge);

    getRegiao.subscribe((response: any) => {
      if (response.responseCode === 200) {
        this.form.controls.regiaoEntrega.setValue(
          response.result.idRegiaoEntrega
        );
        this.form.controls.regiaoEntrega.updateValueAndValidity();
      } else {
        this.form.controls.regiaoEntrega.enable();
        this.form.controls.regiaoEntrega.updateValueAndValidity();
      }
    });
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

  checkValidatorsTipoEndereco() {
    let validation = true;

    if (
      this.form.getRawValue().principal === false &&
      this.form.getRawValue().cobranca === false &&
      this.form.getRawValue().entrega === false
    ) {
      validation = false;
    } else if (
      this.form.getRawValue().principal === true &&
      this.form.getRawValue().cobranca === true &&
      this.form.getRawValue().entrega === false &&
      this.action != 'novo'
    ) {
      validation = false;
    } else if (
      this.form.getRawValue().principal === true &&
      this.form.getRawValue().cobranca === false &&
      this.form.getRawValue().entrega === true &&
      this.action != 'novo'
    ) {
      validation = false;
    } else if (
      this.form.getRawValue().principal === false &&
      this.form.getRawValue().cobranca === true &&
      this.form.getRawValue().entrega === true &&
      this.action != 'novo'
    ) {
      validation = false;
    }

    return validation;
  }

  checkValidatorsDiasEntregas() {
    let validation = false;

    if (this.form.value.entrega === true || this.form.value.entrega == 1) {
      for (let key in this.form.value.diasEntrega) {
        if (this.form.value.diasEntrega[key].checked === true) {
          validation = true;
        }
      }
    } else {
      validation = true;
    }

    return validation;
  }

  checkValidatorsTiposVeiculo() {
    let validation = false;

    if (this.form.value.entrega === true || this.form.value.entrega == 1) {
      if (this.form.value.tiposVeiculos.length > 0) {
        validation = true;
      }
    } else {
      validation = true;
    }

    return validation;
  }

  checkValidatorsEndereco() {
    let validation = false;

    let verificaNumero = this.form.getRawValue().endereco.split(',');

    if (verificaNumero.length > 1) {
      validation = true;
    }

    return validation;
  }

  checkValidatorsCliente() {
    let validation = false;
    let cliente = this.form.controls.COD_CLIE_TERC.value;
    if (cliente > 0 || !this.exibirSelecaoCliente) {
      validation = true;
    }
    return validation;
  }


  fixTime(horario: string) {
    let d = new Date();

    if (horario != null) {
      let horarioSplit = horario.split(':');
      let h = parseInt(horarioSplit[0]);
      let m = parseInt(horarioSplit[1]);

      d.setHours(h);
      d.setMinutes(m);
    }

    return d;
  }

  onDiaEntregas(field: string) {
    const diasEntrega = this.form.controls.diasEntrega as FormGroup;
    const diaControls = diasEntrega.controls[field] as FormGroup;

    if (diaControls.value.checked) {
      diaControls.controls.minimo.enable();
      diaControls.controls.minimo.setValidators([Validators.required]);
      diaControls.controls.minimo.updateValueAndValidity();
      diaControls.controls.maximo.enable();
      diaControls.controls.maximo.setValidators([Validators.required]);
      diaControls.controls.maximo.updateValueAndValidity();
    } else {
      diaControls.controls.minimo.disable();
      diaControls.controls.minimo.clearValidators();
      diaControls.controls.minimo.updateValueAndValidity();
      diaControls.controls.maximo.disable();
      diaControls.controls.maximo.clearValidators();
      diaControls.controls.maximo.updateValueAndValidity();
    }
  }

  onReplicarHorario(field: string) {
    if (this.form.value.diasEntrega[field].checked) {
      const diasEntrega = this.form.controls.diasEntrega as FormGroup;
      const diaControls = diasEntrega.controls[field] as FormGroup;

      if (diaControls.status == 'VALID') {
        this.confirmModalService
          .showConfirm(
            null,
            null,
            'Deseja realmente replicar este horário para os demais dias selecionados?',
            'Cancelar',
            'Confirmar'
          )
          .subscribe((response: boolean) =>
            response ? this.replicaHorario(field) : EMPTY
          );
      } else {
        this.pnotifyService.notice('Informe o horário mínimo/máximo.');
      }
    } else {
      this.pnotifyService.notice('Habilite o dia de entrega para replicar.');
    }
  }

  replicaHorario(field: string) {
    const diasEntrega = this.form.controls.diasEntrega as FormGroup;
    const minimo = this.form.value.diasEntrega[field].minimo;
    const maximo = this.form.value.diasEntrega[field].maximo;

    for (let key in this.form.value.diasEntrega) {
      if (key != field) {
        if (this.form.value.diasEntrega[key].checked) {
          const diaControls = diasEntrega.controls[key] as FormGroup;

          diaControls.controls.minimo.setValue(minimo);
          diaControls.controls.maximo.setValue(maximo);
        }
      }
    }
  }

  onCancel() {
    this.location.back();
  }

  onSubmit() {
    if (!this.checkValidatorsTipoEndereco()) {
      this.pnotifyService.notice('Selecione um tipo de endereço.');
      return false;
    }

    if (!this.checkValidatorsDiasEntregas()) {
      this.pnotifyService.notice('Selecione um dia para entrega.');
      return false;
    }

    if (!this.checkValidatorsTiposVeiculo()) {
      this.pnotifyService.notice('Selecione um tipo de veículo.');
      return false;
    }

    if (!this.checkValidatorsEndereco()) {
      this.pnotifyService.notice(
        'Preencha o número do endereço. ex: "logradouro, número"'
      );
      return false;
    }
    if (!this.checkValidatorsCliente()) {
      this.pnotifyService.notice(
        'Selecione um cliente."'
      );
      return false;
    }

    if (
      this.cidadeRetorno != '' &&
      this.form.getRawValue().cidade != this.cidadeRetorno
    ) {
      this.pnotifyService.notice(
        'Cidade diferente de resultado de busca automática.'
      );
    }

    if (
      this.estadoRetorno != '' &&
      this.form.getRawValue().uf != this.estadoRetorno
    ) {
      this.pnotifyService.notice(
        'Estado diferente de resultado de busca automática.'
      );
    }

    if (
      this.form.getRawValue().principal == true &&
      (this.form.getRawValue().regiaoAtuacaoComercial == null ||
        this.form.getRawValue().regiaoAtuacaoComercial == '') &&
      this.action == 'novo'
    ) {
      this.pnotifyService.notice('Selecione um Região de Atuação Comercial.');
      return false;
    }

    if (this.form.pristine) {
      this.pnotifyService.notice('Nenhuma alteração detectada.');
      this.location.back();
    } else {
      if (this.form.valid) {
        this.cadastroService.onNotifyLoaded(true);

        this.clientesService.updateEndereco(this.form.getRawValue()).subscribe({
          next: (response: any) => {
            if (response.responseCode === 200) {
              if (this.formData.length > 0 && response.codEndereco) {
                this.onPostAnexos(
                  response.codEndereco,
                  this.form.value.codCliente
                );
              }
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
      }
    }
  }

  onPostAnexos(codEndereco: number, codCliente: number): void {
    if (this.formData.length === 0) {
      this.pnotifyService.notice('Nenhum arquivo !');
      return;
    }

    this.formData.forEach((element, index) => {
      this.formService.postAnexos(element, codEndereco, codCliente).subscribe();
    });
  }

  handleSubmitError() {
    this.pnotifyService.error('Ocorreu um erro ao salvar o cadastro.');
    this.cadastroService.onNotifyLoaded(false);
  }

  onSended() {
    this.cadastroService.onNotifySended(true);
  }

  openModal(detalhes: TemplateRef<any>) {
    this.modalRef = this.modalService.show(
      detalhes,
      Object.assign(
        {
          ignoreBackdropClick: true,
        },
        { class: 'modal-lg' }
      )
    );
  }

  onModalClose() {
    this.modalRef.hide();
  }

  setValueEndereco() {
    let retornoTratado: any;
    retornoTratado = this.formEnderecos.value['enderecosRetorno'];
    this.onModalClose();
    this.enderecoLoaded = true;
    this.setFormValues(retornoTratado);
  }

  selecaoCliente(event: any){
    if(event == "obra" || event == "filial" || event == "industrialização"){
      this.exibirSelecaoCliente = true;
    }else{
      this.exibirSelecaoCliente = false;
      this.form.controls.COD_CLIE_TERC.setValue(null);
      this.form.controls.COD_CLIE_TERC_RAZ.setValue(null);
      this.form.controls.TP_ACAO.setValue(null);
    }
  }

  getClientes(params?){
    
    const _params = params ?? {};
    const _obj = this.formClientes.value;
    this.loadingClientes = true;
    if (_obj['pesquisa']) _params[_obj['buscarPor']] = _obj['pesquisa'];
    this.comercialService
      .getCarteiraClientes(_params)
      .pipe(
        finalize(() => {
          this.loadingClientes = false;
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.success === true) {
              this.noClientes = false;
              this.clientes = response.data
          } else {
            this.noClientes = true;
            this.pnotifyService.notice('Nenhum cliente encontrado!');
          }
        },
        error: (error: any) => {
          this.pnotifyService.error();
        }
      });
  }

  setCliente(cliente) {
    if(cliente.nomeSituacao == 'Arquivo'){
      this.pnotifyService.notice('Cliente arquivado, favor entrar em contato com o Marketing');
    } else {
      this.form.controls.COD_CLIE_TERC.setValue(cliente.codCliente);
      this.form.controls.COD_CLIE_TERC_RAZ.setValue(cliente.razaoSocial);
      this.onModalClose();
    }
  }

  getCliente(codCliente){
    this.loaderFullScreen = true;
    this.formService.getCliente(codCliente)
    .pipe(
      finalize(() => {
      this.loaderFullScreen = false;
    }))
    .subscribe({
      next: (response: JsonResponse) => {
        const data = [];
        data[0] = response;
        if (data[0].responseCode === 200) {
          this.form.controls.COD_CLIE_TERC_RAZ.setValue(data[0].result.razaoSocial);
          this.exibirSelecaoCliente = true;
        } 
      }
    });
  }
}
