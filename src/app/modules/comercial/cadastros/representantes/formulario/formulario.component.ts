import { ComercialComissoesGestaoComissionamentosService } from './../../../comissoes/representantes/gestao-comissionamentos/gestao-comissionamentos.service';
import { ConfirmModalService } from './../../../../../shared/modules/confirm-modal/confirm-modal.service';
import { JsonResponse } from './../../../../../models/json-response';
import { CustomTableConfig } from './../../../../../shared/templates/custom-table/models/config';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  FormArray,
  Validators,
} from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Location } from '@angular/common';


// ng-brazil
// import { MASKS } from 'ng-brazil';
import { NgBrazilValidators } from 'ng-brazil';
import { utilsBr } from 'js-brasil';

// Interfaces


// Services
import { DateService } from './../../../../../shared/services/core/date.service';
import { PNotifyService } from './../../../../../shared/services/core/pnotify.service';
import { ComercialGestaoAssociacoesCoordenadoresEscritoriosService } from './../../../gestao/associacoes/coordenadores-escritorios/coordenadores-escritorios.service';
import { ComercialCadastrosRepresentantesService } from './../representantes.service';
import { ComercialCadastrosEquipeVendaService } from './../../equipe-venda/equipe-venda.service';
import { ComercialService } from './../../../comercial.service';
import { EstadosService } from 'src/app/shared/services/requests/estados.service';
import { CepService } from 'src/app/shared/services/ws/cep.service';
import { ComercialCadastrosTipoComissionamentoService } from './../../tipos-comissionamento/tipo-comissionamento.service';
import { ComercialClientesCadastroEnderecosFormularioService } from './../../../clientes/cadastro/enderecos/formulario/formulario.service';

// Interfaces
import { Breadcrumb } from './../../../../../shared/modules/breadcrumb/breadcrumb';

// ngx-bootstrap
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ptBrLocale } from 'ngx-bootstrap/locale';

defineLocale('pt-br', ptBrLocale);



@Component({
  selector: 'comercial-gestao-representantes-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss'],
})
export class ComercialCadastrosRepresentantesFormularioComponent
  implements OnInit {
    public MASKS = utilsBr.MASKS;

  loaderFullScreen = true;
  loaderNavbar: boolean;

  appTitle: string;
  action: string;

  modalValues: any[] = [];
  loadingModal: boolean = false;

  breadCrumbTree: Array<Breadcrumb> = [];

  form: FormGroup;
  formModelo: FormGroup;

  formChanged = false;
  submittingForm = false;

  dados: Array<any> = [];
  escritorio: Array<any> = [];
  equipes: Array<any> = [];
  bancos: Array<any> = [];
  tipoVendedor: Array<any> = [];
  urlAnexo: Array<any> = [];

  dadosLoaded = false;
  dadosEmpty = false;

  formEnderecos: FormGroup;
  estados: any = [];

  enderecosOp: any = [];
  enderecosLoading: boolean = false;
  enderecoLoaded: boolean = false;

  cidadeRetorno: string = '';
  estadoRetorno: string = '';

  maxLengthRules: any = {};
  maxLengthMessages: any = {};

  toggle = false;
  searching = false;
  firstSearch = false;

  bsConfig: Partial<BsDatepickerConfig>;

  showGrupos = true;

  modalRef: BsModalRef;


  linhas: Array<any> = [];
  classes: Array<any> = [];

  limparGrupoPrincipal: boolean;

  tableConfigAssocGrupos: Partial<CustomTableConfig> = {
    fixedHeader: false,
    bodyHeight: 230,
    hover: false,
  };

  tableConfigPrecos: Partial<CustomTableConfig> = {
    fixedHeader: false,
    bodyHeight: 230,
    hover: false,
  };

  tableConfigAnexos: Partial<CustomTableConfig> = {
    fixedHeader: false,
    bodyHeight: 230,
    hover: false,
  };

  showAnexos: boolean = false;
  formData: Array<FormData> = [];

  maxSize = 10;
  itemsPerPage = 300;
  currentPage = 1;
  totalItems = 0;

  situacao: any = [
    {
      id: 0,
      descricao: 'INATIVO',
    },
    {
      id: 1,
      descricao: 'ATIVO',
    }
  ];

  tipoComissao: any = [];
  tipoComissaoModal: any = [];


  constructor(private formBuilder: FormBuilder,
              private activatedRoute: ActivatedRoute,
              private dateService: DateService,
              private localeService: BsLocaleService,
              private bsModalService: BsModalService,
              private pnotifyService: PNotifyService,
              private confirmModalService: ConfirmModalService,
              private location: Location,
              private representantesService: ComercialCadastrosRepresentantesService,
              private router: Router,
              private gestaoAssociacoesService: ComercialGestaoAssociacoesCoordenadoresEscritoriosService,
              private modalService: BsModalService,
              private comercialService: ComercialService,
              private cadastroEquipeVenda: ComercialCadastrosEquipeVendaService,
              private estadosService: EstadosService,
              private cepService: CepService,
              private formService: ComercialClientesCadastroEnderecosFormularioService,
              private tipoComissionamentoService: ComercialCadastrosTipoComissionamentoService,
              private gestaoComissionamentosService: ComercialComissoesGestaoComissionamentosService,
  ) {
    this.localeService.use('pt-br');
    this.pnotifyService.getPNotify();
  }

  ngOnInit(): void {
    this.setFormFilter();
    this.setBreadCrumb();
    this.getEscritorio();
    this.getEquipesVenda();
    this.getTipoComissao();
    this.getBancos();
    this.getTipoVendedor();
  }

  setBreadCrumb(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.id) {
        this.appTitle = 'Editar Representante';
        this.action = 'update';
      } else {
        this.appTitle = 'Novo Representante';
        this.action = 'create';
      }


      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/comercial/home',
        },
        {
          descricao: 'Cadastros',
          routerLink: `/comercial/cadastros/${params.idSubModulo}`,
        },
        {
          descricao: 'Representantes',
          routerLink: `/comercial/cadastros/${params.idSubModulo}/representantes/lista`,
        },
        {
          descricao: this.appTitle,
        },
      ];
    });
  }

  // Formulário Preenchido para edição ou novo formulário
  setFormFilter() {
        this.estados = this.estadosService.getEstados();


        const resolver = this.activatedRoute.snapshot.data.detalhes;

        if (resolver.success === true) {

          const detalhes: any = resolver.data[0];

          this.form = this.formBuilder.group({
          codRepresentante: [detalhes.codRepresentante],
          codSituacao: [detalhes.codSituacao ? detalhes.codSituacao : 1, [Validators.required]],
          tipoPagamentoComissao: [detalhes.tipoPagamentoComissao, [Validators.required]],
          emiteNotaFiscal: [detalhes.emiteNotaFiscal == 0 ? detalhes.emiteNotaFiscal : 1, [Validators.required]],
          recebeEmailInativacaoCliente: [detalhes.recebeEmailInativacaoCliente ? detalhes.recebeEmailInativacaoCliente : 1, [Validators.required]],
          codEquipe: [detalhes.codEquipe, [Validators.required]],
          codEscritorio: [detalhes.codEscritorio, [Validators.required]],
          nrMatricula: [detalhes.nrMatricula, [Validators.required]],

          nome: [detalhes.nome, [Validators.required]],
          razaoSocial: [detalhes.razaoSocial, [Validators.required]],
          cep: [{value: detalhes.cep, disabled: ''}, [Validators.required]],
          endereco: [detalhes.endereco, [Validators.required]],
          // nrEndereco: [detalhes.nrEndereco],
          nomeBairro: [detalhes.nomeBairro, [Validators.required]],
          // complemento: [detalhes.complemento],
          nomeCidade: [detalhes.nomeCidade, [Validators.required]],
          uf: [detalhes.uf],
          cpf: [detalhes.cpf, [Validators.required]],
          rg: [detalhes.rg],
          email: [detalhes.email],
          telefone: [detalhes.telefone],
          celular: [detalhes.celular],
          dataInicialContrato: detalhes.dataInicialContrato != null
          ? [this.dateService.convertStringToDate(detalhes.dataInicialContrato, 'usa'), [Validators.required]]
          : this.dateService.getToday(),

          dataFinalContrato: detalhes.dataFinalContrato != null
          ? [this.dateService.convertStringToDate(detalhes.dataFinalContrato, 'usa')] : this.dateService.getToday(),
          // dataFinalContrato: detalhes ? this.dateService.getToday() :
          // [this.dateService.convertStringToDate(detalhes.dataFinalContrato, 'usa')],
          // dataRenovacaoContrato: detalhes ? this.dateService.getToday() :
          // [this.dateService.convertStringToDate(detalhes.dataRenovacaoContrato, 'usa')],

          nomeFantasiaRepresentacao: [detalhes.nomeFantasiaRepresentacao],
          razaoSocialRepresentacao: [detalhes.razaoSocialRepresentacao],
          cnpjEmpresaRepresentacao: [detalhes.cnpjEmpresaRepresentacao],
          ieEmpresaRepresentacao: [detalhes.ieEmpresaRepresentacao],
          imEmpresaRepresentacao: [detalhes.imEmpresaRepresentacao],

          nomeTitularConta: [detalhes.nomeTitularConta],
          tipoConta: [detalhes.tipoConta],
          nomeBanco: [detalhes.nomeBanco],
          agencia: [detalhes.agencia],
          contaCorrente: [detalhes.contaCorrente],

          anexos: this.formBuilder.array([]),
        });
        this.setCheckValues(detalhes);

        if (detalhes.codRepresentante != null) {
          this.getAnexos(detalhes.codRepresentante);
        }

      } else {
        this.pnotifyService.error();
        this.location.back();
    }
  }

  onCancel(): void {
    this.location.back();
  }

  closeModal(modalRef: TemplateRef<any>) {
    this.modalRef.hide();

   this.getTipoComissao();
  }


  //Ação de Edição ou novo Formulário
  onSubmit(): void {
    if (this.action === 'update' && this.form.pristine) {
      this.onPostAnexos(this.form.value.codRepresentante);
      this.location.back();

    } else {
      if (this.checkFormValidation() && this.form.valid) {
          this.loaderNavbar = true;
          this.submittingForm = true;

          this.representantesService
            .save(this.form.getRawValue(), this.action)
            .pipe(
              finalize(() => {
                this.loaderNavbar = false;
                this.submittingForm = false;
              })
            )
            .subscribe({
              next: (response: any) => {
                if (
                  response.hasOwnProperty('success') &&
                  response.success === true
                ) {
                  this.form.reset();
                  this.formChanged = false;
                  this.pnotifyService.success();
                  this.onPostAnexos(response.data[0].codRepresentante);

                  this.activatedRoute.params.subscribe((params: any) => {
                    let navigateTo: string;

                    if (params.hasOwnProperty('id')) {
                      navigateTo = '../../lista';
                    } else {
                      navigateTo = '../lista';
                    }

                    this.router.navigate([navigateTo], {
                      relativeTo: this.activatedRoute,
                    });
                  });
                } else if (
                  response.hasOwnProperty('success') &&
                  response.success === false
                ) {
                  this.pnotifyService.error(response.mensagem);
                } else {
                  this.pnotifyService.error();
                }
              },
              error: (error: any) => {
                this.pnotifyService.error();
              }
            });
      } else {
        this.pnotifyService.notice('Selecione um material.');
      }
    }
  }

  checkFormValidation(): boolean {
    let isValid = true;

    if (this.form.getRawValue().id === null) {
      isValid = false;
    }

    return isValid;
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
            this.loaderFullScreen = false;
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
        cidade: this.form.get('nomeCidade').value,
      };

      this.formService.getIbgeCidades(cidade).subscribe((response: any) => {
        if (response.responseCode === 200) {
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

      this.form.controls.endereco.enable();
      this.form.controls.nomeBairro.enable();
      this.form.controls.nomeCidade.enable();
      this.form.controls.uf.enable();

      this.form.controls.endereco.setValue(enderecoSelecionado.logradouro);
      this.form.controls.nomeBairro.setValue(enderecoSelecionado.bairro);
      this.form.controls.nomeCidade.setValue(enderecoSelecionado.localidade);
      this.form.controls.uf.setValue(enderecoSelecionado.uf);

      if (enderecoSelecionado.logradouro != '') {
        this.form.controls.endereco.disable();
      }

      if (enderecoSelecionado.bairro != '') {
        this.form.controls.nomeBairro.disable();
      }

      if (enderecoSelecionado.localidade != '') {
        this.form.controls.nomeCidade.disable();
      }

      if (enderecoSelecionado.uf != '') {
        this.form.controls.uf.disable();
      }
    }
  }

  setCheckValues(data: any) {
      this.form.controls.endereco.enable();
      this.form.controls.nomeBairro.enable();
      this.form.controls.nomeCidade.enable();
      this.form.controls.uf.enable();

      if (data.endereco != '') {
        this.form.controls.endereco.disable();
      }

      if (data.nomeBairro != '') {
        this.form.controls.nomeBairro.disable();
      }

      if (data.nomeCidade != '') {
        this.form.controls.nomeCidade.disable();
      }

      if (data.uf != '') {
        this.form.controls.uf.disable();
      }
  }

  // Consulta tipo de comissionamento
  getTipoComissao() {

    this.representantesService
      .getTipoComissionamento()
      .subscribe({
        next: (response: any) => {
          if (response) {
            this.tipoComissao = response.data;

          } else {
            this.pnotifyService.error();
            this.location.back();
          }
        },
        error: (error: any) => {
          this.pnotifyService.error();
          this.location.back();
        }
      });
  }

  getTipoComissaoModal(){
    this.loaderFullScreen = true;
    this.tipoComissaoModal = [];
    const codTipoComissionamento = this.form.value.tipoPagamentoComissao;
    console.log(codTipoComissionamento)

    this.tipoComissionamentoService
    .getDetailTipoComissionamento(codTipoComissionamento)
    .pipe(
      finalize(() => {
        this.loaderFullScreen = false;
      })
    )
    .subscribe(
      (response: any) => {
        if (response.success === true) {
          this.tipoComissaoModal = response.data;
        }
        (error: any) => {
          if (error.error.hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
    })
  }

  getBancos() {
    this.representantesService
      .getBancos()
      .subscribe({
        next: (response: any) => {
          if (response) {
            this.bancos = response.data;
          } else {
            this.pnotifyService.error();
            this.location.back();
          }
        },
        error: (error: any) => {
          this.pnotifyService.error();
          this.location.back();
        }
      });
  }

  getTipoVendedor() {
    this.representantesService
      .getTipoVendedor()
      .subscribe({
        next: (response: any) => {
          if (response) {
            this.tipoVendedor = response.data;
          } else {
            this.pnotifyService.error();
            this.location.back();
          }
        },
        error: (error: any) => {
          this.pnotifyService.error();
          this.location.back();
        }
      });
  }


  getEquipesVenda() {
    this.cadastroEquipeVenda
      .getListaEquipesVenda()
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
          this.showAnexos = true;
          this.loaderFullScreen = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.success === true) {
            this.equipes = response.data;
          } else {
            this.pnotifyService.error('Cadastre uma Equipe de Vendas');
            this.location.back();
          }
        },
        error: (error: any) => {
          this.pnotifyService.error();
          this.location.back();
        }
      });
  }

  getEscritorio() {
    this.gestaoComissionamentosService
      .getEscritorios()
      .subscribe({
        next: (response: any) => {
          if (response.success === true) {
            this.escritorio = response.data;
          } else {
            this.pnotifyService.error();
            this.location.back();
          }
        },
        error: (error: any) => {
          this.pnotifyService.error();
          this.location.back();
        }
      });
  }

  // CheckBox
  onChecked() {
    this.formModelo.get('de').disable();
    this.formModelo.get('ate').disable();
  }


  // modal
  openModal(tiposComissao: TemplateRef<any>) {
    this.modalRef = this.bsModalService.show(tiposComissao);
    this.getTipoComissaoModal();
  }


// Tratamento de erros
  onFieldError(field: string) {
    if (this.onFieldInvalid(field)) {
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
    }

    return '';
  }

  onFieldRequired(field: string) {
    let required = false;
    let formControl = new FormControl();

    // && this.assocMateriais.controls['controls'][field].validator
    if (this.form.controls[field].validator ) {
      let validationResult = this.form.controls[field].validator(formControl);
      required =
        validationResult !== null && validationResult.required === true;
    }


    if (required) {
      return 'is-required';
    }
    }

  formCanDeactivate(): boolean {
    if (this.formChanged) {
      if (confirm('Este cliente no forma parte de tu cartera?')) {
        return true;
      } else {
        return false;
      }
    }
    return true;
  }

  geetParams(params: any): any {
    let dataInicial = params['dataInicialVigencia'];
    let dataFinal = params['dataFimVigencia'];

    this.form.patchValue({
      dataInicialVigencia: dataInicial,
      dataFimVigencia: dataFinal
    });

    if (dataInicial instanceof Date) {
      dataInicial = this.dateService.convertToUrlDate(dataInicial);
    }

    if (dataFinal instanceof Date) {
      dataFinal = this.dateService.convertToUrlDate(dataFinal);
    }

    return {
      dataInicial: {dataInicial},
      dataFinal: {dataFinal}
    };
  }

  navegarAnexo(anexo) {
    this.router
      .navigate([], {
        relativeTo: this.activatedRoute,
      })
      .then((result) => {
        window.open(`${anexo.value.urlAnexo}`, '_blank');
      });
  }

  getAnexos(codRepresentante: number) {
    this.loaderNavbar = true;
    this.showAnexos = false;
    this.representantesService
      .getAnexos(codRepresentante)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
          this.showAnexos = true;
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.hasOwnProperty('success') && response.success === true) {
            this.setAnexos(response.data);
            this.urlAnexo = response.data;
          }
        },
        error: (error: any) => {
          // if (error['error'].hasOwnProperty('mensagem')) {
          //   this.pnotifyService.error(error.error.mensagem);
          // } else {
          //   this.pnotifyService.error();
          // }
        }
      });
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
          urlAnexo: [anexo.urlAnexo],
        })
      );

      if (manipulateForm) {
        this.form.markAsTouched();
        this.form.markAsDirty();
      }
    }
  }

  checkAnexoExists(anexo: any): boolean {
    return this.form.value.anexos.some((el: any) => {
      return el.codAnexo === anexo.codAnexo || el.nomeAnexo == anexo.nomeAnexo;
    });
  }

  appendFile(files: FileList): any {
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
  }

  onPostAnexos(codRepresentante: number): void {
    if (this.formData.length === 0) {
      /* this.pnotifyService.notice('Erro'); */
      return;
    }

    /* const id = this.form.value.codMaterial; */

    this.formData.forEach((element, index) => {
      this.representantesService
        .postAnexos(element, codRepresentante)
        .subscribe();
    });
  }

  onDeleteAnexo(codAnexo: number, index: number): void {
    this.confirmDelete().subscribe((r: boolean) => {
      if (codAnexo) {
        this.loaderNavbar = true;
        this.representantesService
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

  deleteDocumento(index: number): void {
    this.anexos.removeAt(index);
    this.form.markAsTouched();
    this.form.markAsDirty();
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

}
