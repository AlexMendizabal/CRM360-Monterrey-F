import { DetailPanelService } from './../../../../../shared/templates/detail-panel/detal-panel.service';
import { ConfirmModalService } from './../../../../../shared/modules/confirm-modal/confirm-modal.service';
import { ComercialCadastrosMateriaisGrupoService } from './../../../cadastros/materiais/grupos/grupos.service';
import { IPermissoesAcessoModel } from './../../../ciclo-vendas/cotacoes/formulario/models/permissoes-acesso';
import { ComercialCicloVendasPedidosProducaoTelasFormularioService } from './../../../ciclo-vendas/pedidos-producao-telas/formulario/formulario.service';
import { ComercialGestaoContratosComerciaisService } from '../../contratos-comerciais/contratos-comerciais.service';
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  TemplateRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

// ngx-bootstrap
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { ptBrLocale } from 'ngx-bootstrap/locale';

defineLocale('pt-br', ptBrLocale);

// Services
import { AuthService } from './../../../../../shared/services/core/auth.service';
import { ComercialService } from './../../../comercial.service';
import { ComercialVendedoresService } from './../../../services/vendedores.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { DateService } from 'src/app/shared/services/core/date.service';


// Interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { JsonResponse } from 'src/app/models/json-response';

@Component({
  selector: 'contratos-comerciais',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class ComercialGestaoContratosComerciaisListaComponent implements OnInit {
  @ViewChild('scrollToFilter', {}) scrollToFilter: ElementRef;
  permissoesAcesso: IPermissoesAcessoModel = {
    acessoClientes: false,
    historicoExclusao: false,
    duplicataCarteira: false,
  };

  private user = this.authService.getCurrentUser();

  loaderNavbar = false;
  loaderFullScreen = true;

  breadCrumbTree: Array<Breadcrumb> = [];

  subtitles: Array<Subtitles> = [
    {
      id: 1,
      text: 'Em Aberto',
      color: 'green',
    },
    {
      id: 4,
      text: 'Aguardando Aprovação',
      color: 'yellow',
    },
    {
      id: 2,
      text: 'Aprovado',
      color: 'blue',
    },
    {
      id: 3,
      text: 'Reprovado',
      color: 'red',
    },

  ];

  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
  };

  tableConfigAnexos: Partial<CustomTableConfig> = {
    fixedHeader: false,
    bodyHeight: 230,
    hover: false,
  };

  showDashboard = false;
  showFilter = false;
  showPermissionDenied = false;

  idEscritorio: number;
  idVendedor: number;
  profile: any = {};

  showMateriais = true;
  materiaisListaLoaded = false;
  materiaisListaEmpty = false;

  filteredClasses: Array<any> = [];
  materiais: Array<any> = [];
  classes: Array<any> = [];
  linhas: Array<any> = [];
  materiaisLista: Array<any> = [];
  detailPanelData: Array<any> = [];
  detailPanelMateriais: Array<any> = [];
  detailPanelCliente: Array<any> = [];

  desativado: boolean = false;

  activatedRouteSubscription: Subscription;

  showDetailPanelSubscription: Subscription;
  showDetailPanel = false;

  form: FormGroup;
  formMateriais: FormGroup;
  formReprovar: FormGroup;
  orderBy = 'id';
  orderType = 'ASC';

  enderecos: Array<any> = [];

  changeTipoMaterial: boolean = false;
  materiaisLoader: boolean;

  maxSize = 10;
  itemsPerPage = 300;
  currentPage = 1;
  totalItems = 0;

  dados: Array<any> = [];
  dadosPagination: Array<any> = [];
  dadosLoaded = false;
  dadosEmpty = false;

  codClienteSubscription: Subscription;
  isCarteiraClientesLoaded: boolean;
  codClientErrors = false;

  modalRef: BsModalRef;
s
  vendedores: any = [];
  empresas: any = [];
  situacoes: any = [
    {
      id: 0,
      situacao: 'EXIBIR TODOS',
    },
    {
      id: 4,
      situacao: 'APROVADOS',
    },
    {
      id: 3,
      situacao: 'REPROVADOS',
    },
    {
      id: 2,
      situacao: 'AGUARDANDO APROVAÇÃO',
    },
  ];
  situacoesFiltered: any = this.situacoes;
  situacaoLoaded: boolean = false;

  enderecoSelecionado: any;
  msgModal: string;

  bsConfig: Partial<BsDatepickerConfig>;

  anexos: Array<any> = [];
  showAnexos: boolean = false;
  ultimaCompra: any;
  acao: string;

  carteira: any = [
    {
      codigo: 'S',
      descricao: 'MINHA CARTEIRA',
    },
    {
      codigo: '',
      descricao: 'TODOS',
    }
  ];

  constructor(
    private localeService: BsLocaleService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private location: Location,
    private formBuilder: FormBuilder,
    private pnotifyService: PNotifyService,
    private atividadesService: AtividadesService,
    private titleService: TitleService,
    private dateService: DateService,
    private vendedoresService: ComercialVendedoresService,
    private comercialService: ComercialService,
    private authService: AuthService,
    private formularioService: ComercialCicloVendasPedidosProducaoTelasFormularioService,
    private contratosComerciaisService: ComercialGestaoContratosComerciaisService,
    private materiaisGrupoService: ComercialCadastrosMateriaisGrupoService,
    private bsModalService: BsModalService,
    private confirmModalService: ConfirmModalService,
    private detailPanelService: DetailPanelService
    
  ) {
    this.form = this.formBuilder.group({
      dataInicial: [null, [Validators.required]],
      dataFinal: [null, [Validators.required]],
      nomeContrato: [null],
      situacao: [null],
      registros: [null],
      cliente: [null],
      carteira: [null],
      codMaterial: [null],
      codLinha: [null],
      codClasse: [null],
    });
    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );
    this.pnotifyService.getPNotify();
  }

  ngOnInit(): void {
    this.titleService.setTitle('Gestão');
    this.getFilterValues();
    this.getPerfil();
    this.getSituacao();
    this.registrarAcesso();
    this.getFiltros();
    this.setBreadCrumb();
    this.onDetailPanelEmitter();
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  getFiltros() {
    this.vendedoresService
      .getVendedores()
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.responseCode === 200) {
            this.vendedores = response.result;

            this.vendedores.unshift({
              id: 'T',
              nome: 'EXIBIR TODOS',
            });

            this.vendedores.unshift({
              id: 'S',
              nome: 'MINHA CARTEIRA',
            });
            
            this.carteira = this.vendedores;
          }
        },
        error: (error: any) => {
          this.pnotifyService.error();
          this.location.back();
        }
      });
  }

  setBreadCrumb(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/comercial/home',
        },
        {
          descricao: 'Gestão',
          routerLink: `/comercial/gestao/${params['idSubModulo']}`,
        },
        {
          descricao: 'Contratos Comerciais',
        },
      ];
    });
  }

  setFormValueFilter() {
    const formValue: any = this.checkRouterParams();

    this.form.patchValue({
      dataInicial: formValue.dataInicial,
      dataFinal: formValue.dataFinal,
      nomeContrato: formValue.nomeContrato,
      situacao: formValue.situacao,
      registros: formValue.registros,
      cliente: formValue.cliente,
      carteira: formValue.carteira,
      codMaterial: formValue.codMaterial,
      codLinha: formValue.codLinha,
      codClasse: formValue.codClasse,
    });
    
    if(formValue.codLinha > 0 && (formValue.codLinha != null || formValue.codLinha != undefined)) {
        this.onChangeLinha(formValue.codLinha, true);
    } else {
      this.form.get('codClasse').disable();
    }

    if(formValue.codClasse > 0 && (formValue.codClasse != null || formValue.codClasse != undefined)) {
      this.getMateriais(formValue.codClasse);
    } else {
      this.form.get('codMaterial').disable();
    }
  }


  getFilterValues(): void {
    this.materiaisGrupoService
      .getFilterValues()
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
          this.setFormValueFilter();
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
  }

   // Get perfil
   getPerfil() {
    this.loaderFullScreen = true;
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
            if (
              this.profile.coordenador === true ||
              this.profile.gestor === true
              && (this.profile.vendedor === true &&
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
              this.form.get('carteira').setValue('S');
              // this.form.get('codVendedor').setValue(parseInt(this.user.info.idVendedor));
              // this.form.get('codGerencia').setValue(parseInt(this.user.info.idEscritorio));
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
      dataInicial: this.dateService.getFirstDayMonth(),
      dataFinal: this.dateService.getLastDayMonth(),
      nomeContrato: null,
      situacao: 0,
      registros: 300,
      cliente: null,
      carteira: 'T',
      codMaterial: null,
      codLinha: null,
      codClasse: null,
    };

    this.activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (queryParams) => {
        if (Object.keys(queryParams).length > 0) {
          let params = atob(queryParams['q']);
          params = JSON.parse(params);
          this.search(params);

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

  checkOrder(): void {
    if (this.form.value.orderBy !== this.orderBy) {
      this.orderBy = this.form.value.orderBy;
    }

    if (this.form.value.orderType !== this.orderType) {
      this.orderType = this.form.value.orderType;
    }
  }

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

    if (this.form.controls[field].validator) {
      let validationResult = this.form.controls[field].validator(formControl);
      required =
        validationResult !== null && validationResult.required === true;
    }

    if (required) {
      return 'is-required';
    }
  }

  checkValidatorsData() {
    let validation = true;
    let dataInicial: Date = this.form.value.dataInicial;
    let dataFinal: Date = this.form.value.dataFinal;

    if (dataInicial > dataFinal) {
      validation = false;
    }

    return validation;
  }

  onFilter(): void {

    let confirm: boolean = false;

    if (!this.checkValidatorsData()) {
      this.pnotifyService.notice(
        'Data Inicial não pode ser maior que Data Final'
      );
    } else {
      confirm = true;
    }
    if (this.form.valid && confirm == true) {
      this.itemsPerPage = this.form.value.registros;
      this.currentPage = 1;
      this.setRouterParams(this.verificaParams());
    }
  }


  setRouterParams(params: any): void {

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { q: btoa(JSON.stringify(params)) },
    });
    this.search(params);
  }

  getParams() {
    let _params = {};
    let _obj = this.form.value;
    for (let prop in _obj) {
      if (_obj[prop]) {
        if (_obj[prop] instanceof Date)
        _params[prop] = this.dateService.convertToUrlDate(_obj[prop]);
        else _params[prop] = _obj[prop];
      }
    }

    return _params;
  }

  verificaParams() {
    let params: any = {};

    if (this.form.value.nomeContrato) {
      params.nomeContrato = this.form.value.nomeContrato;
    }

    if (this.form.value.dataInicial) {
      params.dataInicial = this.dateService.convertToUrlDate(
        new Date(this.form.value.dataInicial)
      );
    }

    if (this.form.value.dataFinal) {
      params.dataFinal = this.dateService.convertToUrlDate(
        new Date(this.form.value.dataFinal)
      );
    }

    if (this.form.value.cliente) {
      params.cliente =  this.form.value.cliente
    }

    if (this.form.value.carteira) {
      params.carteira =  this.form.value.carteira
    }

    if (this.form.value.codMaterial) {
      params.codMaterial = this.form.value.codMaterial;
    }

    if (this.form.value.codLinha) {
      params.codLinha = this.form.value.codLinha;
    }

    if (this.form.value.codClasse) {
      params.codClasse = this.form.value.codClasse;
    }

    if (this.form.value.situacao) {
      params.situacao = this.form.value.situacao;
    }

    if (this.form.value.registros) {
      params.registros = this.form.value.registros;
    }


    return params;
  }

  search(params: any): void {
    
    if(!this.loaderFullScreen)
      this.loaderNavbar = true;
    
    this.dados = [];
    this.dadosPagination = [];
    this.dadosLoaded = false;
    this.dadosEmpty = false;

    this.contratosComerciaisService
      .getListaContratos(params)
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
          this.loaderNavbar = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.hasOwnProperty('success') && response.success === true) {
            this.dados = response.data;
            this.dadosPagination = this.dados.slice(0, this.itemsPerPage);
            this.totalItems = this.dados.length;
            this.dadosLoaded = true;
          } else if (
            response.hasOwnProperty('success') &&
            response.success === false
          ) {
            this.dadosEmpty = true;
          } else {
            this.pnotifyService.error();
            this.dadosEmpty = true;
          }
        },
        error: (error: any) => {
          this.dadosEmpty = true;

          if (error.error.hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
      });
  }

  classStatusBorder(item: any): string {
    let borderClass: string;

    if (item.codSituacao === 1) {
      borderClass = 'border-success';
    } else if (item.codSituacao === 3) {
      borderClass = 'border-danger';
    } else if (item.codSituacao === 4) {
      borderClass = 'border-primary';
    } else if (item.codSituacao === 2) {
      borderClass = 'border-warning';
    }

    return borderClass;
  }

  onPageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.dadosPagination = this.dados.slice(startItem, endItem);

    this.scrollToFilter.nativeElement.scrollIntoView({
      behavior: 'instant',
    });
  }

  onChangeLinha(codLinha: number, reload?: boolean) {
    if(!reload) {
      this.form.controls.codClasse.reset();
      this.form.controls.codClasse.setValue(null);
      this.form.controls.codClasse.enable();
      this.form.controls.codClasse.updateValueAndValidity();
  
      this.form.controls.codMaterial.reset();
      this.form.controls.codMaterial.disable();
      this.form.controls.codMaterial.setValue(null);
      this.form.controls.codMaterial.updateValueAndValidity();
    }

    this.filteredClasses = this.classes.filter(
      (value: any) => value.idLinha == codLinha
    );

  }

  onChangeClasse(codClasse: number) {
    this.form.controls.codMaterial.reset();
    this.form.controls.codMaterial.enable();
    this.form.controls.codMaterial.setValue(0);
    this.form.controls.codMaterial.updateValueAndValidity();
    this.getMateriais(codClasse);
  }

  getSituacao() {
    this.contratosComerciaisService
      .getSituacao()
      .subscribe({
        next: (response: any) => {
          if (response.success === true) {
            this.situacoes = response.data;

            this.situacoes.unshift({
              codSituacao: 0,
              nomeSituacao: 'EXIBIR TODOS',
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

  getMateriais(codClasse: number): void {
    if (typeof codClasse !== 'undefined' && codClasse !== null) {
      this.materiaisLoader = true;
      this.materiais = [];

      this.comercialService
        .getMateriais({
          codClasse: codClasse,
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
    }
  }

  setEnderecoSelecionado(): void {
    this.enderecoSelecionado = {
      idCliente: -1,
      codEndereco: null,
      razaoSocial: null,
      codSituacao: null,
      situacao: null,
      codUsuario: null,
      nomeUsuario: null,
      dataCadastro: null,
    };
  }

  onDetailPanelEmitter(): void {
    this.showDetailPanelSubscription = this.detailPanelService.config.subscribe(
      (event: any) => {
        this.showDetailPanel = event.showing;
      }
    );
  }

  onDetails(detalhes): void {
    this.loaderNavbar = true;
    this.detailPanelService.show();
    this.detailPanelMateriais = [];
    this.detailPanelCliente = [];
    this.detailPanelData = [];

    this.contratosComerciaisService
      .getDetailPanel(detalhes.codContrato)
      .pipe(
        finalize(() => {
           setTimeout(() => {
            this.loaderNavbar = false;
          }, 500);
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.success === true) {
            this.detailPanelData = response.data;
            this.detailPanelMateriais = response.data[0].materiais;
            this.detailPanelCliente = response.data[0].codCliente;
            this.loaderNavbar = false;
            this.detailPanelService.loadedFinished(false);
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

  onEdit(item: any): void {
    this.router.navigate(['../editar', item.codContrato], {

      relativeTo: this.activatedRoute,

    });
  }



  convertMysqlTime(time: string) {
    return this.dateService.convertMysqlTime(time);
  }

   // modal
  onAprovar(item) {
    this.confirmAprovacao().subscribe((response: boolean) =>
      response ?  this.contratosComerciaisService
      .postAprovacao(item)
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.success === true) {
            this.pnotifyService.success('Contrato aprovado com sucesso.');
            this.onFilter();
          }
        },
        error: (error: any) => {
          this.pnotifyService.error();
          this.location.back();
        }
      }) : null
    );

  }

  setFormReprovar(item?): void {
    this.formReprovar = this.formBuilder.group({
      codContrato: [item.codContrato],
      descMotivo: [item.motivoReprovacao]
    });
  }

  onReprovar() {
    this.contratosComerciaisService
      .postReprovacao(this.formReprovar.value)
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.success === true) {
            this.pnotifyService.success('Contrato reprovado com sucesso.');
            this.onFilter();
          }
        },
        error: (error: any) => {
          this.pnotifyService.error();
          this.location.back();
        }
      })
  }

  confirmAprovacao(): any {
    return this.confirmModalService.showConfirm(
      'aprovar',
      'Confirmar aprovação',
      'Deseja realmente prosseguir com a aprovação do contrato?',
      'Cancelar',
      'Confirmar'
    );
  }

  openModalReprovar(reprovar: TemplateRef<any>) {
  this.modalRef = this.bsModalService.show(reprovar);
  }

  closeModal(modalRef: TemplateRef<any>) {
    this.modalRef.hide();
  }

  onRefresh() {
    this.setFormValueFilter();
    this.checkRouterParams();
  }
}
