import { id } from 'date-fns/locale';
import { ComercialCadastrosFormasPagamentoService } from './../../../cadastros/formas-pagamento/formas-pagamento.service';
import { TitulosAgenda } from './../../../cadastros/titulos-agenda/models/titulos-agenda';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  HostListener,
  Input,
  TemplateRef,
} from '@angular/core';
import { ActivatedRoute, Router, Data } from '@angular/router';
import { Location } from '@angular/common';
import { switchMap } from 'rxjs/operators';
import {
  FormGroup,
  FormBuilder,
  AbstractControl,
  Validators,
  FormArray,
} from '@angular/forms';
import { Subscription, EMPTY } from 'rxjs';
import { finalize, retry, retryWhen } from 'rxjs/operators';

// ngx-bootstrap
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { ptBrLocale } from 'ngx-bootstrap/locale';

defineLocale('pt-br', ptBrLocale);

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { DateService } from 'src/app/shared/services/core/date.service';
import { ComercialCicloVendasCotacoesFormularioService } from './formulario.service';
import { ComercialClientesService } from '../../../services/clientes.service';
import { ComercialCicloVendasCotacoesFormularioModalMaterialFichaCadastralService } from './modal/material/ficha-cadastral/ficha-cadastral.service';
import { ComercialCicloVendasCotacoesFormularioModalMaterialSimilaridadeService } from './modal/material/similaridade/similaridade.service';
import { ComercialCicloVendasCotacoesFormularioModalMaterialCalculoService } from './modal/material/calculo/calculo.service';
import { ComercialCicloVendasCotacoesFormularioModalMaterialDescontoService } from './modal/material/desconto/desconto.service';
import { ComercialCicloVendasCotacoesFormularioModalMaterialEstoqueService } from './modal/material/estoque/estoque.service';
import { ComercialCicloVendasCotacoesFormularioModalMaterialComboService } from './modal/material/combo/combo.service';
import { ComercialCicloVendasCotacoesFormularioModalHistoricoComprasService } from './modal/cliente/historico-compras/historico-compras.service';
import { ComercialCicloVendasCotacoesFormularioModalDetalhesClienteService } from './modal/detalhes/cliente/cliente.service';
import { ComercialCicloVendasCotacoesFormularioModalDetalhesEnderecoService } from './modal/detalhes/endereco/endereco.service';
import { ComercialCicloVendasCotacoesFormularioModalDetalhesContatoService } from './modal/detalhes/contato/contato.service';
import { ComercialCicloVendasCotacoesFormularioModalDetalhesConcorrenteService } from './modal/detalhes/concorrente/concorrente.service';
import { ComercialCicloVendasCotacoesFormularioModalDuplicatasService } from './modal/duplicatas/duplicatas.service';
import { ComercialCicloVendasCotacoesFormularioModalHistoricoExclusaoService } from './modal/historico-exclusao/historico-exclusao.service';
import { ComercialCicloVendasCotacoesFormularioModalFinalizacaoService } from './modal/finalizacao/finalizacao.service';
import { ComercialVendedoresService } from '../../../services/vendedores.service';
import { ComercialCicloVendasCotacoesService } from '../cotacoes.service';
import { AuthService } from 'src/app/shared/services/core/auth.service';

// Interfaces
import { IFormCanDeactivate } from 'src/app/guards/iform-candeactivate';
import { IPermissoesAcessoModel } from './models/permissoes-acesso';
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { ICarrinhoModel } from './models/carrinho';
import { JsonResponse } from 'src/app/models/json-response';
import { SituacaoProposta } from '../../../cadastros/situacao-proposta/models/situacao-proposta';
import { FormasPagamento } from '../../../cadastros/formas-pagamento/models/formas-pagamento';
import { FormaContato } from '../../../cadastros/contato/formas-contato/models/formas-contato';
import { OrigemContato } from '../../../cadastros/contato/origem-contato/models/origem-contato';
import { Transportadora } from '../../../cadastros/transportadoras/models/transportadora';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { array } from '@amcharts/amcharts4/core';

@Component({
  selector: 'comercial-ciclo-vendas-cotacoes-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss'],
})
export class ComercialCicloVendasCotacoesFormularioComponent
  implements OnInit, OnDestroy, IFormCanDeactivate {
  private user = this.authService.getCurrentUser();
  permissoesAcesso: IPermissoesAcessoModel = {
    acessoClientes: false,
    historicoExclusao: false,
    duplicataCarteira: false,
  };

  @ViewChild('scrollToFormOnTop', {}) scrollToFormOnTop: ElementRef;
  @ViewChild('scrollToFormOnBottom', {}) scrollToFormOnBottom: ElementRef;
  @ViewChild('scrollToCarrinho', {}) scrollToCarrinho: ElementRef;
  @ViewChild("titulo") titulo: ElementRef;

  loaderNavbar = true;
  loaderFullScreen = true;
  autoScrollToCarrinho = true;
  exibirClienteT = false;

  activatedRouteSubscription: Subscription;

  loaderFichaCadastralSubscription: Subscription;
  loaderSimilaridadeSubscription: Subscription;
  loaderCalculoSubscription: Subscription;
  loaderDescontoSubscription: Subscription;
  loaderComboSubscription: Subscription;
  loaderEstoqueDetalhesSubscription: Subscription;
  loaderHistoricoComprasSubscription: Subscription;
  loaderDetalhesClienteSubscription: Subscription;
  loaderDetalhesEnderecoSubscription: Subscription;
  loaderDetalhesContatoSubscription: Subscription;
  loaderDetalhesConcorrenteSubscription: Subscription;
  loaderDuplicatasSubscription: Subscription;
  loaderHistoricoExclusaoSubscription: Subscription;
  loaderFinalizacaoSubscription: Subscription;

  appTitle: string;

  idReservado: number;
  codCotacao: number;

  breadCrumbTree: Array<Breadcrumb> = [];

  bsConfig: Partial<BsDatepickerConfig>;

  dependenciesLoaded = false;

  codClienteSubscription: Subscription;
  isCarteiraClientesLoaded: boolean;

  carrinhoHasError = false;

  form: FormGroup;
  codClientErrors = false;

  situacoes: Array<SituacaoProposta> = [];
  empresas: Array<any> = [];
  depositos: Array<any> = [];
  vendedores: Array<any> = [];
  filteredDepositos: Array<any> = [];
  formasPagamento: Array<FormasPagamento> = [];
  formasContato: Array<FormaContato> = [];
  origensContato: Array<OrigemContato> = [];
  transportadoras: Array<Transportadora> = [];
  formData: Array<FormData> = [];

  carrinho: Array<ICarrinhoModel> = [];
  materiais: Array<ICarrinhoModel> = [];
  valorProposta: number;
  valorIcmsSt: number;

  locaisEntrega: Array<any> = [];
  locaisEntregaLoader: boolean;

  listaPrecios: any[] = [];

  listaEjecutivo: any[] = [];

  idVendedor: number = 0;

  tipoEntrega = [];
  swReferencia : boolean=false;

  clientes: any;
  obsPropostas = [];
  detalhesCodCliente: any = [];
  contatos: Array<any> = [];
  contatosLoader: boolean;
  checked: number;
  formasPagamentoLoader: boolean;

  visualizar = false;
  duplicatasSomenteCarteira = false;
  urlPath: string;

  tableConfigAnexos: Partial<CustomTableConfig> = {
    fixedHeader: false,
    bodyHeight: 230,
    hover: false,
  };
  modalRef: BsModalRef;
  showAnexos: boolean = false;

  tiposNotaMae = [
    {
      cod: 1,
      nome: 'Sim',
    },
    {
      cod: 2,
      nome: 'Não',
    },
  ];

  dadosLancamento: {
    data: string;
    codVendedor: number;
    nomeVendedor: string;
  } = {
    data: null,
    codVendedor: null,
    nomeVendedor: null,
  };

  showBloco1: boolean = true;

  showBloco3: boolean = true;
  showBloco4: boolean = true;
  showBloco5: boolean = true;
  showBloco6: boolean = true;

  idListaPrecio: number ;

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private location: Location,
    private formBuilder: FormBuilder,
    private localeService: BsLocaleService,
    private pnotifyService: PNotifyService,
    private confirmModalService: ConfirmModalService,
    private atividadesService: AtividadesService,
    private titleService: TitleService,
    private dateService: DateService,
    private formularioService: ComercialCicloVendasCotacoesFormularioService,
    private formasPagamentoS: ComercialCadastrosFormasPagamentoService,
    private clientesService: ComercialClientesService,
    private fichaCadastralService: ComercialCicloVendasCotacoesFormularioModalMaterialFichaCadastralService,
    private similaridadeService: ComercialCicloVendasCotacoesFormularioModalMaterialSimilaridadeService,
    private historicoComprasService: ComercialCicloVendasCotacoesFormularioModalHistoricoComprasService,
    private clienteDetalhesService: ComercialCicloVendasCotacoesFormularioModalDetalhesClienteService,
    private enderecoDetalhesService: ComercialCicloVendasCotacoesFormularioModalDetalhesEnderecoService,
    private contatoDetalhesService: ComercialCicloVendasCotacoesFormularioModalDetalhesContatoService,
    private concorrenteDetalhesService: ComercialCicloVendasCotacoesFormularioModalDetalhesConcorrenteService,
    private duplicatasService: ComercialCicloVendasCotacoesFormularioModalDuplicatasService,
    private historicoExclusaoService: ComercialCicloVendasCotacoesFormularioModalHistoricoExclusaoService,
    private finalizacaoService: ComercialCicloVendasCotacoesFormularioModalFinalizacaoService,
    private calculoService: ComercialCicloVendasCotacoesFormularioModalMaterialCalculoService,
    private descontoService: ComercialCicloVendasCotacoesFormularioModalMaterialDescontoService,
    private estoqueService: ComercialCicloVendasCotacoesFormularioModalMaterialEstoqueService,
    private comboService: ComercialCicloVendasCotacoesFormularioModalMaterialComboService,
    private cotacoesService: ComercialCicloVendasCotacoesService,
    private vendedoresService: ComercialVendedoresService,
    private modalService: BsModalService,
    private bsModalRef: BsModalRef,
    private router: Router
  ) {
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

    this.urlPath = this.activatedRoute.snapshot.url[0].path;
    this.onReadOnly();
    this.hasAccessToClient();
    this.changeDirty();
    this.getCarteira(this.urlPath);
    this.getTituloEndereco();
    this.detalhesCodCliente.NM_CLIE = this.activatedRoute.snapshot.queryParams['codCliente'];
    this.getClientes(this.detalhesCodCliente);
    this.getListarPrecios();
    this.getTodosVendedores();
    this.tipoEntrega = [
      { id: 1, nombre: 'entrega en almacen' },
      { id: 2, nombre: 'entrega en obra'}
    ];

  }

  getCarteira(action: string){
    if(action == 'editar') {
      this.cotacoesService
      .getCotacao(this.activatedRoute.snapshot.params.codCotacao, this.activatedRoute.snapshot.params.idEmpresa)
      .subscribe((response: JsonResponse) => {
        this.getClientesParams(response.data.cobrancaSomenteCarteira);
      });
    }
  }
  //Algunos cambios se realizaron
  getTituloEndereco() {
    let urlPath = this.activatedRoute.snapshot.url[0].path;
    if (urlPath == 'editar') {
      this.formularioService
        .getLocaisEntrega(this.form.controls.codCliente.value)
        .pipe(
          switchMap((response: JsonResponse) => {
            return response.data.enderecos;
          })
        )
        .subscribe((enderecos: any[]) => {
          const enderecoSelecionado = enderecos.find(
            (endereco) => endereco.id === this.form.controls.codEndereco.value
          );

          if (enderecoSelecionado) {
            this.form.controls.titulo.setValue(enderecoSelecionado.titulo);
          }

        });
    }
  }

  checkCheckBoxvalue(event){
    if(event.target.checked == true){
      this.form.controls.duplicatasSomenteCarteira.setValue(1);
    } else {
      this.form.controls.duplicatasSomenteCarteira.setValue(0);
    }
  }

  ngOnDestroy(): void {
    this.unsetLoaderEvents();
    this.activatedRouteSubscription.unsubscribe();
    this.codClienteSubscription.unsubscribe();
    this.formularioService.clearCarteiraClientes();
  }

  hasAccessToClient(): void {
    const resolver = this.activatedRoute.snapshot.data.cliente;

    if (resolver.success === true) {
      if (resolver.data.podeAcessar === true) {
        this.registrarAcesso();
        this.setBreadCrumb();
        this.getUserPermissoes();
        this.getFormFields();
        this.setFormBuilder();
        this.setLoaderEvents();
        this.setClienteSubscription();
        this.getVendedor();
      } else {
        this.pnotifyService.error();
        this.location.back();
      }
    } else {
      this.pnotifyService.error();
      this.location.back();
    }
  }

  onReadOnly(){
    if(this.urlPath == 'visualizar'){
      this.visualizar = true;
    }
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  setBreadCrumb(): void {
    const id = this.activatedRoute.snapshot.params.idSubModulo;
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.codCotacao) {
        this.codCotacao = parseInt(params.codCotacao);
        this.appTitle = 'Editar cotação/pedido';
      } else if (params.idReservado) {
        this.idReservado = parseInt(params.idReservado);
        this.appTitle = 'Nueva Cotización/pedido';
      }

      if(this.activatedRoute.snapshot.url[0].path == 'visualizar'){
        this.appTitle = 'visualizar cotação/pedido';
      }

      this.titleService.setTitle(this.appTitle);

      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/comercial/home',
        },
        {
          descricao: 'Ciclo de vendas',
          routerLink: `/comercial/ciclo-vendas/${id}`,
        },
        {
          descricao: 'Cotações e pedidos',
          routerLink: `/comercial/ciclo-vendas/${id}/cotacoes-pedidos/lista`,
        },
        {
          descricao: this.appTitle,
        },
      ];
    });
  }

  getUserPermissoes(): void {
    const resolver = this.activatedRoute.snapshot.data.permissoes;

    if (resolver.success === true) {
      const permissoesAcesso = resolver.data;
      this.permissoesAcesso = permissoesAcesso;
    } else {
      this.pnotifyService.error();
      this.location.back();
    }
  }

  customSearchFn(term: string, item: any) {
      term = term.toUpperCase();
      if(item.descricao.startsWith(term)) {
        return item.descricao.indexOf(term) > -1;
      }
  }

  getFormFields(): void {
    this.formularioService
      .loadDependencies()
      .pipe(
        finalize(() => {
          this.dependenciesLoaded = true;
          if (this.appTitle == 'Nova cotação/pedido') {
            this.setEmpresa();
            this.setTransportadora();
          }
        })
      )
      .subscribe((response: Array<JsonResponse | any>) => {
        this.situacoes = response[0].data || [];

        this.empresas = response[1].result || [];

        this.depositos = response[2].result || [];
        this.filteredDepositos = this.depositos;

        //this.formasPagamento = response[3].data || [];

        this.formasContato = response[4].data || [];

        Object.keys(response[5].data).forEach((key) => {
          response[5].data[key]['descricao'] = response[5].data[key][
            'descricao'
          ].replace(/'/g, '');
        });
        this.origensContato = response[5].data || [];

        this.transportadoras = response[6].data || [];
      });
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      animated: false,
      class: 'modal-xl',
    });
  }
  // ALGUNOS CAMBIOS FUERON REALIZADOS PARA ENVIAR DIRECCION
  onCliente(event) {
    console.log(event.nombreVendedor);

    this.form.patchValue(event);
    this.onChangeCliente(event.codCliente, 'user');
    this.onLoadCliente(true);

    // Llama a la función exibirClienteTerceiro con los datos del cliente seleccionado
    this.exibirClienteTerceiro(event);
    // Carga la dirección del cliente en el campo codEndereco del formulario
    this.form.controls['codEndereco'].setValue(event.direccion);
    this.form.controls['razaoSocial'].setValue(event.razaoSocial);
    this.form.controls['nomeCliente'].setValue(event.nomeCliente);

    //this.form.controls['nombreVendedor'].setValue(event.nombreVendedor);
    this.idListaPrecio = event.id_lista_precio;
    this.idVendedor = event.id_vendedor
    console.log(event)



  }


  getVendedor() {

    this.dadosLancamento.codVendedor = this.user.info.idVendedor;
    this.dadosLancamento.nomeVendedor = this.user.info.nomeCompleto;

    // this.vendedoresService.getVendedores().subscribe((response: any) => {
    //   if (response.responseCode === 200) {
    //     this.vendedores = response.result;
    //     this.vendedores = this.vendedores.filter(
    //       (value: any) => value.id == this.user.info.idVendedor
    //     );
    //     if (this.vendedores.length > 0) {
    //       this.dadosLancamento.codVendedor = this.vendedores[0].id;
    //       this.dadosLancamento.nomeVendedor = this.vendedores[0].nome;
    //     }
    //   }
    // });
  }

  setFormBuilder(): void {
    const resolver = this.activatedRoute.snapshot.data.data;
    if (resolver.success === true) {
      const data = resolver.data;
      const formValue: any = this.checkRouterParams();

      let dataEntrega: Date,
        dataEncerramento: Date,
        dataValidade: Date,
        codEmpresa: number,
        codDeposito: number,
        codFormaContato: number,
        codOrigemContato: number;

      if (data.codEmpresa === null) {
        codEmpresa = formValue.codEmpresa;
      } else {
        codEmpresa = data.codEmpresa;
      }

      if (data.codDeposito === null) {
        codDeposito = formValue.codDeposito;
      } else {
        codDeposito = data.codDeposito;
      }

      if (data.dataEntrega !== null) {
        dataEntrega = this.dateService.convertStringToDate(
          data.dataEntrega,
          'usa'
        );
      } else {
        dataEntrega = data.dataEntrega;
      }

      if (data.dataEncerramento !== null) {
        dataEncerramento = this.dateService.convertStringToDate(
          data.dataEncerramento,
          'pt-br'
        );
      } else {
        dataEncerramento = data.dataEncerramento;
      }

      if (data.dataValidade === null) {
        dataValidade = this.dateService.addDaysToDate(new Date(), 10);
      } else {
        dataValidade = this.dateService.convertStringToDate(
          data.dataValidade,
          'usa'
        );
      }

      if (data.codFormaContato === null || data.codFormaContato === 0) {
        codFormaContato = formValue.codFormaContato;
      } else {
        codFormaContato = data.codFormaContato;
      }

      if (data.codOrigemContato === null || data.codOrigemContato === 0) {
        codOrigemContato = formValue.codOrigemContato;
      } else {
        codOrigemContato = data.codOrigemContato;
      }

      const codCotacao =
        typeof this.codCotacao == 'undefined'
          ? this.idReservado
          : this.codCotacao;

          if (this.duplicatasSomenteCarteira == true) {
            data.duplicatasSomenteCarteira = 1;
          } else {
            data.duplicatasSomenteCarteira = 0;
          }



      this.form = this.formBuilder.group({
        codCotacao: [{ value: codCotacao, disabled: true }],
        tipoCotacao: [{ value: data.tipoCotacao, disabled: true }],
        notaFiscal: [{ value: data.nrNotaFical, disabled: true }],
        codSituacao: [
          data.codSituacao != 0 ? data.codSituacao : null,
          [Validators.required],
        ],
        codCliente: [data.codCliente],
        razaoSocial: [data.razaoSocial],
        codRazaoSocial: [data.codRazaoSocial],
        nombreVendedor: [data.nombreVendedor],
        id_lista_precio: [data.id_lista_precio],


        codContato: [
          data.codContato != 0 ? data.codContato : null,
          [Validators.required],
        ],
        codEndereco: [
          data.codEnderecoEntrega != 0 ? data.codEnderecoEntrega : null,
          [Validators.required],
        ],
        titulo: [data.titulo],
        codEmpresa: [codEmpresa],
        codDeposito: [codDeposito],
        notaFiscalMae: [
          data.notaFiscalMae != 0 ? data.notaFiscalMae : null,
          [Validators.required],
        ],
        codFormaPagamento: [
          data.codFormaPagamento != 0 ? data.codFormaPagamento : null,
          [Validators.required],
        ],
        // alterado de duplicatasSomenteCarteira para duplicataSomenteCarteira aqui...
        duplicatasSomenteCarteira: [
         data.duplicatasSomenteCarteira,
        ],
        dataEntrega: [dataEntrega, [Validators.required]],
        dataEncerramento: [{ value: dataEncerramento, disabled: true }],
        dataValidade: [dataValidade, [Validators.required]],
        codFormaContato: [codFormaContato, [Validators.required]],
        codOrigemContato: [codOrigemContato, [Validators.required]],
        dadosAdicionais: [
          data.dadosAdicionaisNotaFiscal,
          [Validators.required],
        ],
        freteConta: [
          data.codFretePorConta != 0 ? data.codFretePorConta : null,
          [Validators.required],
        ],
        codTransportadora: [data.codTransportadora, [Validators.required]],
        observacoes: [data.observacao],
        anexos: this.formBuilder.array([]),
        novo: this.activatedRoute.snapshot.url[0].path,
        COD_CLIE_TERC: [data.COD_CLIE_TERC],
        TP_ACAO: [data.TP_ACAO],
      });
      if(data.codEnderecoEntrega){
        this.exibirClienteTerceiro(data.notaFiscalMae);

      }

      this.dadosLancamento.data = data.dataLancamento;
      // this.dadosLancamento.codVendedor = data.codVendedor;
      // this.dadosLancamento.nomeVendedor = data.nomeVendedor;

      this.checkPermissoesAcesso();
      /* this.checkSituacaoCotacao(data.codSituacao); */
      this.checkClienteCotacao(data.codCliente);
      /* this.checkMateriaisCarrinho(data.carrinho); */

      if (this.form.value.codSituacao == null) {
        this.form.controls.codSituacao.setValue(1);
        this.form.controls.codSituacao.updateValueAndValidity();
      }

      this.form.controls.codEmpresa.disable();
      this.form.controls.codDeposito.disable();

      if (codCotacao != null) {
        this.getAnexos(codCotacao);
      }

      this.carrinho = data.carrinho;
    } else {
      this.pnotifyService.error();
      this.location.back();
    }
  }

  setFreteConta(event) {
    if (!event.codFreteConta) {
      return;
    }
    this.form.get('freteConta').setValue(event.codFreteConta);
  }

  getAnexos(codCotacao: number) {
    this.loaderNavbar = true;
    this.showAnexos = false;
    this.formularioService
      .getAnexos(codCotacao)
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
  }

  onPostAnexos(codCotacao: number): void {
    if (this.formData.length === 0) {
      /* this.pnotifyService.notice('Erro'); */
      return;
    }

    /* const id = this.form.value.codMaterial; */

    this.formData.forEach((element, index) => {
      this.formularioService.postAnexos(element, codCotacao).subscribe();
    });
  }

  onDeleteAnexo(codAnexo: number, index: number): void {
    this.confirmDelete().subscribe((r: boolean) => {
      if (codAnexo) {
        this.loaderNavbar = true;
        this.formularioService
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

  checkRouterParams(): Object {
    let formValue = {
      codEmpresa: null,
      codDeposito: null,
      codFormaContato: null,
      codOrigemContato: null,
    };

    this.activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (queryParams: any) => {
        if (Object.keys(queryParams).length > 0) {
          if (queryParams.f) {
            let params = atob(queryParams.f);
            params = JSON.parse(params);

            Object.keys(formValue).forEach((formKey) => {
              Object.keys(params).forEach((paramKey) => {
                if (
                  formKey == paramKey &&
                  formValue[formKey] != params[paramKey]
                ) {
                  if (!isNaN(Number(params[paramKey]))) {
                    formValue[formKey] = Number(params[paramKey]);
                  } else {
                    formValue[formKey] = params[paramKey];
                  }
                }
              });
            });
          }
        }
      }
    );
    this.activatedRouteSubscription.unsubscribe();

    return formValue;
  }

  checkPermissoesAcesso(): void {
    if (this.permissoesAcesso.duplicataCarteira === true) {
      this.form.controls.duplicatasSomenteCarteira.enable();
    }
  }

  checkSituacaoCotacao(codSituacao: number): void {
    if (codSituacao !== 2) {
      this.form.controls.dataEntrega.disable();
    }
  }

  checkClienteCotacao(codCliente: number): void {
    if (codCliente !== null) {
      this.onChangeCliente(codCliente, 'application');
    }
  }

  checkMateriaisCarrinho(carrinho: Array<ICarrinhoModel>): void {
    if (carrinho.length > 0) {
      this.formularioService.materiaisSubject.next(carrinho);
    }
  }

  setLoaderEvents(): void {
    this.loaderFichaCadastralSubscription = this.fichaCadastralService.loaderNavbar.subscribe(
      (response: boolean) => {
        this.loaderNavbar = response;
      }
    );

    this.loaderSimilaridadeSubscription = this.similaridadeService.loaderNavbar.subscribe(
      (response: boolean) => {
        this.loaderNavbar = response;
      }
    );

    this.loaderCalculoSubscription = this.calculoService.loaderNavbar.subscribe(
      (response: boolean) => {
        this.loaderNavbar = response;
      }
    );

    this.loaderDescontoSubscription = this.descontoService.loaderNavbar.subscribe(
      (response: boolean) => {
        this.loaderNavbar = response;
      }
    );

    this.loaderComboSubscription = this.comboService.loaderNavbar.subscribe(
      (response: boolean) => {
        this.loaderNavbar = response;
      }
    );

    this.loaderEstoqueDetalhesSubscription = this.estoqueService.loaderNavbar.subscribe(
      (response: boolean) => {
        this.loaderNavbar = response;
      }
    );

    this.loaderHistoricoComprasSubscription = this.historicoComprasService.loaderNavbar.subscribe(
      (response: boolean) => {
        this.loaderNavbar = response;
      }
    );

    this.loaderDetalhesClienteSubscription = this.clienteDetalhesService.loaderNavbar.subscribe(
      (response: boolean) => {
        this.loaderNavbar = response;
      }
    );

    this.loaderDetalhesEnderecoSubscription = this.enderecoDetalhesService.loaderNavbar.subscribe(
      (response: boolean) => {
        this.loaderNavbar = response;
      }
    );

    this.loaderDetalhesContatoSubscription = this.contatoDetalhesService.loaderNavbar.subscribe(
      (response: boolean) => {
        this.loaderNavbar = response;
      }
    );

    this.loaderDetalhesConcorrenteSubscription = this.concorrenteDetalhesService.loaderNavbar.subscribe(
      (response: boolean) => {
        this.loaderNavbar = response;
      }
    );

    this.loaderDuplicatasSubscription = this.duplicatasService.loaderNavbar.subscribe(
      (response: boolean) => {
        this.loaderNavbar = response;
      }
    );

    this.loaderHistoricoExclusaoSubscription = this.historicoExclusaoService.loaderNavbar.subscribe(
      (response: boolean) => {
        this.loaderNavbar = response;
      }
    );

    this.loaderFinalizacaoSubscription = this.finalizacaoService.loaderNavbar.subscribe(
      (response: boolean) => {
        this.loaderNavbar = response;
      }
    );
  }

  unsetLoaderEvents(): void {
    this.loaderFichaCadastralSubscription.unsubscribe();
    this.loaderSimilaridadeSubscription.unsubscribe();
    this.loaderCalculoSubscription.unsubscribe();
    this.loaderDescontoSubscription.unsubscribe();
    this.loaderComboSubscription.unsubscribe();
    this.loaderEstoqueDetalhesSubscription.unsubscribe();
    this.loaderHistoricoComprasSubscription.unsubscribe();
    this.loaderDetalhesClienteSubscription.unsubscribe();
    this.loaderDetalhesEnderecoSubscription.unsubscribe();
    this.loaderDetalhesContatoSubscription.unsubscribe();
    this.loaderDetalhesConcorrenteSubscription.unsubscribe();
    this.loaderDuplicatasSubscription.unsubscribe();
    this.loaderHistoricoExclusaoSubscription.unsubscribe();
    this.loaderFinalizacaoSubscription.unsubscribe();
  }

  onLoaderNavbar(event: boolean): void {
    this.loaderNavbar = event;
  }

  onLoaderFullScreen(event: boolean): void {
    this.loaderFullScreen = event;
  }

  setEmpresa() {
    this.form.controls.codEmpresa.setValue(
      parseInt(this.activatedRoute.snapshot.params.codEmpresa)
    );
    this.form.controls.codEmpresa.updateValueAndValidity();
    this.setDeposito();
    this.form.controls.codEmpresa.disable();
  }

  setDeposito(): void {
    this.filteredDepositos = this.depositos.filter(
      (value: any) => value.idEmpresa == this.form.getRawValue().codEmpresa
    );

    if(this.filteredDepositos.length === 0) {
      this.form.controls.codDeposito.disable();
      this.pnotifyService.notice(
        'Empresa não possui depósito válido vinculado.'
      );
      return;
    }

    if (this.filteredDepositos.length === 1) {
      this.form.controls.codDeposito.setValue(
        this.filteredDepositos[0]['idDeposito']
      );
      this.form.controls.codDeposito.disable();
      this.form.controls.codDeposito.clearValidators();
      this.form.controls.codDeposito.updateValueAndValidity();
    } else {
      this.form.controls.codDeposito.enable();
      this.form.controls.codDeposito.setValidators([Validators.required]);
      this.form.controls.codDeposito.updateValueAndValidity();
    }
  }

  onChangeValidadeProposta(value: Date): boolean {
    let isValid = true;
    const maxDate = this.dateService.addDaysToDate(new Date(), 16);

    if (value > maxDate) {
      setTimeout(() => {
        isValid = false;
        this.form.controls.dataValidade.markAsTouched();
        this.form.controls.dataValidade.setErrors({ maxDate: true });
        this.pnotifyService.notice(
          'Data de validade não deve ser superior a 15 dias.'
        );
      }, 250);
    }

    return isValid;
  }

  onScrollToCarrinho(event: boolean): void {
    this.autoScrollToCarrinho = event;
// if (this.autoScrollToCarrinho === true) {
      setTimeout(() => {
        this.scrollToCarrinho.nativeElement.scrollIntoView({
          behavior: 'instant',
        });
      }, 500);
   // }
  }

  onMateriaisScrollTop(event: boolean): void {
    if (event === true) {
      this.onScrollToForm('top');

     // if (this.form.getRawValue().codEmpresa === null) {
        this.form.controls.codEmpresa.markAsTouched();
        this.form.controls.codEmpresa.markAsDirty();
        this.form.controls.codEmpresa.setErrors({ required: true });
        //this.pnotifyService.notice('Selecione uma empresa.');
     // }

      //if (this.form.getRawValue().codDeposito === null) {
        this.form.controls.codDeposito.markAsTouched();
        this.form.controls.codDeposito.markAsDirty();
        this.form.controls.codDeposito.setErrors({ required: true });
        //this.pnotifyService.notice('Selecione um depósito.');
     // }

     // if (this.form.value.codEndereco === null) {
        this.form.controls.codEndereco.markAsTouched();
        this.form.controls.codEndereco.markAsDirty();
        this.form.controls.codEndereco.setErrors({ required: true });
        //this.pnotifyService.notice('Selecione um endereço de entrega.');
      //}
   }
  }

  onHistoricoComprasFieldError(event: boolean): void {
    if (event === true) {
      this.onScrollToForm('top');

     // if (this.form.value.codEndereco === null) {
        this.form.controls.codEndereco.markAsTouched();
        this.form.controls.codEndereco.markAsDirty();
        this.form.controls.codEndereco.setErrors({ required: true });
        //this.pnotifyService.notice('Selecione um endereço de entrega.');
    //  }

    //    if (this.form.controls.codFormaPagamento.errors !== null) {
        this.onScrollToForm('top');
        this.form.controls.codFormaPagamento.markAsTouched();
        this.form.controls.codFormaPagamento.setErrors({ incorrect: true });
        //this.pnotifyService.notice('Selecione a forma de pagamento.');
 //     }

   //   if (this.form.controls.freteConta.errors !== null) {
        this.onScrollToForm('bottom');
        this.form.controls.freteConta.markAsTouched();
        this.form.controls.freteConta.setErrors({ incorrect: true });
        //this.pnotifyService.notice('Selecione quem pagará o frete.');
  //    }

    }
  }

  onCarrinho(carrinho: any): void {
    this.materiais = carrinho.materiais;
    this.valorProposta = carrinho.total.valorProposta;
    this.valorIcmsSt = carrinho.total.valorIcmsSt;
  }

  onCarrinhoError(event: boolean): void {
    this.carrinhoHasError = event;
  }

  onCarrinhoScrollTop(event: boolean): void {
    //if (event === true) {
      this.onScrollToForm('top');
      this.codClientErrors = true;
      this.form.controls.codCliente.markAsTouched();
      this.form.controls.codCliente.setErrors({ required: true });
     // this.pnotifyService.notice('Selecione um cliente.');
    //}
  }

  onSubmit(): void {
    this.formularioService.onNotifySubmit(true);
    this.sendForm();
  }


  sendForm(): void {
    if (this.checkFormErrors() === false) {
      let hasPrecoMinimo = false;

      for (let i = 0; i < this.materiais.length; i++) {
        if (
          Math.floor(this.materiais[i].valorUnit * 100) / 100 >
          this.materiais[i].valor
        ) {
          hasPrecoMinimo = true;
        }
      }

      if (hasPrecoMinimo === true) {
        this.confirmModalService
          .showConfirm(
            null,
            'Preço abaixo do mínimo',
            'Existem materiais com preço abaixo do mínimo. Deseja continuar mesmo assim?',
            'Cancelar',
            'Confirmar'
          )
          .subscribe((response: boolean) =>
            response ? this.sendCotacao() : EMPTY
          );
      } else {
        this.sendCotacao();
      }
    }
  }

  sendCotacao(): void {
    this.confirmModalService
      .showConfirm(
        null,
        'Confirmar Cotação',
        'Deseja realmente prosseguir com a finalização da cotação?',
        'Cancelar',
        'Confirmar'
      )
      .subscribe((response: boolean) => {
        if (response) {
          const formValue = this.form.getRawValue();
          const carteiraClientes = this.formularioService.getCurrentCarteiraClientes();

          let situacao = {
            codSituacaoProposta: null,
            situacaoProposta: null,
            codTipoFinalizacao: null,
          };

          let cliente = {
            codCliente: null,
            razaoSocial: null,
          };

          for (let i = 0; i < this.situacoes.length; i++) {
            if (
              Number(formValue.codSituacao) ===
              this.situacoes[i].codParametroSituacaoProposta
            ) {
              situacao.codSituacaoProposta = this.situacoes[
                i
              ].codSituacaoProposta;
              situacao.situacaoProposta = this.situacoes[i].situacaoProposta;
              situacao.codTipoFinalizacao = this.situacoes[
                i
              ].codTipoFinalizacao;
            }
          }

          for (let i = 0; i < carteiraClientes.length; i++) {
            if (formValue.codCliente === carteiraClientes[i].codCliente) {
              cliente = {
                codCliente: carteiraClientes[i].codCliente,
                razaoSocial: carteiraClientes[i].razaoSocial,
              };
            }
          }

          const dataCotacao = {
            codCotacao: formValue.codCotacao,
            tipoCotacao: formValue.tipoCotacao,
            codSituacao: Number(formValue.codSituacao),
            situacao: situacao,
            codCliente: formValue.codCliente,
            razaoSocial: formValue.razaoSocial,
            codEndereco: formValue.codEndereco,
            codContato: formValue.codContato,
            codEmpresa: formValue.codEmpresa,
            codDeposito: formValue.codDeposito,
            notaFiscalMae: Number(formValue.notaFiscalMae),
            codFormaPagamento: formValue.codFormaPagamento,
            duplicatasSomenteCarteira: formValue.duplicatasSomenteCarteira,
            dataEntrega: formValue.dataEntrega,
            dataEncerramento: formValue.dataEncerramento,
            dataValidade: formValue.dataValidade,
            codFormaContato: formValue.codFormaContato,
            codOrigemContato: formValue.codOrigemContato,
            dadosAdicionais: formValue.dadosAdicionais,
            freteConta: formValue.freteConta,
            codTransportadora: formValue.codTransportadora,
            observacoes: formValue.observacoes,
            carrinho: this.materiais,
            idSubModulo: this.activatedRoute.snapshot.params.idSubModulo,
            valorProposta: this.valorProposta,
            valorIcmsSt: this.valorIcmsSt,
            profile:this.activatedRoute.snapshot.data.profile.result
          };

          this.finalizacaoService.sendCotacao(dataCotacao);

          this.onPostAnexos(dataCotacao.codCotacao);

        }
      });
  }

  changeDirty() {
    this.finalizacaoService.makeFormAsDirty().subscribe(() => {
      this.form.markAsDirty({ onlySelf: true });
      this.form.markAsPristine({ onlySelf: false });
    });
  }

  checkFormErrors(): boolean {
    let hasError = false;

    if (this.carrinhoHasError === true) {
      this.scrollToCarrinho.nativeElement.scrollIntoView({
        behavior: 'instant',
      });
      hasError = true;
    } else {
      //if (this.form.controls.tipoCotacao.errors !== null) {
        this.onScrollToForm('top');
        this.form.controls.tipoCotacao.markAsTouched();
        this.form.controls.tipoCotacao.setErrors({ incorrect: true });
       // this.pnotifyService.notice('Selecione o tipo de cotação.');
        hasError = true;
     // }

     // if (this.form.controls.codSituacao.errors !== null) {
        this.onScrollToForm('top');
        this.form.controls.codSituacao.markAsTouched();
        this.form.controls.codSituacao.setErrors({ incorrect: true });
      //  this.pnotifyService.notice('Selecione a situação.');
        hasError = true;
    //  }

      //if (this.form.controls.codCliente.errors !== null) {
        this.onScrollToForm('top');
        this.codClientErrors = true;
        this.form.controls.codCliente.markAsTouched();
        this.form.controls.codCliente.setErrors({ incorrect: true });
      //  this.pnotifyService.notice('Selecione um cliente.');
        hasError = true;
     // }

     // if (this.form.controls.codContato.errors !== null) {
        this.onScrollToForm('top');
        this.form.controls.codContato.markAsTouched();
        this.form.controls.codContato.setErrors({
          incorrect: true,
        });
       // this.pnotifyService.notice('Selecione o contato responsável.');
        hasError = true;
     // }

     // if (this.form.controls.codEndereco.errors !== null) {
        this.onScrollToForm('top');
        this.form.controls.codEndereco.markAsTouched();
        this.form.controls.codEndereco.setErrors({ incorrect: true });
       // this.pnotifyService.notice('Selecione o local de entrega.');
        hasError = true;
     // }

    //  if (this.form.controls.notaFiscalMae.errors !== null) {
        this.onScrollToForm('top');
        this.form.controls.notaFiscalMae.markAsTouched();
        this.form.controls.notaFiscalMae.setErrors({ incorrect: true });
       // this.pnotifyService.notice('Selecione se existe Nota Fiscal Mãe.');
        hasError = true;
    //  }

      //if (this.form.controls.codFormaPagamento.errors !== null) {
        this.onScrollToForm('top');
        this.form.controls.codFormaPagamento.markAsTouched();
        this.form.controls.codFormaPagamento.setErrors({ incorrect: true });
       // this.pnotifyService.notice('Selecione a forma de pagamento.');
        hasError = true;
      //}

      if (this.form.controls.dataEntrega.errors !== null) {
        this.onScrollToForm('top');
        this.form.controls.dataEntrega.markAsTouched();
        this.form.controls.dataEntrega.setErrors({ incorrect: true });
        this.pnotifyService.notice('Informe a data de entrega.');
        hasError = true;
      }

      if (this.form.controls.dataValidade.errors !== null) {
        this.onScrollToForm('top');
        this.form.controls.dataValidade.markAsTouched();
        const maxDate = this.dateService.addDaysToDate(new Date(), 16);

        if (this.form.value.dataValidade > maxDate) {
          this.form.controls.dataValidade.setErrors({ maxDate: true });
          this.pnotifyService.notice(
            'Data de validade não deve ser superior a 15 dias.'
          );
        } else {
          this.form.controls.dataValidade.setErrors({ incorrect: true });
          this.pnotifyService.notice('Informe a data de validade.');
        }

        hasError = true;
      }

      //if (this.form.controls.codFormaContato.errors !== null) {
        this.onScrollToForm('bottom');
        this.form.controls.codFormaContato.markAsTouched();
        this.form.controls.codFormaContato.setErrors({ incorrect: true });
       // this.pnotifyService.notice('Selecione a forma de contato.');
        hasError = true;
      //}

     // if (this.form.controls.codOrigemContato.errors !== null) {
        this.onScrollToForm('bottom');
        this.form.controls.codOrigemContato.markAsTouched();
        this.form.controls.codOrigemContato.setErrors({ incorrect: true });
       // this.pnotifyService.notice('Selecione a origem de contato.');
        hasError = true;
     // }

      //if (this.form.controls.freteConta.errors !== null) {
        this.onScrollToForm('bottom');
        this.form.controls.freteConta.markAsTouched();
        this.form.controls.freteConta.setErrors({ incorrect: true });
      //  this.pnotifyService.notice('Selecione quem pagará o frete.');
        hasError = true;
      //}

      //if (this.form.controls.codTransportadora.errors !== null) {
        this.onScrollToForm('bottom');
        this.form.controls.codTransportadora.markAsTouched();
        this.form.controls.codTransportadora.setErrors({ incorrect: true });
      //  this.pnotifyService.notice('Selecione a transportadora.');
        hasError = true;
      //}

      for(let i = 0; i<this.materiais.length; i++){
        if(this.materiais[i].qtdePecas == null){
          this.pnotifyService.notice(`Recalcule a quantidade do material ${this.materiais[i].codMaterial} - ${this.materiais[i].nomeMaterial} no carrinho`);
          hasError = true;
        }
      }
    }

    return hasError;
  }

  onScrollToForm(position: string): void {
    if (position === 'top') {
      this.scrollToFormOnTop.nativeElement.scrollIntoView({
        behavior: 'instant',
      });
    } else if (position === 'bottom') {
      this.scrollToFormOnBottom.nativeElement.scrollIntoView({
        behavior: 'instant',
      });
    }
  }

  /**
   * @source = 'application' || 'user'
   */
  onChangeCliente(codCliente: number, source: string): void {
    this.form.controls.codCliente.setValue(codCliente);
    this.codClientErrors = false;

    if (codCliente === null) {
      this.form.controls.codContato.setValue(null);
      this.form.controls.codEndereco.setValue(null);
      this.contatos = [];
      this.locaisEntrega = [];
    } else {
      this.getContatos(codCliente, source);
      this.getLocaisEntrega(codCliente, source);
      this.getDadosRelacionamento(codCliente);
      this.getFormasPagamento(codCliente);

    }
  }

  onChangeEndereco(event: any) {
    this.form.controls.titulo.setValue(event.titulo);
    this.form.controls.TP_ACAO.setValue(event.TP_ACAO);
    this.getCliente(event.COD_CLIE_TERC);
    console.log(event)
    if(event.id == 2){
      this.swReferencia =true
    }else(
      this.swReferencia =false
    )
  }

  getLocaisEntrega(codCliente: number, source: string): void {
    if (source != 'application') {
      this.form.controls.codEndereco.markAsUntouched();
      this.form.controls.codEndereco.setValue(null);
      this.form.controls.codEndereco.disable();
    }

    this.locaisEntrega = [];
    this.locaisEntregaLoader = true;

    this.formularioService
      .getLocaisEntrega(codCliente)
      .pipe(
        finalize(() => {
          this.locaisEntregaLoader = false;
          this.form.controls.codEndereco.enable();
        })
      )
      .subscribe((response: JsonResponse) => {
        if (response.success === true) {
          const _enderecos = response.data.enderecos;
          const _enderecosAguardando = response.data.enderecosAguardando || [];

          let enderecos = [],
            enderecosAguardando = [];

          for (let i = 0; i < _enderecos.length; i++) {
            enderecos.push({
              codEndereco: _enderecos[i].id,
              descricao: this.formatLocalEntrega(_enderecos[i]),
              titulo: _enderecos[i].titulo,
              tipo: 'Aprovados',
              COD_CLIE_TERC: _enderecos[i].COD_CLIE_TERC,
              TP_ACAO: _enderecos[i].TP_ACAO,
            });
          }

          for (let i = 0; i < _enderecosAguardando.length; i++) {
            enderecosAguardando.push({
              codEndereco: _enderecosAguardando[i].id,
              descricao: this.formatLocalEntrega(_enderecosAguardando[i]),
              titulo: _enderecos[i].titulo,
              tipo: 'Aguardando aprovação',
              COD_CLIE_TERC: _enderecosAguardando[i].COD_CLIE_TERC,
              TP_ACAO: _enderecosAguardando[i].TP_ACAO,
            });
          }

          this.locaisEntrega = [...enderecos, ...enderecosAguardando];
          console.log(this.locaisEntrega);
          console.log(_enderecos);
          this.setClientTerceiro(this.form.controls.codEndereco.value);
        }
      });
  }

  getContatos(codCliente: number, source: string): void {
    if (source != 'application') {
      this.form.controls.codContato.markAsUntouched();
      this.form.controls.codContato.setValue(null);
      this.form.controls.codContato.disable();
    }

    this.contatos = [];
    this.contatosLoader = true;

    this.clientesService
      .getContatos(codCliente)
      .pipe(
        finalize(() => {
          this.contatosLoader = false;
          this.form.controls.codContato.enable();
        })
      )
      .subscribe((response: JsonResponse) => {
        if (response.success === true) {
          const _contatos = response.data;
          let contatos = [];

          for (let i = 0; i < _contatos.length; i++) {
            if (
              _contatos[i].nomeCompleto &&
              _contatos[i].nomeCompleto != null &&
              _contatos[i].nomeCompleto != '' &&
              _contatos[i].nomeCompleto.length > 1
            )
              contatos.push({
                codContato: _contatos[i].id,
                nomeContato: _contatos[i].nomeCompleto,
              });
          }
          this.contatos = contatos;
        }
      });
  }

  onLoadCliente(event: boolean): void {
    this.isCarteiraClientesLoaded = event;
  }

  onClienteDetalhes(): void {
    this.clienteDetalhesService.showModal(this.form.value.codCliente);
  }

  onFecharModal(event) {
    this.modalRef.hide();
  }

  getClientesParams(event){

    if(event == 1){
      this.duplicatasSomenteCarteira = true;
      this.form.controls.duplicatasSomenteCarteira.setValue(1);
    } else{
      this.duplicatasSomenteCarteira = false;
      this.form.controls.duplicatasSomenteCarteira.setValue(0);
    }
  }

  onHistoricoCompras(): void {
    const params = this.form.value;
    if (
      this.form.value.codEmpresa !== null &&
      this.form.value.codEndereco !== null
    ) {
      this.historicoComprasService.showModal(
        this.setParamsHistoricoCompras(params)
      );
    } else {
      this.onHistoricoComprasFieldError(true);
    }
  }

  setParamsHistoricoCompras(params): Object {
    let _params: any = {};

    _params.codCliente = params.codCliente;
    _params.codEmpresa = this.form.getRawValue().codEmpresa;
    _params.codEndereco = params.codEndereco;
    _params.codFormaPagamento = params.codFormaPagamento;
    _params.freteConta = params.freteConta;

    return _params;
  }

  navegarHistoricoFinanceiro() {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
    })
    .then(result => {  window.open(`/#/comercial/clientes/historico-financeiro/${this.form.value.codCliente}/resumo`, '_blank')});
  }

  setClienteSubscription(): void {
    this.formularioService.getCarteiraClientes();

    this.codClienteSubscription = this.formularioService.codCliente.subscribe(
      (codCliente: number) => {
        this.form.controls.codCliente.setValue(codCliente);
        this.onChangeCliente(codCliente, 'user');
      }
    );
  }

  onDetalhesLocalEntrega(): void {
    if (this.form.value.codEndereco != null) {
      this.enderecoDetalhesService.showModal(
        this.form.value.codCliente,
        this.form.value.codEndereco
      );
    }
  }

  onDetalhesContato(): void {
      this.contatoDetalhesService.showModal(
        this.form.value.codCliente,
        this.form.value.codContato
      );
  }

  onReloadLocalEntrega(): void {
    if (this.locaisEntregaLoader === false) {
      this.getLocaisEntrega(this.form.value.codCliente, 'user');
    }
  }

  onReloadContatos(): void {
    if (this.contatosLoader === false) {
      this.getContatos(this.form.value.codCliente, 'user');
    }
  }

  getLinkAddLocalEntrega(): string {
    return `/comercial/clientes/cadastro/${this.form.value.codCliente}/enderecos/novo`;
  }

  getLinkAddContato(): string {
    return `/comercial/clientes/cadastro/${this.form.value.codCliente}/contatos/novo`;
  }

  formatLocalEntrega(localEntrega: any): string {
    return `${localEntrega.endereco} - ${localEntrega.bairro}, ${localEntrega.cidade} - ${localEntrega.uf} - ${localEntrega.cep}`;
  }

  onHistoricoExclusao(): void {
    const params = this.form.value;

    if (this.appTitle == 'Editar cotação/pedido' || this.appTitle == 'visualizar cotação/pedido') {
      this.historicoExclusaoService.showModal(
        this.setParamsHistoricoExclusao(params)
      );
    } else if (this.appTitle == 'Nova cotação/pedido') {
      this.pnotifyService.notice('Cotação nova, não possui histórico');
    }
  }

  setParamsHistoricoExclusao(params): Object {
    let _params: any = {};

    _params.nrPedido = this.codCotacao;
    _params.codEmpresa = this.form.getRawValue().codEmpresa;

    return _params;
  }

  onVisualizarDuplicatas(): void {
    if (this.materiais.length === 0) {
      this.pnotifyService.notice(
        'Adicione materiais ao carrinho para continuar.'
      );
      return;
    } else {
      if (this.valorProposta === 0) {
        this.pnotifyService.notice(
          'Realize o cálculo de quantidades para continuar.'
        );

        this.scrollToCarrinho.nativeElement.scrollIntoView({
          behavior: 'instant',
        });

        return;
      }
    }


    //if (this.form.getRawValue().codEmpresa === null) {
      this.pnotifyService.notice('Selecione uma empresa.');
      return;
    //}

   // if (this.form.value.codFormaPagamento === null) {
      this.pnotifyService.notice('Selecione uma forma de pagamento.');
      return;
   // }

    for (let i = 0; i < this.formasPagamento.length; i++) {
      if (
        this.form.getRawValue().codFormaPagamento ===
        this.formasPagamento[i].codFormaPagamento && !this.visualizar
      ) {
        this.duplicatasService.geraDuplicatas(
          this.form.getRawValue().codCotacao,
          this.form.getRawValue().codEmpresa,
          this.form.value.codFormaPagamento,
          this.formasPagamento[i].editavel === 1 ? true : false,
          this.valorProposta,
          this.valorIcmsSt
        );
      } else if (
        this.form.getRawValue().codFormaPagamento ===
        this.formasPagamento[i].codFormaPagamento && this.visualizar
      ){
        this.duplicatasService.geraDuplicatas(
          this.form.getRawValue().codCotacao,
          this.form.getRawValue().codEmpresa,
          this.form.value.codFormaPagamento,
          this.formasPagamento[i].editavel === 1 ? false : false,
          this.valorProposta,
          this.valorIcmsSt
        );
      }
    }
  }

  onFieldError(field: string): string {
    if (this.onFieldInvalid(field) != '') {
      return 'is-invalid';
    }

    return '';
  }

  onFieldInvalid(field: any): string {
    field = this.form.get(field);
    if (field.errors != null) {
      if (field.errors.hasOwnProperty('required') && field.touched) {
        return 'required';
      }

      if (field.errors.hasOwnProperty('maxDate') && field.touched) {
        return 'maxDate';
      }
    }

    return '';
  }

  onFieldRequired(
    abstractControl: AbstractControl,
    abstractControlField?: string
  ): string {
    if (abstractControl.validator) {
      const validator = abstractControl.validator({} as AbstractControl);
      if (validator && validator.required) {
        return 'is-required';
      }
    }

    if (abstractControlField) {
      for (const controlName in abstractControl['controls']) {
        if (abstractControl['controls'][controlName]) {
          if (
            this.onFieldRequired(abstractControl['controls'][controlName]) &&
            controlName == abstractControlField
          ) {
            return 'is-required';
          }
        }
      }
    }

    return '';
  }

  hasUnsavedData() {
    return this.form.dirty;
  }

  @HostListener('window:beforeunload', ['$event'])
  handleBeforeUnload($event: any) {
    if (this.hasUnsavedData()) {
      $event.returnValue = true;
    }
  }

  onCancel(): void {
    let idSubModulo = this.activatedRoute.snapshot.params.idSubModulo;
    this.formularioService.limparCarrinhoSubject.next(true);

    this.router.navigate([
      `/comercial/ciclo-vendas/${idSubModulo}/cotacoes-pedidos/lista`,
    ]);
  }

  formCanDeactivate(): boolean {
    if (this.hasUnsavedData()) {
      if (confirm('Este cliente no forma parte de tu cartera?')) {
        return true;
      } else {
        return false;
      }
    }
    return true;
  }

  onShowBloco(bloco: number){
    if(bloco == 1){
      this.showBloco1 = !this.showBloco1;
    } else if(bloco == 4){
      this.showBloco4 = !this.showBloco4;
    } else if(bloco == 5){
      this.showBloco5 = !this.showBloco5;
    } else if(bloco == 6){
      this.showBloco6 = !this.showBloco6;
    }

  }

  getDadosRelacionamento(codCliente: number): void {
    this.clientesService
      .getDadosRelacionamento(codCliente)
      .subscribe({next: response => {
          this.obsPropostas[0] = response;
          if(this.urlPath != 'editar'){
            this.form.controls.observacoes.setValue(this.obsPropostas[0].result.obsPropostas);
          }
      }
      });
  }

  getClientes(codCliente){
    this.vendedoresService
      .getCarteiraClientes(codCliente)
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.success === true) {
              this.clientes = response.data
              if(this.clientes[0].nomeSituacao == 'Arquivo'){
                  this.pnotifyService.notice('Cliente arquivado, favor entrar em contato com o Marketing');
                }
              else{
                this.form.controls.codRazaoSocial.setValue(this.clientes[0].codRazaoSocial);
                this.onChangeCliente(this.clientes[0].codCliente, 'user');
              }
        }
        },
        error: (error: any) => {
          this.pnotifyService.error();
        }
      });
  }

  setTransportadora(){
    let frete = [];
    frete = this.transportadoras;
     if(this.activatedRoute.snapshot.params.codEmpresa == 18){
        this.form.controls.codTransportadora.setValue(598);
        for(var i = 0;i < frete.length; i++){
          if(frete[i].codTransportadoraTid == 598){
            this.form.controls.freteConta.setValue(frete[i].codFreteConta);
          }
        }
      }
      if(this.activatedRoute.snapshot.params.codEmpresa == 79){
        this.form.controls.codTransportadora.setValue(1597);
        for(var i = 0;i < frete.length; i++){
          if(frete[i].codTransportadoraTid == 1597){
            this.form.controls.freteConta.setValue(frete[i].codFreteConta);
          }
        }
      }
      if(this.activatedRoute.snapshot.params.codEmpresa == 55){
        this.form.controls.codTransportadora.setValue(1734);
        for(var i = 0;i < frete.length; i++){
          if(frete[i].codTransportadoraTid == 1734){
            this.form.controls.freteConta.setValue(frete[i].codFreteConta);
          }
        }
      }
      if(this.activatedRoute.snapshot.params.codEmpresa == 77){
        this.form.controls.codTransportadora.setValue(1734);
        for(var i = 0;i < frete.length; i++){
          if(frete[i].codTransportadoraTid == 1734){
            this.form.controls.freteConta.setValue(frete[i].codFreteConta);
          }
        }
      }
  }
 // ACA SE REALIZARON CAMBIOS PARA LLAMAR A DIRECCION AL ESCOGER CLIENTE
  exibirClienteTerceiro(event: any) {
    if (event.notaFiscalMae === 1) {
      this.exibirClienteT = true;
      // Carga la dirección del cliente en el campo codEndereco del formulario
      this.form.controls['codEndereco'].setValue(event.direccion);
    } else {
      this.exibirClienteT = false;
      // Si el cliente no tiene una dirección asociada, se puede borrar el valor del campo codEndereco
      this.form.controls['codEndereco'].setValue('');
    }
  }


  setClientTerceiro(cod: any){
    for (let i = 0; i < this.locaisEntrega.length; i++) {
      if(this.locaisEntrega[i].codEndereco == cod){
        this.getCliente(this.locaisEntrega[i].COD_CLIE_TERC);
        this.form.controls.TP_ACAO.setValue(this.locaisEntrega[i].TP_ACAO);
      }
    }
  }

  getCliente(codCliente){
    this.loaderNavbar = true;
    this.form.controls.COD_CLIE_TERC.setValue(null);
    this.formularioService.getCliente(codCliente)
    .pipe(
      finalize(() => {
      this.loaderNavbar = false;
    }))
    .subscribe({
      next: (response: JsonResponse) => {
        const data = [];
        data[0] = response;
        if (data[0].responseCode === 200) {
          const codRazao = (data[0].result.codCliente+" - "+data[0].result.razaoSocial);
          this.form.controls.COD_CLIE_TERC.setValue(codRazao);
        }
      }
    });
  }

  getFormasPagamento(params){
    const data = {
      'tipoConsulta': 2,
      'codCliente': params
    };
    console.log(params,'-----')
    this.formasPagamentoLoader = true;
    this.formasPagamentoS.getListaFormasPagamento(data).pipe(
      finalize(() => {
        this.formasPagamentoLoader = false;
      })
    ).subscribe({
      next: (response: JsonResponse) =>{
        console.log(response);
        this.formasPagamento = response.data;
      }
    });
  }

  getListarPrecios():void{
    this.formularioService.getListarPrecios().subscribe(
      (response: any) => {
        this.listaPrecios = response.data;
      },
      (error: any) =>{

      }
    )
  }

  getTodosVendedores():void{
    this.formularioService.getTodosVendedores().subscribe(
      (response: any) =>{
        this.listaEjecutivo = response.data;
      },
      (error: any) =>{

      }
    )
  }



}
