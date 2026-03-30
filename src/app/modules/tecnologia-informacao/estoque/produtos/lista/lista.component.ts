import { TecnologiaInformacaoEstoqueMarcasService } from './../../marcas/services/marcas.service';
import { ITecnologiaInformacaoEstoqueMarcas } from './../../marcas/models/marcas';
//angular
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';

// rxjs
import { finalize, take, switchMap } from 'rxjs/operators';
import { Subscription, EMPTY } from 'rxjs';

//modelos
import { CustomTableConfig } from './../../../../../shared/templates/custom-table/models/config';
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { Subtitles } from './../../../../../shared/modules/subtitles/subtitles';
import { PageChangedEvent } from 'ngx-bootstrap';

//servicos
import { TecnologiaInformacaoEstoqueModeloService } from './../../modelo/services/modelo.service';
import { ConfirmModalService } from './../../../../../shared/modules/confirm-modal/confirm-modal.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { DateService } from 'src/app/shared/services/core/date.service';
import { TecnologiaInformacaoEstoqueTipoProdutosService } from '../../tipo-produto/services/tipo-produto.service';
import { TecnologiaInformacaoEstoqueProdutosService } from './../services/produtos.service';
//Interfaces
import { ITecnologiaInformacaoEstoqueProduto } from './../models/produto';
import { ITecnologiaInformacaoTipoProduto } from '../../../estoque/tipo-produto/models/tipoProduto';
import { ITecnologiaInformacaoEstoqueModelo } from '../../../estoque/modelo/models/modelo';

@Component({
  selector: 'tecnologia-informacao-estoque-cadastro-produtos-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class TecnologiaInformacaoEstoqueProdutosListaComponent
  implements OnInit, OnDestroy {
  breadCrumbTree: Array<Breadcrumb>;

  idSubModulo: number;
  produtos: Array<ITecnologiaInformacaoEstoqueProduto>;
  noResult: boolean;
  loadingMarca: boolean;
  loading = true; //Loading FullPage
  loadingNavBar = false; //Loading do NAVBAR
  loadingTipoProduto = false;
  loadingModelo = false;
  tipoProduto: ITecnologiaInformacaoTipoProduto[] = [];
  modelos: ITecnologiaInformacaoEstoqueModelo[] = [];
  marca: ITecnologiaInformacaoEstoqueMarcas[] = [];
  tableConfig: Partial<CustomTableConfig> = { subtitleBorder: true };
  $activatedRouteSubscription: Subscription;

  form: FormGroup;

  // Tipos de Situação dos Produtos (Ativo/Inativo)
  tipos = [
    {
      cod: '1',
      nome: 'Ativos',
    },
    {
      cod: '0',
      nome: 'Inativos',
    },
  ];

  subtitles: Array<Subtitles> = [
    {
      id: 1,
      text: 'Ativo',
      color: 'green',
    },
    {
      id: 2,
      text: 'Inativo',
      color: 'red',
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
    private modeloService: TecnologiaInformacaoEstoqueModeloService,
    private formBuilder: FormBuilder,
    private confirmModalService: ConfirmModalService,
    private routerService: RouterService,
    private dateService: DateService,
    private marcasService: TecnologiaInformacaoEstoqueMarcasService,
    private tipoProdutoService: TecnologiaInformacaoEstoqueTipoProdutosService
  ) {}

  ngOnInit() {
    this.buildForm();
    this.setBreadCrumb();
    this.onActivatedRoute();
    this.getTiposProduto();
    this.getModelos();
    this.getMarcas();
  }

  ngOnDestroy() {
    this.$activatedRouteSubscription.unsubscribe();
  }

  getTiposProduto(params?: Partial<ITecnologiaInformacaoTipoProduto>) {
    const _params = params ?? {};
    _params.IN_STAT = '1';
    _params.IN_PAGI = '0';

    this.loadingTipoProduto = true;
    this.tipoProdutoService
      .getTiposProduto(_params)
      .pipe(
        finalize(() => {
          this.loadingTipoProduto = false;
        })
      )
      .subscribe((response) => {
        if (response.status === 200) {
          this.tipoProduto = response.body['data'];
        }
      });
  }

  setPageRegistros(itemsPerPage) {
    this.itemsPerPage = itemsPerPage;
    this.onFilter();
  }

  getModelos(params?: Partial<ITecnologiaInformacaoEstoqueModelo>) {
    const _params = params ?? {};
    _params.IN_STAT = '1';
    _params.IN_PAGI = '0';
    this.loadingModelo = true;
    this.modeloService
      .getModelos(_params)
      .pipe(
        finalize(() => {
          this.loadingModelo = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.modelos = response.body['data'];
          } else {
            this.modelos = [];
          }
        },
        (error) => {
          this.pnotify.error('Erro ao carregar modelos');
        }
      );
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

  buildForm() {
    this.form = this.formBuilder.group({
      ID_TEIN_ESTO_PROD: [null],
      ID_TEIN_ESTO_PRMO: [null],
      ID_TEIN_ESTO_PRTP: [null],
      ID_TEIN_ESTO_PRMA: [null],
      NM_PROD: [null],
      NM_TIPO: [null],
      NM_MODE: [null],
      IN_STAT: [null],
      TT_REGI_PAGI: [this.itemsPerPage],
      PAGI: [1],
      TIME: [new Date().getTime()],
    });
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
        descricao: 'Produtos',
      },
    ];
  }

  onFilter() {
    this.form.get('PAGI').setValue(1);
    this.form.get('TIME').setValue(new Date().getTime());
    this.route.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams()),
    });
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

  getMarcas(params?: Partial<ITecnologiaInformacaoEstoqueMarcas>) {
    const _params = params ?? {};
    _params.IN_STAT = '1';
    _params.IN_PAGI = '0';

    this.loadingMarca = true;
    this.marcasService
      .getMarcas(_params)
      .pipe(
        finalize(() => {
          this.loadingMarca = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.marca = response.body['data'];
          } else {
            this.marca = [];
          }
        },
        (error) => {
          this.marca = [];
        }
      );
  }

  changeType(produtos: ITecnologiaInformacaoEstoqueProduto) {
    const stat = produtos.IN_STAT == '1' ? '0' : '1';

    this.confirmChange(stat)
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) => {
          if (!result) return EMPTY;

          this.loadingNavBar = true;
          produtos.IN_STAT = stat;
          return this.produtosService.postProdutos(produtos);
        }),
        finalize(() => {
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (success: any) => {
          this.pnotify.success();
        },
        (error: any) => {
          produtos.IN_STAT = produtos.IN_STAT == '1' ? '0' : '1';
          this.pnotify.error();
        }
      );
  }

  confirmChange(stat): any {
    if (stat == '1')
      return this.confirmModalService.showConfirm(
        null,
        null,
        'Deseja realmente prosseguir com a ativação do registro?',
        'Cancelar',
        'Confirmar'
      );

    return this.confirmModalService.showConfirm(
      'inactivate',
      'Confirmar inativação',
      'Deseja realmente prosseguir com a inativação do registro?',
      'Cancelar',
      'Confirmar'
    );
  }

  onPageChanged(event) {
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
}
