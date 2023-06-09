import { ComercialCadastrosFormasPagamentoService } from './../../../cadastros/formas-pagamento/formas-pagamento.service';
import { ComercialGestaoContratosComerciaisService } from './../contratos-comerciais.service';
import { IPermissoesAcessoModel } from './../../../ciclo-vendas/cotacoes/formulario/models/permissoes-acesso';
import { ComercialCicloVendasPedidosProducaoTelasFormularioService } from './../../../ciclo-vendas/pedidos-producao-telas/formulario/formulario.service';
import { JsonResponse } from './../../../../../models/json-response';
import { CustomTableConfig } from './../../../../../shared/templates/custom-table/models/config';
import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
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
import { Subscription } from 'rxjs';

// ng-brazil
import { MASKS } from 'ng-brazil';

// Interfaces teste

// Services
import { DateService } from './../../../../../shared/services/core/date.service';
import { PNotifyService } from './../../../../../shared/services/core/pnotify.service';
import { ComercialService } from './../../../comercial.service';
import { AuthService } from './../../../../../shared/services/core/auth.service';
import { ComercialCadastrosMateriaisGrupoService } from './../../../cadastros/materiais/grupos/grupos.service';
import { ConfirmModalService } from './../../../../../shared/modules/confirm-modal/confirm-modal.service';
import { ComercialGestaoContratosComerciaisFormularioModalDetalhesService } from './modal/detalhes/cliente.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { ComercialClientesService } from '../../../services/clientes.service';

// Interfaces
import { Breadcrumb } from './../../../../../shared/modules/breadcrumb/breadcrumb';

// ngx-bootstrap
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ptBrLocale } from 'ngx-bootstrap/locale';

defineLocale('pt-br', ptBrLocale);

@Component({
  selector: 'comercial-gestao-contratos-comerciais-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss'],
})
export class ComercialGestaoContratosComerciaisFormularioComponent
  implements OnInit, OnDestroy
{
  permissoesAcesso: IPermissoesAcessoModel = {
    acessoClientes: false,
    historicoExclusao: false,
    duplicataCarteira: false,
  };
  private user = this.authService.getCurrentUser();
  public MASKS = MASKS;

  loaderFullScreen = true;
  loaderNavbar: boolean;
  loaderEnderecos: boolean;
  loaderGrupoEconomico: boolean;

  appTitle: string;
  breadCrumbTree: Array<Breadcrumb> = [];

  tableConfigAssocMateriais: Partial<CustomTableConfig> = {
    hover: false,
  };

  tableConfigMateriais: Partial<CustomTableConfig> = {
    fixedHeader: false,
    bodyHeight: 243,
  };

  form: FormGroup;
  formModelo: FormGroup;
  formMateriais: FormGroup;

  desativado: boolean = false;
  loadingModal: boolean = false;
  changeTipoServico: boolean = false;
  changeTipoMaterial: boolean = false;
  materiaisLoader: boolean;
  limparGrupoPrincipal: boolean;

  showDashboard = false;
  showFilter = false;
  showPermissionDenied = false;

  dadosLoaded = false;
  dadosEmpty = false;

  toggle = false;
  searching = false;
  firstSearch = false;

  formChanged = false;
  submittingForm = false;

  showMateriais = true;
  materiaisListaLoaded = false;
  materiaisListaEmpty = false;
  showGrupos = true;
  toggleAll = false;

  modalValues: any[] = [];
  profile: any = {};
  dados: Array<any> = [];
  materiais: Array<any> = [];
  clientes: Array<any> = [];
  situacoes: Array<any> = [];
  coordenadores: Array<any> = [];
  vendedores: Array<any> = [];
  equipes: Array<any> = [];
  materiaisLista: Array<any> = [];
  urlAnexo: Array<any> = [];
  linhas: Array<any> = [];
  classes: Array<any> = [];
  filteredClasses: Array<any> = [];
  tipoFrete: Array<any> = [];
  formaPagamento: Array<any> = [];
  tipoServico: Array<any> = [];
  grupoEconomico: Array<any> = [];
  enderecos: Array<any> = [];
  empresas: Array<any> = [];

  valorFinal: number;
  valorFinalUpdate: number;
  codClasse: number = null;
  idEscritorio: number;
  idVendedor: number;
  nomeVendedor: string;
  nomeEscritorio: string;
  action: string;

  codClienteSubscription: Subscription;
  isCarteiraClientesLoaded: boolean;
  codClientErrors = false;

  activatedRouteSubscription: Subscription;

  bsConfig: Partial<BsDatepickerConfig>;

  modalRef: BsModalRef;

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

  visualizar: boolean = false;
  editar: boolean = false;
  showVisual: boolean = false;
  changeTipo: boolean = false;

  loaderDetalhesClienteSubscription: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private dateService: DateService,
    private localeService: BsLocaleService,
    private pnotifyService: PNotifyService,
    private confirmModalService: ConfirmModalService,
    private location: Location,
    private contratosComerciaisService: ComercialGestaoContratosComerciaisService,
    private router: Router,
    private comercialService: ComercialService,
    private materiaisGrupoService: ComercialCadastrosMateriaisGrupoService,
    private authService: AuthService,
    private formularioService: ComercialCicloVendasPedidosProducaoTelasFormularioService,
    private formaPagamentoService: ComercialCadastrosFormasPagamentoService,
    private clientesService: ComercialClientesService,
    private modalService: BsModalService,
    private clienteDetalhesService: ComercialGestaoContratosComerciaisFormularioModalDetalhesService,
    private titleService: TitleService
  ) {
    this.localeService.use('pt-br');
    this.pnotifyService.getPNotify();
  }

  ngOnInit(): void {
    this.titleService.setTitle('Gestão');
    this.setFormFilter();
    this.onFormSubscription();
    this.getTipoServico();
    this.getTipoFrete();
    this.getFormaPagamento();
    this.setBreadCrumb();
    this.getSituacao();
    this.setFormMateriais();
    this.getFilterValues();
    this.setLoaderEvents();
  }

  ngOnDestroy(): void {
    this.unsetLoaderEvents();
  }

  setBreadCrumb(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.id) {
        this.appTitle = 'Editar Contrato comercial';
        this.action = 'update';
        this.editar = true;
      } else {
        this.appTitle = 'Novo Contrato comercial';
        this.action = 'create';
      }
      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/comercial/home',
        },
        {
          descricao: 'Gestão',
          routerLink: `/comercial/gestao/${params.idSubModulo}`,
        },
        {
          descricao: 'Contratos Comerciais',
          routerLink: `/comercial/gestao/${params.idSubModulo}/contratos-comerciais/lista`,
        },
        {
          descricao: this.appTitle,
        },
      ];
    });
  }

  getEnderecos(id, params) {
    this.loaderEnderecos = true;
    this.enderecos = [];
    this.clientesService
      .getEnderecos(id, params)
      .pipe(
        finalize(() => {
          this.loaderEnderecos = false;
        })
      )
      .subscribe((response) => {
        this.enderecos = response['data']['enderecos'];

        this.enderecos.map((endereco) => {
          endereco.enderecoAjustado = endereco?.endereco;

          if (endereco?.codLocal) {
            endereco.enderecoAjustado += `, ${endereco?.codLocal}`;
          }

          if (endereco?.bairro) {
            endereco.enderecoAjustado += `, ${endereco?.bairro}`;
          }

          if (endereco?.cidade) {
            endereco.enderecoAjustado += `, ${endereco?.cidade}`;
          }

          if (endereco?.uf) {
            endereco.enderecoAjustado += `, ${endereco?.uf}`;
          }
        });
      });
  }

  getClientesGrupoEconomico(idCliente: any) {
    this.loaderGrupoEconomico = true;
    this.clientesService
      .getClientesGrupoEconomico(idCliente)
      .pipe(finalize(() => (this.loaderGrupoEconomico = false)))
      .subscribe({
        next: (response: any) => {
          if (response) {
            this.grupoEconomico = response.data;
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

  onFormSubscription() {
    this.form.get('codCliente')?.valueChanges?.subscribe((codCliente) => {
      this.getEnderecos(codCliente, { localEntrega: 1 });
      this.getClientesGrupoEconomico(codCliente);
    });

    this.form
      .get('codTipoServico')
      ?.valueChanges?.subscribe((codTipoServico) => {
        codTipoServico == 1
          ? this.form
              .get('codEnderecoEntrega')
              .setValidators([Validators.required])
          : this.form.get('codEnderecoEntrega').setValidators([]);
        this.form.get('codEnderecoEntrega').updateValueAndValidity();
      });

    this.form
      .get('codEnderecoEntrega')
      ?.valueChanges?.subscribe((codEnderecoEntrega) => {
        const endereco: Array<any> = this.enderecos.filter(
          (endereco) => endereco?.id == codEnderecoEntrega
        );
        if (endereco.length == 1) {
          this.form.get('uf').setValue(endereco[0]['uf']);
        }
      });
  }

  // Formulário Preenchido para edição ou novo formulário
  setFormFilter() {
    const resolver = this.activatedRoute.snapshot.data.detalhes;

    if (resolver.success === true) {
      const detalhes: any = resolver.data[0];

      this.showVisual = true;

      if (detalhes.codTipoServico === 1) {
        this.changeTipoServico = true;
      }

      var codCliente = null;

      if (
        detalhes.codCliente > 0 &&
        (detalhes.codCliente != null || detalhes.codCliente != undefined)
      ) {
        codCliente = detalhes.codCliente;
        this.getEnderecos(codCliente, { localEntrega: 1 });
        this.getClientesGrupoEconomico(codCliente);
      }

      this.form = this.formBuilder.group({
        codContrato: [detalhes.codContrato],
        codEmpresa: [detalhes.codEmpresa, [Validators.required]],
        codCliente: [codCliente],
        codRazaoSocial: [detalhes.codRazaoSocial],
        nomeContrato: [detalhes.nomeContrato, [Validators.required]],

        dataInicialContrato: [
          detalhes.codContrato == null
            ? this.dateService.getToday()
            : this.dateService.convertStringToDate(
                detalhes.dataInicialVigencia,
                'usa'
              ),
          [Validators.required],
        ],

        dataFinalContrato: [
          detalhes.codContrato == null
            ? this.dateService.getToday()
            : this.dateService.convertStringToDate(
                detalhes.dataFinalVigencia,
                'usa'
              ),
          [Validators.required],
        ],

        codSituacao: this.showVisual === true ? [detalhes.codSituacao] : 1,
        // this.visualizar && this.action === 'update' ? : 2,

        codPeso:
          this.changeTipoServico === false
            ? [detalhes.qtdeMaximaConsumo, [Validators.required]]
            : [detalhes.qtdeMaximaConsumo],

        codTipoServico: [detalhes.codTipoServico, [Validators.required]],
        grupoEconomico: [detalhes.grupoEconomico],
        codFormaPagamento: [detalhes.codFormaPagamento, [Validators.required]],
        codTipoFrete: [detalhes.codTipoFrete],
        codEnderecoEntrega: [detalhes.codEnderecoEntrega],
        uf: [null],
        precoAps:
          this.changeTipoServico === false ? 0 : [detalhes.valorServicoAps],
        valorServico:
          this.changeTipoServico === false
            ? 0
            : [detalhes.valorServico, [Validators.required]],
        assocMateriais: this.formBuilder.array([]),
        anexos: this.formBuilder.array([]),
      });

      this.setMateriais(detalhes.materiais);

      if (detalhes.codContrato != null) {
        this.getAnexos(detalhes.codContrato);
      }

      this.visualizar = false;

      if (
        detalhes.codSituacao != 3 &&
        detalhes.codSituacao != null &&
        detalhes.codSituacao != 1
      ) {
        // this.profileDisabled();
        this.visualizar = true;
      }
    } else {
      this.pnotifyService.error();
      this.location.back();
    }

    this.showVisual = false;
  }

  getAnexos(codContrato: number) {
    this.loaderNavbar = true;
    this.showAnexos = false;
    this.contratosComerciaisService
      .getAnexos(codContrato)
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
          if (error['error'].hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
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

  onPostAnexos(codContrato: number): void {
    if (this.formData.length === 0) {
      /* this.pnotifyService.notice('Erro'); */
      return;
    }

    /* const id = this.form.value.codMaterial; */

    this.formData.forEach((element, index) => {
      this.contratosComerciaisService
        .postAnexos(element, codContrato)
        .subscribe();
    });
  }

  onDeleteAnexo(codAnexo: number, index: number): void {
    this.confirmDelete().subscribe((r: boolean) => {
      if (codAnexo) {
        this.loaderNavbar = true;
        this.contratosComerciaisService
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

  checkValidatorsData(): any {
    let validation = true;

    var dtInicialContrato: Date = this.form.value.dataInicialContrato;
    var dtFinalContrato: Date = this.form.value.dataFinalContrato;

    for (let i = 0; i < this.assocMateriais.value.length; i++) {
      var dtInicialMateriais: Date = this.assocMateriais.value[i].dtInicial;
      var dtFinalMateriais: Date = this.assocMateriais.value[i].dtFinal;

      if (dtInicialMateriais > dtFinalMateriais) {
        validation = false;
        this.pnotifyService.error(
          'A Data Inicial do material não pode ser maior que a Data Final.'
        );
      } else if (
        (dtInicialMateriais < dtInicialContrato &&
          dtFinalContrato > dtInicialContrato) ||
        (dtFinalMateriais > dtFinalContrato &&
          dtInicialContrato < dtFinalContrato)
      ) {
        validation = false;
        this.pnotifyService.error(
          'Verifique se as datas dos materiais estão em acordo com as datas do contrato.'
        );
      }
    }

    if (dtInicialContrato > dtFinalContrato) {
      validation = false;
      this.pnotifyService.error(
        'A Data Inicial do contrato não pode ser mario que a Data Final.'
      );
    } else return validation;
  }

  getFilterValues(): void {
    this.materiaisGrupoService
      .getFilterValues()
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe((response: any) => {
        if (response[0].responseCode === 200) {
          this.linhas = response[0].result;
        } else {
          this.pnotifyService.error();
          this.location.back();
        }

        if (response[1].responseCode === 200) {
          this.classes = response[1].result;
        } else {
          this.pnotifyService.error();
          this.location.back();
        }
      });

    this.comercialService
      .getEmpresas({ tipo: 'faturamento' })
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          this.empresas = response.result;
        },
        error: (error: any) => {
          this.pnotifyService.error('Ocorreu um erro ao carregar filtros.');
          this.location.back();
        }
      });
  }

  onCancel(): void {
    this.location.back();
  }

  onInput(): void {
    this.formChanged = true;
  }

  //Ação de Edição ou novo Formulário
  onSubmit(codSituacao): void {
    this.form.get('codSituacao').setValue(codSituacao);

    let record = this.form.value;

    if (this.form.value.grupoEconomico != null) {
      record.codCliente = [
        record.codCliente,
        ...record.grupoEconomico,
      ].toString();
    }

    if (
      this.action === 'update' &&
      this.form.valid &&
      this.checkValidatorsData()
    ) {
      this.onPostAnexos(this.form.value.codContrato);

      this.contratosComerciaisService
        .save(record, this.action)
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
              this.onPostAnexos(this.form.value.codContrato);
              //this.form.reset();
              this.formChanged = false;
              this.pnotifyService.success();

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
      if (
        this.checkFormValidation() &&
        this.form.valid &&
        this.checkValidatorsData()
      ) {
        if (this.form.value.assocMateriais.length > 0) {
          this.loaderNavbar = true;
          this.submittingForm = true;
          this.contratosComerciaisService
            .save(record, this.action)
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
                  this.onPostAnexos(response.data?.codContrato);
                  //this.form.reset();
                  this.formChanged = false;
                  this.pnotifyService.success();

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
          if (this.checkValidatorsData() === false) {
            this.pnotifyService.notice('Associe pelo menos um material.');
          }
        }
      } else {
        if (this.checkValidatorsData() === false) {
          this.pnotifyService.notice('Selecione um material.');
        }
      }
    }
  }

  onChangeServico() {
    this.changeTipoServico = false;
    if (this.form.value.codTipoServico === 1) {
      this.changeTipoServico = true;
      this.formMateriais.get('codLinha').setValue(1);
      this.onChangeLinha(1);
      this.formMateriais.get('codClasse').setValue(80);
      this.onChangeClasse(80);
      this.form
        .get('valorServico')
        .setValidators([Validators.required, Validators.min(0.01)]);
      this.form.controls.valorServico.updateValueAndValidity();
    } else if (this.form.value.codTipoServico === 2) {
      this.changeTipoServico = false;
      this.form.get('codPeso').setValue('0');
      this.formMateriais.get('codLinha').reset();
      this.formMateriais.get('codClasse').reset();
      this.formMateriais.get('codMaterial').reset();
      this.formMateriais.get('codClasse').disable();
      this.formMateriais.get('codMaterial').disable();
      this.form.get('valorServico').setValidators([]);
      this.form.controls.valorServico.updateValueAndValidity();
    } else {
      this.formMateriais.get('codLinha').reset();
      this.formMateriais.get('codClasse').reset();
      this.formMateriais.get('codMaterial').reset();
      this.formMateriais.get('codClasse').disable();
      this.formMateriais.get('codMaterial').disable();
    }
  }

  // Get perfil
  getPerfil() {
    this.comercialService
      .getPerfil()
      .pipe(finalize(() => {}))
      .subscribe({
        next: (response: any) => {
          if (response.responseCode === 200) {
            this.profile = response.result;
            if (
              this.profile.coordenador === true ||
              (this.profile.gestor === true &&
                this.profile.vendedor === true &&
                this.profile.coordenador === false &&
                this.profile.gestor === false &&
                this.profile.hasVinculoOperadores === true)
            ) {
              this.checkRouterParams();
            } else if (
              this.profile.vendedor === true &&
              this.profile.coordenador === false &&
              this.profile.gestor === false &&
              this.profile.hasVinculoOperadores === true
            ) {
              this.idVendedor = this.user.info.idVendedor;
              this.idEscritorio = this.user.info.idEscritorio;
              this.form
                .get('codVendedor')
                .setValue(parseInt(this.user.info.idVendedor));
              this.form
                .get('codGerencia')
                .setValue(parseInt(this.user.info.idEscritorio));
              this.desativado = true;
              this.showDashboard = true;
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

  checkRouterParams(): Object {
    let formValue = {
      nomeContrato: null,
      dataInicial: this.dateService.getFirstDayMonth(),
      dataFinal: this.dateService.getLastDayMonth(),
      cliente: null,
      vendedor: 0,
      situacao: 0,
      registros: 300,
    };

    this.activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (queryParams) => {
        if (Object.keys(queryParams).length > 0) {
          let params = atob(queryParams['q']);

          Object.keys(formValue).forEach((formKey) => {
            Object.keys(params).forEach((paramKey) => {
              if (
                formKey == paramKey &&
                formValue[formKey] != params[paramKey]
              ) {
                if (formKey === 'dataInicial' || formKey === 'dataFinal') {
                  formValue[formKey] = this.dateService.convertStringToDate(
                    params[paramKey],
                    'pt-br'
                  );
                } else {
                  if (!isNaN(Number(params[paramKey]))) {
                    formValue[formKey] = Number(params[paramKey]);
                  } else {
                    formValue[formKey] = params[paramKey];
                  }
                }
              }
            });
          });
        }
      }
    );
    this.activatedRouteSubscription.unsubscribe();

    return formValue;
  }

  getTipoFrete() {
    this.contratosComerciaisService.getTiposFrete().subscribe({
      next: (response: any) => {
        if (response) {
          this.tipoFrete = response.data;

          this.tipoFrete.unshift({
            codigo: 0,
            descricao: 'Sem Frete',
          });
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

  getTipoServico() {
    this.contratosComerciaisService.getTipoServico().subscribe({
      next: (response: any) => {
        if (response) {
          this.tipoServico = response.data.filter(
            (tipoServico) => tipoServico?.nomeTipoServico == 'Outros'
          );
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

  getFormaPagamento() {
    const params = {
      codSituacao: 1,
    };
    this.formaPagamentoService.getListaFormasPagamento(params).subscribe({
      next: (response: any) => {
        if (response) {
          this.formaPagamento = response.data;
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

  setClienteSubscription(): void {
    this.codClienteSubscription = this.formularioService.codCliente.subscribe(
      (codCliente: number) => {
        this.form.controls.codCliente.setValue(codCliente);
        this.onChangeCliente(codCliente, 'user');
      }
    );
  }

  onChangeCliente(codCliente: number, source: string): void {
    this.form.controls.codCliente.setValue(codCliente);
    this.codClientErrors = false;
  }

  onLoadCliente(event: boolean): void {
    this.isCarteiraClientesLoaded = event;
  }

  checkFormValidation(): boolean {
    let isValid = true;

    if (this.form.getRawValue().id === null) {
      isValid = false;
    }

    return isValid;
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

  setFormMateriais(): void {
    this.formMateriais = this.formBuilder.group({
      codLinha: [null, [Validators.required]],
      codClasse: [null, [Validators.required]],
      codMaterial: [null],
    });

    this.formMateriais.get('codClasse').disable();
    this.formMateriais.get('codMaterial').disable();
  }

  setMateriais(materiais: any): void {
    materiais.forEach((material) => this.onAddMaterial(material));
  }

  get assocMateriais(): FormArray {
    return this.form.get('assocMateriais') as FormArray;
  }

  onAddMaterial(material: any, manipulateForm?: boolean): void {
    if (this.codClasse === null) {
      this.codClasse = material.codClasse;
    }

    this.valorFinalUpdate =
      material.valorMaterial + this.form.value.valorServico;

    // if (this.codClasse === material.codClasse) {
    if (this.checkMaterialExists(material) === false) {
      this.assocMateriais.push(
        this.formBuilder.group({
          codAssociacao: [material.codAssociacao],
          codMaterial: [material.codMaterial],
          nomeMaterial: [material.nomeMaterial],
          codClasse: [material.codClasse],
          precoOriginal: [material.valorOriginalMaterial],
          precoAlterado: [material.valorMaterial, [Validators.required]],
          qtdadeMaxima: [material.qtdeMaximaConsumo, [Validators.required]],
          valorFinal: [material.valorMaterial + this.form.value.valorServico],
        })
      );

      if (this.form.value.assocMateriais.length > 9) {
        if (this.tableConfigAssocMateriais.fixedHeader === false) {
          this.showMateriais = false;
          this.tableConfigAssocMateriais.fixedHeader = true;

          setTimeout(() => {
            this.showMateriais = true;
          }, 1);
        }
      }

      if (manipulateForm) {
        this.form.markAsTouched();
        this.form.markAsDirty();
      }
    }
    // } else {
    //   this.pnotifyService.notice('Associe apenas materiais da mesma classe.');
    // }
  }

  changeTipoFrete() {
    this.changeTipo = false;
    if (this.form.value.tipoFrete === 1) {
      this.changeTipo = true;
    }
  }

  checkMaterialExists(material: any): boolean {
    return this.form.value.assocMateriais.some((el: any) => {
      return el.codMaterial === material.codMaterial;
    });
  }

  onLimparAssociacoes(): void {
    const assocMateriais = this.form.get('assocMateriais') as FormArray;
    assocMateriais.clear();
    this.codClasse = null;
  }

  onDeleteMaterial(index: number): void {
    this.confirmDelete().subscribe((response: boolean) =>
      response ? this.deleteMaterial(index) : null
    );
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

  deleteMaterial(index: number) {
    this.assocMateriais.removeAt(index);
    this.form.markAsTouched();
    this.form.markAsDirty();
  }

  onChangeLinha(codLinha: number) {
    this.formMateriais.controls.codClasse.reset();
    this.formMateriais.controls.codClasse.setValue(null);
    this.formMateriais.controls.codClasse.enable();
    this.formMateriais.controls.codClasse.setValidators([Validators.required]);
    this.formMateriais.controls.codClasse.updateValueAndValidity();

    this.formMateriais.controls.codMaterial.reset();
    this.formMateriais.controls.codMaterial.disable();
    this.formMateriais.controls.codMaterial.setValue(null);
    this.formMateriais.controls.codMaterial.updateValueAndValidity();

    this.filteredClasses = this.classes.filter(
      (value: any) => value.idLinha == codLinha
    );

    // if (this.form.value.codTipoServico === 1 && this.formMateriais.value.codLinha === 1) {
    //   this.formMateriais.get('codClasse').setValue(80);
    // }
  }

  onChangeClasse(codClasse: number) {
    this.formMateriais.controls.codMaterial.reset();
    this.formMateriais.controls.codMaterial.enable();
    this.formMateriais.controls.codMaterial.setValue(null);
    this.formMateriais.controls.codMaterial.updateValueAndValidity();

    this.getMateriais(codClasse);
  }

  getMateriais(codClasse: number): void {
    if (typeof codClasse !== 'undefined' && codClasse !== null) {
      if (this.checkFieldErrors() === false) {
        this.materiaisLoader = true;
        this.materiais = [];

        const codEmpresa = this.form.get('codEmpresa').value ?? '';
        const codEnderecoEntrega = this.form.value.codEnderecoEntrega;
        const codCliente = this.form.getRawValue().codCliente;

        this.contratosComerciaisService
          .getMateriais({
            codClasse: codClasse,
            codEmpresa: codEmpresa,
            codEnderecoEntrega,
            codCliente,
          })
          .pipe(
            finalize(() => {
              this.materiaisLoader = false;
            })
          )
          .subscribe({
            next: (response: JsonResponse) => {
              if (
                response.hasOwnProperty('success') &&
                response.success === true
              ) {
                this.materiais = response.data;

                this.materiais.unshift({
                  codigoMaterial: 0,
                  codigoDescricaoMaterial: 'EXIBIR TODOS',
                });

                this.formMateriais.controls.codMaterial.setValue(0);
              } else {
                this.pnotifyService.notice(response.mensagem);
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
  }

  onFilterMateriais(): void {
    if (this.formMateriais.valid) {
      if (this.checkFieldErrors() === false) {
        this.loaderNavbar = true;
        this.searching = true;
        this.materiaisLista = [];
        this.materiaisListaLoaded = false;
        this.materiaisListaEmpty = false;

        const codEmpresa = this.form.get('codEmpresa').value;
        const codEnderecoEntrega = this.form.value.codEnderecoEntrega;
        const codCliente = this.form.getRawValue().codCliente;

        let params = {
          codClasse: this.formMateriais.value.codClasse,
          codEmpresa,
          codEnderecoEntrega,
          codCliente,
        };

        if (this.formMateriais.value.codMaterial !== 0) {
          Object.assign(params, {
            codMaterial: this.formMateriais.value.codMaterial,
          });
        }

        this.contratosComerciaisService
          .getMateriais(params)
          .pipe(
            finalize(() => {
              this.firstSearch = true;
              this.searching = false;
              this.loaderNavbar = false;
              this.materiaisListaLoaded = true;
            })
          )
          .subscribe({
            next: (response: JsonResponse) => {
              if (
                response.hasOwnProperty('success') &&
                response.success === true
              ) {
                this.materiaisLista = response.data.map(function (el: any) {
                  var o = Object.assign({}, el);
                  o.checked = 0;
                  return o;
                });

                if (this.materiaisLista.length > 9) {
                  this.tableConfigMateriais.fixedHeader = true;
                } else {
                  this.tableConfigMateriais.fixedHeader = false;
                }
              } else if (
                response.hasOwnProperty('success') &&
                response.success === false &&
                response.hasOwnProperty('mensagem')
              ) {
                this.pnotifyService.error(response.mensagem);
                this.materiaisListaEmpty = true;
              } else {
                this.pnotifyService.error();
                this.materiaisListaEmpty = true;
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
  }

  checkFieldErrors(): boolean {
    let hasError = false;

    if (this.form.getRawValue().codCliente == null) {
      this.pnotifyService.notice('Selecione o cliente');
      hasError = true;
    }

    if (this.form.value.codEmpresa == null) {
      this.pnotifyService.notice('Selecione a empresa');
      hasError = true;
    }

    if (this.form.value.codEnderecoEntrega == null) {
      this.pnotifyService.notice('Selecione o endereço de entrega');
      hasError = true;
    }

    return hasError;
  }

  onToggleAll() {
    this.toggleAll = !this.toggleAll;

    for (let index = 0; index < this.materiaisLista.length; index++) {
      this.materiaisLista[index].checked = this.toggleAll === true ? 1 : 0;
    }
  }

  onCheckMaterial(index: number, material: any): void {
    this.materiaisLista[index].checked = material.checked == 0 ? 1 : 0;
  }

  onAssociarMateriais(): void {
    this.toggleAll = false;

    this.materiaisLista
      .filter((material) => material.checked === 1)
      .forEach((material) => {
        this.onAddMaterial(
          {
            codMaterial: material.codigoMaterial,
            nomeMaterial: material.descricao,
            codClasse: material.codClasse,
            valorOriginalMaterial: material.valorOriginalMaterial,
            inCorteDobra: material.inCorteDobra,
          },
          true
        );
      });

    this.materiaisLista = this.materiaisLista.filter(
      (material) => material.checked === 0
    );
  }

  setGrupos(grupos: any[]): void {
    if (grupos.length > 0) {
      for (let i = 0; i < grupos.length; i++) {
        this.onAddGrupo(grupos[i], false);
      }
    }
  }

  get assocGrupos(): FormArray {
    return this.form.get('assocGrupos') as FormArray;
  }

  /**
   * @source = 'application' || 'user'
   */
  onAddGrupo(grupo: any, manipulateForm: boolean): void {
    if (this.checkGrupoExists(grupo) === false) {
      this.assocGrupos.push(this.formModelo.value);

      // this.assocGrupos.push(this.valor)

      if (this.form.value.assocGrupos.length > 9) {
        if (this.tableConfigAssocGrupos.fixedHeader === false) {
          this.showGrupos = false;
          this.tableConfigAssocGrupos.fixedHeader = true;

          setTimeout(() => {
            this.showGrupos = true;
          }, 1);
        }
      }

      if (!this.toggle) {
        this.assocGrupos.get('de').disable();
        this.assocGrupos.get('ate').disable();
      }

      if (manipulateForm) {
        this.form.markAsTouched();
        this.form.markAsDirty();
      }
    }
  }

  checkGrupoExists(grupo: any): boolean {
    return this.form.value.assocGrupos.some((el: any) => {
      return el.codGrupo === grupo.codGrupo;
    });
  }

  grupoAssociado(material: any): void {
    this.onAddGrupo(material, true);
  }

  onAssociarGrupos(): void {
    this.toggle = false;

    for (let index = 0; index < this.dados.length; index++) {
      if (this.dados[index] === 1) {
        const grupo = {
          codGrupo: this.dados[index].codGrupo,
          de: this.dados[index].de,
          ate: this.dados[index].ate,
          valorComissao: this.dados[index].valorComissao,
          valorFixo: this.dados[index].valorFixo,
        };

        this.grupoAssociado(grupo);
        this.dados[index].checked = 0;
      }
    }
  }

  // Consulta selects

  getSituacao() {
    this.contratosComerciaisService.getSituacao().subscribe({
      next: (response: any) => {
        if (response.success === true) {
          this.situacoes = response.data;
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
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      animated: false,
      class: 'modal-xl',
    });
  }

  // Tratamento de erros
  onFieldError(field: string): string {
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
    if (this.form.controls[field].validator) {
      let validationResult = this.form.controls[field].validator(formControl);
      required =
        validationResult !== null && validationResult.required === true;
    }

    if (required) {
      return 'is-required';
    }
  }

  // Tratamento de erros Form Material
  onFieldErrorFormMaterial(field: string): string {
    if (this.onFieldInvalidFormMaterial(field)) {
      return 'is-invalid';
    }

    return '';
  }

  onFieldInvalidFormMaterial(field: any) {
    field = this.formMateriais.get(field);

    if (field.errors != null) {
      if (field.errors.hasOwnProperty('required') && field.touched) {
        return 'required';
      }
    }

    return '';
  }

  onFieldRequiredFormMaterial(field: string) {
    let required = false;
    let formControl = new FormControl();

    if (this.formMateriais.controls[field].validator) {
      let validationResult =
        this.formMateriais.controls[field].validator(formControl);
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

  onNestedFieldError(formGroup: string, index: number, field: string) {
    if (this.onNestedFieldInvalid(formGroup, index, field)) {
      return 'is-invalid';
    }

    return '';
  }

  onNestedFieldInvalid(formGroup: string, index: number, field: any) {
    let nestedForm: any = this.form.controls[formGroup];
    field = nestedForm.controls[index].get(field);

    return field.status == 'INVALID' && field.touched;
  }

  onNestedFieldRequired(formGroup: string, index: number, field: string) {
    let required = false;
    let formControl = new FormControl();
    let nestedForm: any = this.form.controls[formGroup];

    if (nestedForm.controls[index].get(field).validator) {
      let validationResult = nestedForm.controls[index]
        .get(field)
        .validator(formControl);
      required =
        validationResult !== null && validationResult.required === true;
    }

    if (required) {
      return 'is-required';
    }
  }

  geetParams(params: any): any {
    let dataInicial = params['dataInicialVigencia'];
    let dataFinal = params['dataFimVigencia'];

    this.form.patchValue({
      dataInicialVigencia: dataInicial,
      dataFimVigencia: dataFinal,
    });

    if (dataInicial instanceof Date) {
      dataInicial = this.dateService.convertToUrlDate(dataInicial);
    }

    if (dataFinal instanceof Date) {
      dataFinal = this.dateService.convertToUrlDate(dataFinal);
    }

    return {
      dataInicial: { dataInicial },
      dataFinal: { dataFinal },
    };
  }

  onFecharModal(event) {
    this.modalRef.hide();
  }

  setLoaderEvents(): void {
    this.loaderDetalhesClienteSubscription =
      this.clienteDetalhesService.loaderNavbar.subscribe(
        (response: boolean) => {
          this.loaderNavbar = response;
        }
      );
  }

  unsetLoaderEvents(): void {
    this.loaderDetalhesClienteSubscription.unsubscribe();
  }

  onClienteDetalhes(): void {
    this.clienteDetalhesService.showModal(this.form.value.codCliente);
  }

  onCliente(event) {
    this.form.patchValue(event);
    this.onChangeCliente(event.codCliente, 'user');
    this.onLoadCliente(true);
  }
}
