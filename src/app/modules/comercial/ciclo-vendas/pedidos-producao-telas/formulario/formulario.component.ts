import { ComercialCicloVendasPedidosProducaoTelasFormularioModalDetalhesService } from './modal/detalhes/cliente.service';
import { ComercialCicloVendasPedidosProducaoTelasService } from './../pedidos-producao-telas.service';
import { ComercialCicloVendasCotacoesFormularioModalMaterialComboService } from './../../cotacoes/formulario/modal/material/combo/combo.service';
// import { ComercialCicloVendasCotacoesFormularioModalDetalhesClienteService } from './../../cotacoes/formulario/modal/detalhes/cliente/cliente.service';
import { ComercialCicloVendasCotacoesFormularioModalMaterialDescontoService } from './../../cotacoes/formulario/modal/material/desconto/desconto.service';
import { ComercialCicloVendasPedidosProducaoTelasFormularioModalMaterialCalculoService } from './modal/material/calculo/calculo.service';
import { ComercialCicloVendasPedidosProducaoTelasFormularioModalFinalizacaoService } from './modal/finalizacao/finalizacao.service';
import { ICarrinhoModel } from './../../cotacoes/formulario/models/carrinho';
import { IPermissoesAcessoModel } from './../../cotacoes/formulario/models/permissoes-acesso';
import { ComercialCicloVendasCotacoesFormularioModalHistoricoComprasService } from './../../cotacoes/formulario/modal/cliente/historico-compras/historico-compras.service';
import { ComercialCicloVendasCotacoesFormularioModalMaterialEstoqueService } from './../../cotacoes/formulario/modal/material/estoque/estoque.service';
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  Input,
  ElementRef,
  HostListener,
  TemplateRef
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import {
  FormGroup,
  FormBuilder,
  AbstractControl,
  Validators,
  FormArray,
} from '@angular/forms';
import { Subscription, EMPTY } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

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
import { ComercialClientesService } from '../../../services/clientes.service';
import { ComercialCicloVendasPedidosProducaoTelasFormularioService } from './formulario.service';
import { ComercialCicloVendasCotacoesFormularioService } from '../../cotacoes/formulario/formulario.service';
import { ComercialCicloVendasCotacoesFormularioModalDetalhesEnderecoService } from '../../cotacoes/formulario/modal/detalhes/endereco/endereco.service';

// Interfaces
import { IFormCanDeactivate } from 'src/app/guards/iform-candeactivate';
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { JsonResponse } from 'src/app/models/json-response';
import { SituacaoProposta } from '../../../cadastros/situacao-proposta/models/situacao-proposta';
import { FormasPagamento } from '../../../cadastros/formas-pagamento/models/formas-pagamento';
import { FormaContato } from '../../../cadastros/contato/formas-contato/models/formas-contato';
import { OrigemContato } from '../../../cadastros/contato/origem-contato/models/origem-contato';
import { Transportadora } from '../../../cadastros/transportadoras/models/transportadora';


@Component({
  selector: 'comercial-ciclo-vendas-pedidos-producao-telas-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss'],
})
export class ComercialCicloVendasPedidosProducaoTelasFormularioComponent
  implements OnInit, OnDestroy, IFormCanDeactivate {
  permissoesAcesso: IPermissoesAcessoModel = {
    acessoClientes: false,
    historicoExclusao: false,
    duplicataCarteira: false,
  };

  @ViewChild('scrollToFormOnTop', {}) scrollToFormOnTop: ElementRef;
  @ViewChild('scrollToFormOnBottom', {}) scrollToFormOnBottom: ElementRef;
  @ViewChild('scrollToCarrinho', {}) scrollToCarrinho: ElementRef;

  // @Input('dadosCalculo') dadosCcalculo: Array<any>;

  loaderNavbar: boolean;
  loaderFullScreen = true;
  autoScrollToCarrinho = true;

  activatedRouteSubscription: Subscription;

  loaderFichaCadastralSubscription: Subscription;
  loaderSimilaridadeSubscription: Subscription;
  loaderCalculoSubscription: Subscription;
  loaderDescontoSubscription: Subscription;
  loaderComboSubscription: Subscription;
  loaderEstoqueDetalhesSubscription: Subscription;
  loaderHistoricoComprasSubscription: Subscription;
  loaderDetalhesClienteSubscription: Subscription;
  loaderFinalizacaoSubscription: Subscription;

  appTitle: string;

  idSubModulo: number;
  codEndereco: number;
  idReservado: number;
  codCotacao: number;

  breadCrumbTree: Array<Breadcrumb> = [];

  bsConfig: Partial<BsDatepickerConfig>;

  dependenciesLoaded = false;

  action: string;

  modalRef: BsModalRef;

  codClienteSubscription: Subscription;
  isCarteiraClientesLoaded: boolean;

  carrinhoHasError = false;

  form: FormGroup;
  codClientErrors = false;

  situacoes: Array<SituacaoProposta> = [];
  empresas: Array<any> = [];
  depositos: Array<any> = [];
  filteredDepositos: Array<any> = [];
  formasPagamento: Array<FormasPagamento> = [];
  formasContato: Array<FormaContato> = [];
  origensContato: Array<OrigemContato> = [];
  transportadoras: Array<Transportadora> = [];
  formData: Array<FormData> = [];

  carrinho: Array<ICarrinhoModel> = [];
  materiais: Array<ICarrinhoModel> = [];
  valorProposta: number;

  producao: boolean = false;
  expedicao: boolean = false;
  unsaved: boolean = true;
  pesoQtdade: boolean;

  locaisEntrega: Array<any> = [];
  locaisEntregaLoader: boolean;

  contatos: Array<any> = [];
  contatosLoader: boolean;

  dadosLancamento: {
    data: string;
    codVendedor: number;
    nomeVendedor: string;
  } = {
    data: null,
    codVendedor: null,
    nomeVendedor: null,
  };

    // // Tipos de Situação dos Pedidos (Ativo/Inativo)
    // tipos = [
    //   {
    //     cod: '1',
    //     nome: 'Em Aberto',
    //   },
    //   {
    //     cod: '2',
    //     nome: 'Produção',
    //   },
    //   {
    //     cod: '3',
    //     nome: 'Expedição',
    //   },
    //   {
    //     cod: '4',
    //     nome: 'Cancelado',
    //   },
    // ];

  constructor(
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private formBuilder: FormBuilder,
    private localeService: BsLocaleService,
    private pnotifyService: PNotifyService,
    private confirmModalService: ConfirmModalService,
    private atividadesService: AtividadesService,
    private titleService: TitleService,
    private dateService: DateService,
    private formularioService: ComercialCicloVendasPedidosProducaoTelasFormularioService,
    private formularioCotacoesService: ComercialCicloVendasCotacoesFormularioService,
    private enderecoDetalhesService: ComercialCicloVendasCotacoesFormularioModalDetalhesEnderecoService,
    private historicoComprasService: ComercialCicloVendasCotacoesFormularioModalHistoricoComprasService,
    // private clienteDetalhesService: ComercialCicloVendasCotacoesFormularioModalDetalhesClienteService,
    private finalizacaoService: ComercialCicloVendasPedidosProducaoTelasFormularioModalFinalizacaoService,
    private calculoService: ComercialCicloVendasPedidosProducaoTelasFormularioModalMaterialCalculoService,
    private descontoService: ComercialCicloVendasCotacoesFormularioModalMaterialDescontoService,
    private estoqueService: ComercialCicloVendasCotacoesFormularioModalMaterialEstoqueService,
    private comboService: ComercialCicloVendasCotacoesFormularioModalMaterialComboService,
    private bsModalService: BsModalService,
    private pedidosProducaoTelasService: ComercialCicloVendasPedidosProducaoTelasService,
    private router: Router,
    private modalService: BsModalService,
    private clienteDetalhesService: ComercialCicloVendasPedidosProducaoTelasFormularioModalDetalhesService,
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
    this.hasAccessToClient();
  }

  ngOnDestroy(): void {
    this.unsetLoaderEvents();
    this.activatedRouteSubscription.unsubscribe();
    this.codClienteSubscription.unsubscribe();
    this.formularioService.clearCarteiraClientes();
  }

  hasAccessToClient(): void {
    const resolver = this.activatedRoute.snapshot.data.data;

    if (resolver.success === true) {
        this.registrarAcesso();
        this.setBreadCrumb();
        this.getFormFields();
        this.setFormBuilder();
        this.setLoaderEvents();
        this.setClienteSubscription();
    } else {
      this.pnotifyService.error();
      this.location.back();
    }
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  setBreadCrumb(): void {

    this.activatedRoute.params.subscribe((params: any) => {
      if (params.nrProposta) {
        this.appTitle = 'Editar Pedido';
        this.action = 'update';
      } else {
        this.appTitle = 'Novo Pedido';
        this.action = 'create';
      }
      this.idSubModulo = params.idSubModulo;
      console.log(params)

      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/comercial/home',
        },
        {
          descricao: 'Ciclo de vendas',
          routerLink: `/comercial/ciclo-vendas/${this.idSubModulo}`,
        },
        {
          descricao: 'Pedidos Produção de Telas',
          routerLink: `/comercial/ciclo-vendas/${this.idSubModulo}/pedidos-producao-telas/lista`,
        },
        {
          descricao: this.appTitle,
        },
      ];
    });
  }

  getFormFields(): void {
    this.formularioCotacoesService
      .loadDependencies()
      .pipe(
        finalize(() => {
          this.dependenciesLoaded = true;
        })
      )
      .subscribe((response: Array<JsonResponse | any>) => {
        this.situacoes = response[0].data || [];

        this.empresas = response[1].result || [];

        this.depositos = response[2].result || [];

        this.formasPagamento = response[3].data || [];

        this.filteredDepositos = this.depositos.filter(
          (value: any) => value.idEmpresa == 18
        );
      });
  }

  getDate(): Date {
    let date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 10);
  }

  setFormBuilder(): void {
    const resolver = this.activatedRoute.snapshot.data.data;
    if (resolver.success === true) {
      const data = resolver.data;
      const formValue: any = this.checkRouterParams();

      const codCotacao =
        typeof this.codCotacao == 'undefined'
          ? this.idReservado
          : this.codCotacao;

      this.codEndereco = data.codEndereco;

      this.form = this.formBuilder.group({
        nrPedido: [data.nrPedido],
        codCotacao: [{ value: codCotacao, disabled: true }],
        codSituacao: [
          data.codSituacao != 0 ? data.codSituacao : null,
          [Validators.required],
        ],
        codPrioridade: [{ value: data.prioridade, disabled: false }],
        codCliente: [data.codCliente],
        codRazaoSocial: [data.codRazaoSocial],
        codDeposito: [ data.codLocalizacaoEstoque, [Validators.required]],
        //codLocalizacao: [data.codLocalizacaoExpedicao, [Validators.required]],

        dataEntrega: data.dataPrevisaoEntrega ? 
        [this.dateService.convertStringToDate(data.dataPrevisaoEntrega, 'usa'), Validators.required] :
        [this.getDate(),Validators.required],

        codEndereco: [
          data.codEndereco != 0 ? data.codEndereco : null,
          [Validators.required],
        ],

        codFormaPagamento: [
          118,
          /*data.codFormaPagamento != 0 ? data.codFormaPagamento : null,*/
          [Validators.required],
        ],

        duplicatasSomenteCarteira: [
          { value: data.duplicatasSomenteCarteira, disabled: true },
        ],

        observacoes: [data.observacao],
        obsProducao: [data.obsProducao]
      });

      this.checkPermissoesAcesso();
      this.getLocaisEntrega(data.codCliente);

      this.dadosLancamento.data = data.dataCadastro;
      this.dadosLancamento.codVendedor = data.codUsuarioCadastro;
      this.dadosLancamento.nomeVendedor = data.nomeUsuarioCadastro;

      this.carrinho = data.carrinho;

      this.formularioService.dataSubject.next(data);
    } else {
      this.pnotifyService.error();
      this.location.back();
    }


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

  checkPermissoesAcesso(): void {
    if (this.permissoesAcesso.duplicataCarteira === true) {
      this.form.controls.duplicatasSomenteCarteira.enable();
    }
  }

    /**
   * @source = 'application' || 'user'
   */
  onChangeCliente(codCliente: number, source: string): void {
    this.form.controls.codCliente.setValue(codCliente);
    this.codClientErrors = false;

    if (codCliente === null) {
      this.form.controls.codEndereco.setValue(null);
      this.locaisEntrega = [];
    } else {
      this.getLocaisEntrega(codCliente, source);
    }
  }

  onFecharModal(event) {
    this.modalRef.hide();
  }

  onDetalhesLocalEntrega(): void {
    if (this.form.value.codEndereco != null) {
      this.enderecoDetalhesService.showModal(
        this.form.value.codCliente,
        this.form.value.codEndereco
      );
    }
  }

  getLinkAddLocalEntrega(): string {
    return `/comercial/clientes/cadastro/${this.form.value.codCliente}/enderecos/novo`;
  }

  onReloadLocalEntrega(): void {
    if (this.locaisEntregaLoader === false) {
      this.getLocaisEntrega(this.form.value.codCliente, 'user');
    }
  }

  getLocaisEntrega(codCliente: number, source?: string): void {
    if (source != 'application') {
      this.form.controls.codEndereco.markAsUntouched();
      this.form.controls.codEndereco.setValue(null);
      this.form.controls.codEndereco.disable();
    }

    this.locaisEntrega = [];
    this.locaisEntregaLoader = true;

    this.formularioCotacoesService
      .getLocaisEntrega(codCliente)
      .pipe(
        finalize(() => {
          this.locaisEntregaLoader = false;
          this.form.controls.codEndereco.enable();
          this.form.controls.codEndereco.setValue(this.codEndereco);
          this.form.controls.codEndereco.updateValueAndValidity();
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
              tipo: 'Aprovados',
            });
          }

          for (let i = 0; i < _enderecosAguardando.length; i++) {
            enderecosAguardando.push({
              codEndereco: _enderecosAguardando[i].id,
              descricao: this.formatLocalEntrega(_enderecosAguardando[i]),
              tipo: 'Aguardando aprovação',
            });
          }

          this.locaisEntrega = [...enderecos, ...enderecosAguardando];
        }
      });
  }

  formatLocalEntrega(localEntrega: any): string {
    return `${localEntrega.endereco} - ${localEntrega.bairro}, ${localEntrega.cidade} - ${localEntrega.uf} - ${localEntrega.cep}`;
  }



  checkRouterParams(): Object {
    let formValue = {
      codDeposito: null,
      codLocalizacao: null,
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


    this.loaderFinalizacaoSubscription = this.finalizacaoService.loaderNavbar.subscribe(
      (response: boolean) => {
        this.loaderNavbar = response;
      }
    );
  }

  unsetLoaderEvents(): void {
    this.loaderCalculoSubscription.unsubscribe();
    this.loaderDescontoSubscription.unsubscribe();
    this.loaderComboSubscription.unsubscribe();
    this.loaderEstoqueDetalhesSubscription.unsubscribe();
    this.loaderHistoricoComprasSubscription.unsubscribe();
    this.loaderDetalhesClienteSubscription.unsubscribe();
    this.loaderFinalizacaoSubscription.unsubscribe();
  }

  onLoaderNavbar(event: boolean): void {
    this.loaderNavbar = event;
  }

  onLoaderFullScreen(event: boolean): void {
    this.loaderFullScreen = event;
  }

  onChangeEmpresa(idEmpresa: number): void {
    this.form.controls.codLocalizacao.reset();

    this.filteredDepositos = this.depositos.filter(
      (value: any) => value.idEmpresa == idEmpresa
    );

    if (this.filteredDepositos.length === 1) {
      this.form.controls.codLocalizacao.setValue(
        this.filteredDepositos[0]['idDeposito']
      );
    }
  }

  // onChangeDeposito(deposito: any): void {
  //   this.form.controls.codDeposito.setValue(deposito.idEmpresa);
  // }

  onChangeValidadeProposta(value: Date): boolean {
    let isValid = true;
    const maxDate = this.dateService.addDaysToDate(new Date(), 15);

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

    if (this.autoScrollToCarrinho === true) {
      setTimeout(() => {
        this.scrollToCarrinho.nativeElement.scrollIntoView({
          behavior: 'instant',
        });
      }, 500);
    }
  }

  onMateriaisScrollTop(event: boolean): void {
    if (event === true) {
      this.onScrollToForm('top');

      if (this.form.value.codDeposito === null) {
        this.form.controls.codDeposito.markAsTouched();
        this.form.controls.codDeposito.markAsDirty();
        this.form.controls.codDeposito.setErrors({ required: true });
        this.pnotifyService.notice('Selecione um Depósito.');
      }

      if (this.form.value.codLocalizacao === null) {
        this.form.controls.codLocalizacao.markAsTouched();
        this.form.controls.codLocalizacao.markAsDirty();
        this.form.controls.codLocalizacao.setErrors({ required: true });
        this.pnotifyService.notice('Selecione uma Localização.');
      }
    }
  }

  onCarrinho(carrinho: any): void {
    this.materiais = carrinho.materiais;
    this.valorProposta = carrinho.total.valorProposta;
  }

  onCarrinhoError(event: boolean): void {
    this.carrinhoHasError = event;
  }

  onCarrinhoScrollTop(event: boolean): void {
    if (event === true) {
      this.onScrollToForm('top');
      this.codClientErrors = true;
      this.form.controls.codCliente.markAsTouched();
      this.form.controls.codCliente.setErrors({ required: true });
      this.pnotifyService.notice('Selecione um cliente.');
    }
  }

  onSubmit(): void {
    this.unsaved = false;
    this.location.back();

    this.sendForm();
    this.formularioService.onNotifySubmit(true);

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
            response ?

            this.valoresPesoQtde()

            : EMPTY
          );
      } else {
        this.valoresPesoQtde();
      }

    }
  }

   // modal
   openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      animated: false,
      class: 'modal-xl',
    });
  }

  valoresPesoQtde() {
    this.pesoQtdade = false;
    for (let i = 0; i < this.materiais.length; i++) {
      if (this.materiais[i].quantidade === null || this.materiais[i].pesoEspecifico === null ) {
        this.pesoQtdade = true;
      }
    }

  if(this.pesoQtdade === true) {
    this.confirmModalService
          .showConfirm(
            null,
            'Peso ou quantidade não permitidos',
            'O Peso ou valor está com valor 0, favor rever materiais!',
            null,
            'Confirmar'
          )
          .subscribe((response: boolean) =>
            response ? this.pesoQtdade = false : this.pesoQtdade = false
          );

      }  else {
        this.sendCotacao();
     }

  }


  sendCotacao(): void {
    const formValue = this.form.getRawValue();

    const dataCotacao = {
      nrPedido:formValue.nrPedido,
      codCotacao: formValue.codCotacao,
      codSituacao: Number(formValue.codSituacao),
      situacao: formValue.codSituacao,
      codCliente: formValue.codCliente,
      razaoSocial: formValue.razaoSocial,
      codEndereco: formValue.codEndereco,
      codContato: formValue.codContato,
      codPrioridade: formValue.codPrioridade,
      codDeposito: formValue.codDeposito,
      codLocalizacao: formValue.codLocalizacao,
      dataEntrega: formValue.dataEntrega,
      observacoes: formValue.observacoes,
      carrinho: this.materiais,
    };

    if (this.pesoQtdade = true) {
      this.sentCotacao(dataCotacao);
    }


    // this.finalizacaoService.sendCotacao(dataCotacao);
  }

  sentCotacao(dataCotacao: any): void {
    this.loaderNavbar = true;

    if (this.action === 'update') {
      this.pedidosProducaoTelasService
      .putCotacao(dataCotacao)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe(
        (response: JsonResponse) => {
          if (response.success === true) {
            dataCotacao.carrinho = [];
            dataCotacao.carrinho = response.data;

            this.activatedRoute.params.subscribe((params: any) => {
              if (params.hasOwnProperty('id')) {
                this.location.back();
              } else {
                this.router.navigate([`/comercial/ciclo-vendas/${this.idSubModulo}/pedidos-producao-telas/lista`]);
              }
            });

            this.pnotifyService.success('Pedido atualizado com sucesso');
          } else {
            this.pnotifyService.error();
          }
        },
        (error: any) => {
          this.pnotifyService.error();
        }
      );

    } else {

      this.pedidosProducaoTelasService
      .postCotacao(dataCotacao)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe(
        (response: JsonResponse) => {
          if (response.success === true) {
            dataCotacao.carrinho = [];
            dataCotacao.carrinho = response.data;
            this.pnotifyService.success();
            this.router.navigate([`/comercial/ciclo-vendas/${this.idSubModulo}/pedidos-producao-telas/lista`]);
          } else {
            this.pnotifyService.error();
          }
        },
        (error: any) => {
          this.pnotifyService.error();
        }
      );
    }

  }

   //modal

  openModalProducao(producao: TemplateRef<any>) {
  this.modalRef = this.bsModalService.show(producao);
  }

  openModalExpedicao(expedicao: TemplateRef<any>) {
  this.modalRef = this.bsModalService.show(expedicao);
  }

  closeModal(modalRef: TemplateRef<any>) {
    this.modalRef.hide();
  }

  changeSituacao() {
    if (this.form.value.codSituacao == 2) {
      this.producao = true;
      this.expedicao = false;

    } else if (this.form.value.codSituacao == 3) {
      this.expedicao = true;
      this.producao = false    }
  }

  checkFormErrors(): boolean {
    let hasError = false;

    if (this.carrinhoHasError === true) {
      this.scrollToCarrinho.nativeElement.scrollIntoView({
        behavior: 'instant',
      });
      hasError = true;
    } else {

      if (this.form.controls.codSituacao.errors !== null) {
        this.onScrollToForm('top');
        this.form.controls.codSituacao.markAsTouched();
        this.form.controls.codSituacao.setErrors({ incorrect: true });
        this.pnotifyService.notice('Selecione a situação.');
        hasError = true;
      }

      if (this.form.controls.codCliente.errors !== null) {
        this.onScrollToForm('top');
        this.codClientErrors = true;
        this.form.controls.codCliente.markAsTouched();
        this.form.controls.codCliente.setErrors({ incorrect: true });
        this.pnotifyService.notice('Selecione um cliente.');
        hasError = true;
      }

      if (this.form.controls.dataEntrega.errors !== null) {
        this.onScrollToForm('top');
        this.form.controls.dataEntrega.markAsTouched();
        this.form.controls.dataEntrega.setErrors({ incorrect: true });
        this.pnotifyService.notice('Informe a data de entrega.');
        hasError = true;
      }
    }

    return hasError;
  }

  setClienteSubscription(): void {
    this.codClienteSubscription = this.formularioService.codCliente.subscribe(
      (codCliente: number) => {
        this.form.controls.codCliente.setValue(codCliente);
        this.onChangeCliente(codCliente, 'user');
      }
    );
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


  onLoadCliente(event: boolean): void {
    this.isCarteiraClientesLoaded = event;
  }

  // onClienteDetalhes(): void {
  //   if (this.isCarteiraClientesLoaded === true) {
  //     this.clienteDetalhesService.showModal(this.form.value.codCliente);
  //   } else {
  //     this.pnotifyService.notice('Aguardando a carteira de clientes.');
  //   }
  // }

  onHistoricoCompras(): void {
    const params = this.form.value;
    if (this.isCarteiraClientesLoaded === true) {
      if (this.form.value.codLocalizacao !== null) {
        this.historicoComprasService.showModal(
          this.setParamsHistoricoCompras(params)
        );
      } else {
        this.onMateriaisScrollTop(true);
      }
    } else {
      this.pnotifyService.notice('Aguardando a carteira de clientes.');
    }
  }

  setParamsHistoricoCompras(params): Object {

    let _params: any = {};

    _params.codCliente = params.codCliente;
    _params.codEmpresa = params.codEmpresa;
    _params.codEndereco = params.codEndereco;

    return _params;

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
    const unsaved = this.form.dirty && this.unsaved;
    return unsaved;
  }

  @HostListener('window:beforeunload', ['$event'])
  handleBeforeUnload($event: any) {
    if (this.hasUnsavedData()) {
      $event.returnValue = true;
    }
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

  onClienteDetalhes(): void {
    this.clienteDetalhesService.showModal(this.form.value.codCliente);
  }

  onCliente(event) {
    this.form.patchValue(event);
    console.log(event)
    this.onChangeCliente(event.codCliente, 'user');
    this.onLoadCliente(true);
  }
}
