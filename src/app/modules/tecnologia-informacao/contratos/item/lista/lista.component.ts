import { TecnologiaInformacaoEstoqueProdutosService } from './../../../estoque/produtos/services/produtos.service';
import { CustomTableConfig } from './../../../../../shared/templates/custom-table/models/config';
import { DetailPanelService } from './../../../../../shared/templates/detail-panel/detal-panel.service';
import { TecnologiaInformacaoFuncionariosService } from './../../services/funcionarios.service';
import { TecnologiaInformacaoCadastroContratoService } from './../../contrato/services/contrato.service';
import { ITecnologiaInformacaoContrato } from './../../contrato/models/contrato';
//angular
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';

//servicos
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { TecnologiaInformacaoCadastroItemService } from '../services/item.service';
import { RouterService } from 'src/app/shared/services/core/router.service';

// rxjs
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';

//modelos
import { Subtitles } from './../../../../../shared/modules/subtitles/subtitles';
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { DateService } from 'src/app/shared/services/core/date.service';

import { ITecnologiaInformacaoItem } from './../models/item';
import { XlsxService } from 'src/app/shared/modules/xlsx/xlsx.service';
import { ITecnologiaInformacaoEstoqueProduto } from '../../../estoque/produtos/models/produto';
@Component({
  selector: 'tecnologia-informacao-cadastros-item-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class TecnologiaInformacaoCadastrosItemListaComponent
  implements OnInit, OnDestroy {
  breadCrumbTree: Array<Breadcrumb>;
  loadingProduto: boolean;
  loadingContrato: boolean;
  loadingFuncionario: boolean;
  loadingCcu: boolean;
  idSubModulo: number;
  totalItens: any = [];
  noResult: boolean;
  noVinculo = true;
  loading = true; //Loading FullPage
  loadingTotalItens: boolean; 
  loadingNavBar = false; //Loading do NAVBAR
  loadingVinculo = true;
  loadingSitUsuarios = true;

  item: Array<ITecnologiaInformacaoItem>;
  situacoesUsuarios = [];
  produtos: ITecnologiaInformacaoEstoqueProduto[] = [];
  contrato: ITecnologiaInformacaoContrato[] = [];
  $activatedRouteSubscription: Subscription;
  itensVinculados: ITecnologiaInformacaoItem[] = [];

  tableConfig: Partial<CustomTableConfig> = { subtitleBorder: true };
  funcionario = [];
  centroCusto = [];
  form: FormGroup;

  showDetailPanelSubscription: Subscription;
  showDetailPanel = false;

  itemSelecionado: ITecnologiaInformacaoItem;

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
    {
      cod: '3',
      nome: 'Furtado',
    },
    {
      cod: '4',
      nome: 'Assistência Técnica',
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
    {
      id: 3,
      text: 'Furtado',
      color: 'yellow',
    },
    {
      id: 3,
      text: 'Assistência Técnica',
      color: 'blue',
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
    private itemService: TecnologiaInformacaoCadastroItemService,
    private formBuilder: FormBuilder,
    private xlsxService: XlsxService,
    private routerService: RouterService,
    private produtoService: TecnologiaInformacaoEstoqueProdutosService,
    private funcionarioService: TecnologiaInformacaoFuncionariosService,
    private dateService: DateService,
    private detailPanelService: DetailPanelService,
    private contratos: TecnologiaInformacaoCadastroContratoService
  ) {}

  ngOnInit() {
    this.buildForm();
    this.setBreadCrumb();
    this.onActivatedRoute();
    this.getProdutos();
    this.getContrato();
    this.getCentroCusto();
    this.getUsuariosSituacoes();
    this.onDetailPanelEmitter();
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
        this.getItem(this.getParams());
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

  getProdutos(params?: Partial<ITecnologiaInformacaoEstoqueProduto>) {
    const _params = params ?? {};
    _params.IN_STAT = '1';
    _params.IN_PAGI = '0';

    this.loadingProduto = true;
    this.produtoService
      .getProdutos(_params)
      .pipe(
        finalize(() => {
          this.loadingProduto = false;
        })
      )
      .subscribe((response) => {
        if (response.status === 200) {
          this.produtos = response.body['data'];
        }
      });
  }

  getContrato(params?: Partial<ITecnologiaInformacaoContrato>) {
    const _params = params ?? {};
    _params.IN_STAT = '1';

    this.loadingContrato = true;
    this.contratos
      .getContrato(_params)
      .pipe(
        finalize(() => {
          this.loadingContrato = false;
        })
      )
      .subscribe((response) => {
        if (response.status === 200) {
          this.contrato = response.body['data'];
        }
      });
  }

  getCentroCusto(params?) {
    this.loadingCcu = true;
    this.funcionarioService
      .getCentroCusto()
      .pipe(
        finalize(() => {
          this.loadingCcu = false;
        })
      )
      .subscribe((response) => {
        if (response.status === 200) {
          this.centroCusto = response.body['data'];
        }
      });
  }
  getFuncionario(params?) {
    params = params ?? {};
    params['IN_PAGI'] = '0';

    this.loadingFuncionario = true;
    this.funcionarioService
      .getFuncionario(params)
      .pipe(
        finalize(() => {
          this.loadingFuncionario = false;
        })
      )
      .subscribe((response) => {
        if (response.status === 200) {
          this.funcionario = response.body['data'];
        }
      });
  }

  getUsuariosSituacoes() {
    this.itemService
      .getUsuariosSituacoes()
      .pipe(finalize(() => (this.loadingSitUsuarios = false)))
      .subscribe((response) => {
        this.situacoesUsuarios = response['data'];
      });
  }

  onReset() {
    this.form.reset();
    this.form.patchValue({
      PAGI: 1,
      TT_REGI_PAGI: 100,
      TIME: [new Date().getTime()],
    });
  }

  buildForm() {
    this.form = this.formBuilder.group({
      ID_TECN_INFO_ITEM: [null],
      CD_ITEM: [null],
      VL_ITEM: [null],
      NM_PROD: [null],
      ID_TECN_INFO_CONT: [null],
      ID_TEIN_ESTO_PROD: [null],
      ID_TECN_INFO_ITEM_STAT: [null],
      NR_MATR: [null],
      NM_USUA: [null],
      CD_STAT_USUA: [null],
      QT_DOCU: [null],
      NR_MATR_CADA: [null],
      CD_CCU: [null],
      PAGI: [null],
      CD_SITU: [null],
      TT_REGI_PAGI: ['100'],
      TIME: [new Date().getTime()],
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
        descricao: 'Contratos',
        routerLink: `/tecnologia-informacao/contratos/${id}`,
      },
      {
        descricao: 'Itens',
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

  onDetails(item: ITecnologiaInformacaoItem): void {
    this.getItensVinculados({ ID_TECN_INFO_ITEM_REFE: item.ID_TECN_INFO_ITEM });
    this.loadingNavBar = true;
    this.detailPanelService.show();
    this.itemSelecionado = item;
    this.detailPanelService.loadedFinished(false);

    setTimeout(() => {
      this.loadingNavBar = false;
    }, 500);
  }

  getItem(params?) {
    const _params ={...params, TT_REGI_PAGI:this.itemsPerPage}
    if (!this.loading) this.loadingNavBar = true;
    this.itemService
      .getItem(_params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.item = response.body['data'];
            this.totalItems = response.body['total'];
            this.noResult = false;
          } else {
            this.noResult = true;
            this.item = [];
          }
        },
        (error) => {
          this.pnotify.error();
          this.noResult = true;
        }
      );
  }


  getTotalItens(params?) {
    this.loadingNavBar= true;
    params = this.getParams();
    const _params = {...params,IN_PAGI:'0'}
    this.itemService
      .getItem(_params)
      .pipe(
        finalize(() => {
          this.loadingNavBar= false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.totalItens = response.body['data'];
            this.onExport();
          } else {
            this.totalItens = [];
          }
        },
        (error) => {
          this.pnotify.error();
        }
      );
  }


  getItensVinculados(params: Partial<ITecnologiaInformacaoItem>) {
    this.loadingVinculo = true;
    this.noVinculo = true;
    this.itemService
      .getItem(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingVinculo = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.itensVinculados = response.body['data'];
            this.noVinculo = false;
          } else {
            this.noVinculo = true;
            this.itensVinculados = [];
          }
        },
        (error) => {
          this.pnotify.error();
        }
      );
  }

  onTermo(item: ITecnologiaInformacaoItem): void {
    const id = this.activatedRoute.snapshot.params.idSubModulo;
    this.route.navigate(
      [`/tecnologia-informacao/contratos/${id}/termo-responsabilidade`, item.ID_TECN_INFO_ITEM],
      {
        relativeTo: this.activatedRoute,
      }
    );
  }

  openRegister(item: ITecnologiaInformacaoItem) {
    this.route.navigate(['../cadastro'], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(item),
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

  classStatusBorder(item: ITecnologiaInformacaoItem): string {
    let borderClass: string;

    if (item.ID_TECN_INFO_ITEM_STAT == 1) {
      borderClass = 'border-success';
    } else if (item.ID_TECN_INFO_ITEM_STAT == 2) {
      borderClass = 'border-danger';
    } else if (item.ID_TECN_INFO_ITEM_STAT == 3) {
      borderClass = 'border-warning';
    } else if (item.ID_TECN_INFO_ITEM_STAT == 4) {
      borderClass = 'border-primary';
    }

    return borderClass;
  }

  onExport(): void {
    let data = new Date().toLocaleDateString().split('/'),
      dataExport = `${data[0]}${data[1]}${data[2]}`;

    let listagemExport: any = [];
    listagemExport = this.totalItens;

    this.xlsxService.exportFile(listagemExport, `Controle_Itens_${dataExport}`);
  }
}
