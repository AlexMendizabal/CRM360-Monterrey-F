import { TecnologiaInformacaoEstoqueService } from './../../services/estoque.service';
import { TecnologiaInformacaoEstoqueMovimentacoesService } from './../services/movimentacoes.service';
import { NumberIntPipe } from './../../pipes/number-int.pipe';
import { ITecnologiaInformacaoEstoqueMarcas } from './../../marcas/models/marcas';
import { TecnologiaInformacaoEstoqueMarcasService } from './../../marcas/services/marcas.service';
import { TecnologiaInformacaoEstoqueProdutosService } from './../../produtos/services/produtos.service';
import { CustomTableConfig } from './../../../../../shared/templates/custom-table/models/config';
import { DetailPanelService } from './../../../../../shared/templates/detail-panel/detal-panel.service';
//angular
import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

//servicos
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { RouterService } from 'src/app/shared/services/core/router.service';

// rxjs
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';

//modelos
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { DateService } from 'src/app/shared/services/core/date.service';

import { ITecnologiaInformacaoMovimentacoes } from './../models/movimentacoes';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { ITecnologiaInformacaoEstoqueProduto } from '../../produtos/models/produto';

@Component({
  selector: 'tecnologia-informacao-estoque-produtos-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class TecnologiaInformacaoEstoqueMovimentacoesListaComponent
  implements OnInit, OnDestroy {
  breadCrumbTree: Array<Breadcrumb>;
  idSubModulo: number;
  noResult: boolean;
  loadingEstoque: boolean;
  modalRef: BsModalRef;
  loading = true; //Loading FullPage
  loadingProdutos: boolean;
  noMovimentacoes: boolean;
  loadingMovimentacoes: boolean;
  loadingNavBar = false; //Loading do NAVBAR
  movimentacoes: Array<ITecnologiaInformacaoMovimentacoes>;
  estoque = [];
  noEstoque: boolean;
  produtos: Array<ITecnologiaInformacaoEstoqueProduto>;
  produtosForm: Array<ITecnologiaInformacaoEstoqueProduto>;
  $activatedRouteSubscription: Subscription;

  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: false,
    border: true,
  };

  form: FormGroup;
  formHistoricoMovimentacoes: FormGroup;

  showDetailPanelSubscription: Subscription;
  showDetailPanel = false;

  produtoSelecionado: ITecnologiaInformacaoMovimentacoes;

  // Tipos de Situação dos Tipos de Items (Ativo/Inativo)
  tipos = [
    {
      cod: '1',
      nome: 'Ativos',
    },
    {
      cod: '2',
      nome: 'Inativos',
    },
  ];

  /* Pagination */
  itemsPerPage = 100;
  totalItems = 10;
  currentPage = 1;
  /* Pagination */

  constructor(
    private route: Router,
    private pnotify: PNotifyService,
    private activatedRoute: ActivatedRoute,
    private produtosService: TecnologiaInformacaoEstoqueProdutosService,
    private estoqueService: TecnologiaInformacaoEstoqueService,
    private movimentacoesService: TecnologiaInformacaoEstoqueMovimentacoesService,
    private formBuilder: FormBuilder,
    private modalService: BsModalService,
    private routerService: RouterService,
    private dateService: DateService,
    private marcasService: TecnologiaInformacaoEstoqueMarcasService,
    private detailPanelService: DetailPanelService
  ) {}

  ngOnInit() {
    this.buildForm();
    this.setBreadCrumb();
    this.onActivatedRoute();
    this.onDetailPanelEmitter();
    this.getFormProdutos()
  }

  ngOnDestroy() {
    this.$activatedRouteSubscription.unsubscribe();
  }

  onActivatedRoute() {
    this.$activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (response) => {
        const _response = this.routerService.getBase64UrlParams(response);
        this.form.patchValue(_response);
        if (_response.hasOwnProperty('TT_REGI_PAGI'))
          this.itemsPerPage = _response.TT_REGI_PAGI;
        this.getProdutos(this.getParams());
      }
    );
  }

  onDetailPanelEmitter(): void {
    this.showDetailPanelSubscription = this.detailPanelService.config.subscribe(
      (event: any) => {
        this.showDetailPanel = event.showing;
      }
    );
  }

  onReset() {
    this.form.reset();
    this.form.patchValue({
      PAGI: 1,
      TT_REGI_PAGI: 100,
      TIME: [new Date().getTime()],
    });
  }

  
  getFormProdutos(params?: Partial<ITecnologiaInformacaoEstoqueProduto>) {
    this.loadingProdutos = true;
    const _params = params ?? {};
    _params.IN_STAT = '1';
    _params.IN_PAGI = '0';
    this.produtosService
      .getProdutos(_params)
      .pipe(
        finalize(() => {
          this.loadingProdutos = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.produtosForm = response.body['data'];
          } else {
            this.produtosForm = [];
          }
        },
        (error) => {
          this.pnotify.error();
        }
      );
  }

  buildForm() {
    this.form = this.formBuilder.group({
      ID_TECN_INFO_MOVI: [null],
      ID_TEIN_ESTO_PROD: [null],
      ID_TECN_INFO_ITEM_TIPO: [null],
      ID_TEIN_ESTO_PRMA:[null],
      ID_TECN_INFO_ITEM_MODE: [null],
      IN_STAT: [null],
      NM_CHAM: [null],
      NM_MRCA: [null],
      NM_TIPO: [null],
      VL_UNIT: [null],
      TT_ESTO_ATUA: [null],
      PAGI: [1],
      TT_REGI_PAGI: [this.itemsPerPage],
      TIME: [new Date().getTime()],
    });
    this.formHistoricoMovimentacoes = this.formBuilder.group({
      buscarPor: ['CD_REFE'],
      pesquisa: [null],
      CD_REFE: [null],
      CD_ITEM: [null],
      NR_NOTA_FISC: [null],
      NM_USUA: [null]
    });
  }

  setPageRegistros(itemsPerPage) {
    this.itemsPerPage = itemsPerPage;
    this.onFilter();
  }

  setBreadCrumb() {
    const id = this.activatedRoute.snapshot.params.idSubModulo;
    this.breadCrumbTree = [
      {
        descricao: 'Home',
        routerLink: `/tecnologia-informacao/home`,
      },
      {
        descricao: 'Inventario',
        routerLink: `/tecnologia-informacao/estoque/${id}`,
      },
      {
        descricao: 'Movimentações',
      },
    ];
  }

  onFilter() {
    this.detailPanelService.hide();
    this.form.get('PAGI').setValue(1);
    this.form.get('TIME').setValue(new Date().getTime());
    this.route.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams()),
    });
  }

  onDetails(produto: ITecnologiaInformacaoMovimentacoes): void {
    this.loadingNavBar = true;
    this.getEstoque({ID_TEIN_ESTO_PROD: produto.ID_TEIN_ESTO_PROD})
    this.detailPanelService.show();
    this.produtoSelecionado = produto;
    this.detailPanelService.loadedFinished(false);

    setTimeout(() => {
      this.loadingNavBar = false;
    }, 500);
  }

  openModal(template: TemplateRef<any>, produto) {
    this.produtoSelecionado = produto;
    this.modalRef = this.modalService.show(template, {
      animated: false,
      class: 'modal-xl',
    });
    this.getMovimentacoes(produto.ID_TEIN_ESTO_PROD);
  }

  hideModal() {
    this.modalRef.hide();
  }

  getProdutos(params?) {
    if (!this.loading) this.loadingNavBar = true;
    this.produtosService
      .getProdutos(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.produtos = response.body['data'];
            this.totalItems = response.body['total'];
            this.noResult = false;
          } else {
            this.noResult = true;
            this.produtos = [];
          }
        },
        (error) => {
          this.pnotify.error();
          this.noResult = true;
        }
      );
  }



  getMovimentacoes(id?: Partial<ITecnologiaInformacaoMovimentacoes>) {
    console.log(id)
    this.loadingMovimentacoes = true;
    this.noMovimentacoes = true
    const _obj = this.formHistoricoMovimentacoes.value;
    const params = {};
    const _params = {...params,ID_TEIN_ESTO_PROD: id}
    if (_obj['pesquisa']) _params[_obj['buscarPor']] = _obj['pesquisa'];
    this.movimentacoesService
      .getMovimentacoes(_params)
      .pipe(
        finalize(() => {
          this.loadingMovimentacoes = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.movimentacoes = response.body['data'];
            this.noMovimentacoes = false;
          } else {
            this.movimentacoes = [];
            this.pnotify.notice('Nenhuma movimentação encontrada!');
            this.noMovimentacoes = true
          }
        },
        (error) => {
          this.pnotify.error('Erro ao carregar modelos');
        }
      );
  }

  openRegister(produtos: ITecnologiaInformacaoMovimentacoes) {
    this.route.navigate(['../cadastro'], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(produtos),
    });
  }

  onPageChanged(event) {
    this.detailPanelService.hide();
    this.form.get('PAGI').setValue(event.page);
    this.form.get('TIME').setValue(new Date().getTime());
    this.route.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams()),
    });
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

  getEstoque(params?) {
    console.log(params)
    this.loadingEstoque = true;
    this.estoqueService
      .getEstoque(params)
      .pipe(
        finalize(() => {
          this.loadingEstoque = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.estoque = response.body['data'];
            this.noEstoque = false;
          } else {
            this.estoque = [];
            this.noEstoque = false;
          }
        },
        (error) => {
          this.pnotify.error();
          this.noEstoque = false;
          this.noResult = true;
        }
      );
  }

}
