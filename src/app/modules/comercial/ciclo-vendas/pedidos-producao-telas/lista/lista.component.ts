import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  TemplateRef,
  OnDestroy,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

// ngx-bootstrap
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { ptBrLocale } from 'ngx-bootstrap/locale';


defineLocale('pt-br', ptBrLocale);

// Services
import { AuthService } from 'src/app/shared/services/core/auth.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { DateService } from 'src/app/shared/services/core/date.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { ComercialCicloVendasPedidosProducaoTelasService } from '../pedidos-producao-telas.service';
import { DetailPanelService } from 'src/app/shared/templates/detail-panel/detal-panel.service';
import { ComercialCicloVendasPedidosProducaoTelasFormularioService } from './../formulario/formulario.service';
import { ComercialCicloVendasPedidosProducaoTelasListaService } from './lista.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';

// Interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { JsonResponse } from 'src/app/models/json-response';
import { IAssociacao } from '../../../cadastros/propostas/associacao-situacoes-proposta/models/associacao-situacoes-proposta';
import { IComercialCicloVendasPedidosProducaoTelas } from './models/pedidos-producao-telas';

@Component({
  selector: 'comercial-ciclo-vendas-pedidos-producao-telas-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class ComercialCicloVendasPedidosProducaoTelasListaComponent
  implements OnInit {
  user = this.authService.getCurrentUser();

  @ViewChild('scrollToFilter', {}) scrollToFilter: ElementRef;
  @ViewChild('scrollToDetails', {}) scrollToDetails: ElementRef;

  loaderNavbar: boolean;
  loaderFullScreen = true;

  loaderConsultaLiberacaoSubscription: Subscription;
  loaderEmailCotacaoSubscription: Subscription;

  pedidoDuplicadaSubscription: Subscription;
  pedidoDesdobradaSubscription: Subscription;

  breadCrumbTree: Array<Breadcrumb> = [];

  formProducao: FormGroup;
  formExpedicao: FormGroup;

  producao: Array<any> = [];
  expedicao: Array<any> = [];

  subtitles: Array<Subtitles> = [
    {
      id: 1,
      text: 'EM ABERTO',
      color: 'green',
    },
    {
      id: 2,
      text: 'PRODUÇÃO',
      color: 'blue',
    },
    {
      id: 3,
      text: 'EXPEDIÇÃO',
      color: 'yellow',
    },
    {
      id: 4,
      text: 'CANCELADO',
      color: 'red',
    },
  ];

  modalRef: BsModalRef;

  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
  };

  activatedRouteSubscription: Subscription;

  showDetailPanelSubscription: Subscription;
  showDetailPanel = false;
  detailPanelTitle: string;

  bsConfig: Partial<BsDatepickerConfig>;

  form: FormGroup;
  orderBy = 'nrProposta';
  orderType = 'DESC';

  filteredDepositos: Array<any> = [];
  situacoesCores: Array<IAssociacao> = [];

  dados: IComercialCicloVendasPedidosProducaoTelas[] = [];
  dadosLoaded = false;
  dadosEmpty = false;

  comentario: boolean = false;
  localizacao: boolean = false;

  detalhes: Array<any>[] = [];
  detalhesCarrinho: Array<any>[] = [];

  // detalhes = {
  //   contatos: [],
  //   itens: {
  //     materiais: [],
  //     total: {},
  //   },
  // };

  // Tipos de Situação dos Pedidos (Ativo/Inativo)
  tipos = [
    {
      cod: 0,
      nome: 'EXIBIR TODOS',
    },
    {
      cod: 1,
      nome: 'EM ABERTO',
    },
    {
      cod: 2,
      nome: 'PRODUÇÃO',
    },
    {
      cod: 3,
      nome: 'EXPEDIÇÃO',
    },
    {
      cod: 4,
      nome: 'CANCELADO',
    },
  ];

  contatosLoaded = false;
  contatosEmpty = false;
  pedidoSelected: any = {};
  itensLoaded = false;
  itensEmpty = false;

  activeRow: number;
  activePedido: IComercialCicloVendasPedidosProducaoTelas;

  maxSize = 10;
  itemsPerPage = 100;
  currentPage = 1;
  totalItems = 0;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private localeService: BsLocaleService,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private pnotifyService: PNotifyService,
    private dateService: DateService,
    private titleService: TitleService,
    private atividadesService: AtividadesService,
    private pedidosProducaoTelasService: ComercialCicloVendasPedidosProducaoTelasService,
    private listaService: ComercialCicloVendasPedidosProducaoTelasListaService,
    private detailPanelService: DetailPanelService,
    private pedidosProducaoTelas: ComercialCicloVendasPedidosProducaoTelasFormularioService,
    private bsModalService: BsModalService

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
    this.registrarAcesso();
    this.setBreadCrumb();
    this.getFilterValues();
    this.setFormFilter();
    this.titleService.setTitle('Cotizaciones y pedidos');
    this.onDetailPanelEmitter();
    // this.setFormProducao();
    // this.setFormExpedicao();
  }

  // ngOnDestroy(): void {
  //   this.unsetLoaderEvents();
  //   this.unsetChangeEvents();
  //   this.showDetailPanelSubscription.unsubscribe();
  // }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  setBreadCrumb() {
    const id = this.activatedRoute.snapshot.params.idSubModulo;
    this.breadCrumbTree = [
      {
        descricao: 'Home',
        routerLink: `/comercial/home`,
      },
      {
        descricao: 'Ciclo de ventas',
        routerLink: `/comercial/ciclo-vendas`,
      },
      {
        descricao: 'Pedidos Produção de Telas',
      },
    ];
  }




  unsetLoaderEvents(): void {
    this.loaderConsultaLiberacaoSubscription.unsubscribe();
    this.loaderEmailCotacaoSubscription.unsubscribe();
  }

  unsetChangeEvents(): void {
    this.pedidoDuplicadaSubscription.unsubscribe();
    this.pedidoDesdobradaSubscription.unsubscribe();
  }

  onDetailPanelEmitter(): void {
    this.showDetailPanelSubscription = this.detailPanelService.config.subscribe(
      (event: any) => {
        this.showDetailPanel = event.showing;

        if (this.showDetailPanel === false) {
          this.onCloseDetailPanel();
        }
      }
    );
  }


  getFilterValues(): void {
    this.listaService
      .loadDependencies()
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe({
        next: (response: any[] | JsonResponse[]) => {
          this.situacoesCores = response[0].data || [];
        },
        error: (error: any) => {
          this.pnotifyService.error('Ocorreu um erro ao carregar filtros.');
          this.location.back();
        }
      });
  }


  setFormFilter(): void {
    const formValue: any = this.checkRouterParams();

    this.form = this.formBuilder.group({
      tipoData: [formValue.tipoData],
      dataInicial: [formValue.dataInicial],
      dataFinal: [formValue.dataFinal],
      dataLancamento: [formValue.dataLancamento],
      dataEntrega: [formValue.dataEntrega],
      nrProposta: [formValue.nrProposta],
      codPrioridade: [formValue.codPrioridade],
      codSituacao: [formValue.codSituacao],
      cliente: [formValue.cliente],
      usuarioLancamento: [formValue.usuarioLancamento],
      codVendedor: [formValue.codVendedor, [Validators.required]],
      pagina: [formValue.pagina],
      registros: [this.itemsPerPage, Validators.required],
    });
  }

  checkRouterParams(): Object {
    let formValue = {
      tipoData: 1,
      dataInicial: this.dateService.getFirstDayMonth(),
      dataFinal: this.dateService.getLastDayMonth(),
      nrProposta: null,
      codDeposito: null,
      codSituacao: 0,
      cliente: null,
      codVendedor: 0,
      pagina: 1,
      registros: this.itemsPerPage,
    };

    this.activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (queryParams: any) => {
        if (Object.keys(queryParams).length > 0) {
          let params = atob(queryParams.q);
          params = JSON.parse(params);
          this.search(params);

          if (params['pagina']) {
            this.currentPage = params['pagina'];
          }

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



  setOrderBy(column: string) {
    if (this.orderBy === column) {
      if (this.orderType == 'DESC') {
        this.orderType = 'ASC';
      } else if (this.orderType == 'ASC') {
        this.orderType = 'DESC';
      }
    } else {
      this.orderBy = column;
      this.orderType = 'DESC';
    }
    this.onFilter();
  }

  onFilter(): void {
    if (this.form.valid) {
      this.itemsPerPage = this.form.value.registros;
      this.currentPage = 1;

      this.detailPanelService.hide();

      this.setRouterParams(this.getFormFilterValues());
    }
  }

  setRouterParams(params: any): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { q: btoa(JSON.stringify(params)) },
    });
    this.search(params);
  }

  getFormFilterValues(): Object {
    let params: any = {};

    if (this.form.value.tipoData) {
      params.tipoData = this.form.value.tipoData;
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


    if (this.form.value.codSituacao) {
      params.codSituacao = this.form.value.codSituacao;
    }

    if (this.form.value.nrProposta) {
      params.nrProposta = this.form.value.nrProposta;
    }

    if (this.form.value.codPrioridade) {
      params.codPrioridade = this.form.value.codPrioridade;
    }

    if (this.form.value.cliente) {
      params.cliente = this.form.value.cliente;
    }


    if (this.form.value.usuarioLancamento) {
      params.usuarioLancamento = this.form.value.usuarioLancamento;
    }

    if (this.form.value.codVendedor) {
      params.codVendedor = this.form.value.codVendedor;
    }

    if (this.form.value.pagina) {
      params.pagina = this.form.value.pagina;
    }

    if (this.form.value.registros) {
      params.registros = this.form.value.registros;
    }

    params.orderBy = this.orderBy;
    params.orderType = this.orderType;

    return params;
  }

  search(params: any): void {
    this.loaderNavbar = true;
    this.dados = [];
    this.dadosLoaded = false;
    this.dadosEmpty = false;

    this.pedidosProducaoTelasService
      .getPedidosProducaoTelas(params)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
          this.dadosLoaded = true;
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.hasOwnProperty('success') && response.success === true) {
            this.dados = response.data;
            this.loaderNavbar = false;
            this.totalItems = this.dados[0].qtdeRegistros;
          } else if (
            response.hasOwnProperty('success') &&
            response.success === false &&
            response.hasOwnProperty('mensagem') &&
            response.mensagem.length > 0 &&
            response.mensagem !== null
          ) {
            this.pnotifyService.error(response.mensagem);
            this.dadosEmpty = true;
          } else {
            this.pnotifyService.error();
            this.dadosEmpty = true;
          }
        },
        error: (error: any) => {
          if (error.error.hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
      });
  }

  onPageChanged(event: PageChangedEvent) {
    if (this.form.value.pagina != event.page) {
      this.form.controls.pagina.setValue(event.page);

      this.onCloseDetailPanel();
      this.setRouterParams(this.getFormFilterValues());

      this.scrollToFilter.nativeElement.scrollIntoView({
        behavior: 'instant',
      });
    }
  }

  styleStatusBorder(pedido: IComercialCicloVendasPedidosProducaoTelas): string {
    let borderClass: string;

    if (pedido.codSituacao == 1) {
      borderClass = 'border-success';
    } else if (pedido.codSituacao == 2) {
      borderClass = 'border-primary';
    } else if (pedido.codSituacao == 3) {
      borderClass = 'border-warning';
    } else if (pedido.codSituacao == 4) {
      borderClass = 'border-danger';
    }

    return borderClass;
  }

  viewRegister(index: number, pedido: IComercialCicloVendasPedidosProducaoTelas): void {
    this.loaderNavbar = true;

    console.log('pedido')
    console.log(pedido)

    this.detailPanelService.show();
    this.detailPanelTitle = `#${
      pedido.nrPedido
    } / ${pedido.razaoSocial.toUpperCase()}`;
    this.showDetailPanel = true;

    this.setActiveRow(index);
    this.setactivePedido(pedido);
    // this.resetRegister();

    this.pedidosProducaoTelasService
      .getDetailPanel(
        pedido.nrPedido
      )
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
          this.contatosLoaded = true;
          this.itensLoaded = true;
          this.itensEmpty = false;

          this.scrollToDetails.nativeElement.scrollIntoView({
            behavior: 'instant',
          });
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.success === true) {
            this.detailPanelService.loadedFinished(false);
            console.log(response);
            console.log(response.data);
            console.log(response.data.carrinho);
            this.detalhes = response.data;
            this.loaderNavbar = false;
            this.itensLoaded = true;
          } else {
            this.contatosEmpty = true;
            this.itensEmpty = true;
            this.itensLoaded = false;

            this.detailPanelService.loadedFinished(true);
            this.pnotifyService.error();
          }
        },
        error: (error: any) => {
          this.detailPanelService.loadedFinished(true);

          if (error.error.hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
      });

      this.pedidosProducaoTelasService
      .getDetalhesPedidos(
        pedido.nrPedido
      )
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
          this.contatosLoaded = true;
          this.itensLoaded = true;
          this.itensEmpty = false;

          this.scrollToDetails.nativeElement.scrollIntoView({
            behavior: 'instant',
          });
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.success === true) {
            this.detailPanelService.loadedFinished(false);
            console.log(response.data);
            this.detalhesCarrinho = response.data.carrinho;
            this.loaderNavbar = false;
            this.itensLoaded = true;
          } else {
            this.contatosEmpty = true;
            this.itensEmpty = true;
            this.itensLoaded = false;

            this.detailPanelService.loadedFinished(true);
            this.pnotifyService.error();
          }
        },
        error: (error: any) => {
          this.detailPanelService.loadedFinished(true);

          if (error.error.hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
      });
  }


  viewContato(contato: any): void {
    this.pedidoSelected = contato;
  }

  onCloseDetailPanel(): void {
    this.resetactivePedido();
    this.resetActiveRow();
    // this.resetRegister();
  }

  setactivePedido(pedido: IComercialCicloVendasPedidosProducaoTelas): void {
    this.activePedido = pedido;
  }

  resetactivePedido(): void {
    this.activePedido = null;
  }

  setActiveRow(index: number): void {
    this.activeRow = index;
  }

  resetActiveRow(): void {
    this.activeRow = null;
  }

  onSubtitleActivationChange(event: any): void {
    console.log(event);
  }

  showLoaderNavbar(event: boolean) {
    this.loaderNavbar = event;
  }


  // onChangeClienteCotacao(data: [any, IComercialCicloVendasPedidosProducaoTelas]): void {
  //   const selectedCliente = data[0];
  //   const updatedCotacao: IComercialCicloVendasPedidosProducaoTelas = data[1];

  //   this.dados.map((pedido: IComercialCicloVendasPedidosProducaoTelas) => {
  //     if (updatedCotacao.nrProposta === pedido.nrProposta) {
  //       pedido.codCliente = selectedCliente.codCliente;
  //       pedido.razaoSocial = selectedCliente.razaoSocial;
  //     }
  //   });

  //   this.detailPanelTitle = `#${
  //     updatedCotacao.nrProposta
  //   } / ${selectedCliente.razaoSocial.toUpperCase()}`;
  // }


  onPropostaDuplicada(data: [number, number, IComercialCicloVendasPedidosProducaoTelas]): void {
    const nrProposta = data[0];
    const codVendedor = data[1];
    const pedido = data[2];

    this.form.controls.nrProposta.setValue(nrProposta);
    this.form.controls.codEmpresa.setValue(pedido.codEmpresa);
    this.form.controls.codVendedor.setValue(codVendedor);
    this.onFilter();
  }


  onPropostaDesdobrada(data: [number, IComercialCicloVendasPedidosProducaoTelas, []]): void {
    const nrProposta = data[0];
    const pedido = data[1];
    const materiais = data[2];

    this.form.controls.nrProposta.setValue(nrProposta);
    this.form.controls.codEmpresa.setValue(pedido.codEmpresa);
    this.onFilter();

    /* if (materiais.length > 0) {
      this.itensLoaded = false;

      const filteredMateriais = this.detalhes.itens['materiais'].filter(
        (_material: any) =>
          !materiais.some(
            (material: any) => material.codigo === _material.codigo
          )
      );

      let total = {
        quantidade: 0,
        valor: 0,
      };

      filteredMateriais.map((material: any) => {
        total.quantidade += material.quantidade;
        total.valor += material.valorTotal;
      });

      this.detalhes.itens = {
        materiais: filteredMateriais,
        total: total,
      };

      setTimeout(() => {
        this.itensLoaded = true;
      }, 1000);
    } */
  }


  onChangeEmpresaCotacao(data: [number, number, number]): void {
    const selectedEmpresa = data[0];
    const selectedDeposito = data[1];
    const nrProposta = data[2];

    this.form.controls.nrProposta.setValue(nrProposta);
    this.form.controls.codEmpresa.setValue(selectedEmpresa);
    this.form.controls.codDeposito.setValue(selectedDeposito);
    this.onFilter();
  }

  // onImprimir(): void {
  //   this.loaderNavbar = true;

  //   this.pedidosProducaoTelasService
  //     .getImprimirCotacao(this.activePedido.nrProposta)
  //     .pipe(
  //       finalize(() => {
  //         this.loaderNavbar = false;
  //       })
  //     )
  //     .subscribe(
  //       (response: JsonResponse) => {
  //         if (response.hasOwnProperty('success') && response.success === true) {
  //           this.pnotifyService.success();
  //         } else {
  //           this.pnotifyService.error();
  //         }
  //       },
  //       (error: any) => {
  //         if (error.error.hasOwnProperty('mensagem')) {
  //           this.pnotifyService.error(error.error.mensagem);
  //         } else {
  //           this.pnotifyService.error();
  //         }
  //       }
  //     );
  // }


  onAdd(): void {
    console.log()
    this.router.navigate(['../novo'], {
      relativeTo: this.activatedRoute,
    });
  }

  onEdit(item: any): void {
    this.router.navigate(['../editar', item.nrPedido], {

      relativeTo: this.activatedRoute,

    });
  }

   // formProducao
  setFormProducao(item?): void {
    this.formProducao = this.formBuilder.group({
      nrPedido: [item.nrPedido],
      observacao: [item.descComentarioProducao]
    });

    this.comentario = false;

    if (item.descComentarioProducao != '') {
      this.comentario = true;
    }
  }

  onChangeProducao(){
    console.log(this.formProducao.getRawValue());
    this.pedidosProducaoTelas
    .postProducao(this.formProducao.getRawValue())
    .pipe(
      finalize(() => {
        this.loaderNavbar = false;
      })
    )
    .subscribe({
      next: (response: JsonResponse) => {
        console.log(response)
        if (response.hasOwnProperty('success') && response.success === true) {
          this.producao = response.data;
          this.pnotifyService.success();
          this.onFilter();
        } else {
          this.pnotifyService.error();
        }
      },
      error: (error: any) => {
        if (error.error.hasOwnProperty('mensagem')) {
          this.pnotifyService.error(error.error.mensagem);
        } else {
          this.pnotifyService.error();
        }
      }
    });
  }


    // formExpedicao
  setFormExpedicao(item?): void {
    this.formExpedicao = this.formBuilder.group({
      nrPedido: [item.nrPedido],
      codLocalizacao: [item.codLocalizacaoExpedicao]
    });

    this.localizacao = false;
    if (item.codLocalizacaoExpedicao != null) {
     this.localizacaoDisable();
     this.localizacao = true;
    }

  }

  localizacaoDisable() {
    this.formExpedicao.get('codLocalizacao').disable();
  }

  onChangeExpedicao(){
    console.log(this.formExpedicao.getRawValue());
    this.pedidosProducaoTelas
    .postExpedicao(this.formExpedicao.getRawValue())
    .pipe(
      finalize(() => {
        this.loaderNavbar = false;
      })
    )
    .subscribe({
      next: (response: JsonResponse) => {
        if (response.hasOwnProperty('success') && response.success === true) {
          this.pnotifyService.success();
          this.onFilter();
        } else {
          this.pnotifyService.error();
        }
      },
      error: (error: any) => {
        if (error.error.hasOwnProperty('mensagem')) {
          this.pnotifyService.error(error.error.mensagem);
        } else {
          this.pnotifyService.error();
        }
      }
    });

  }

  // modal
  openModalProducao(producao: TemplateRef<any>) {
  this.modalRef = this.bsModalService.show(producao);
  }

  openModalExpedicao(expedicao: TemplateRef<any>) {
  this.modalRef = this.bsModalService.show(expedicao);
  }

  closeModal(modalRef: TemplateRef<any>) {
    this.modalRef.hide();
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
}
