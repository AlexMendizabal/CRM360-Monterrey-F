import { TecnologiaInformacaoEstoqueService } from './../../services/estoque.service';
import { CustomTableConfig } from './../../../../../shared/templates/custom-table/models/config';
import { ConfirmModalService } from './../../../../../shared/modules/confirm-modal/confirm-modal.service';
//angular
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';

//servicos
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { TecnologiaInformacaoEstoqueNivelEstoqueService } from '../services/nivel-estoque.service';
import { RouterService } from 'src/app/shared/services/core/router.service';

// rxjs
import { finalize, take, switchMap } from 'rxjs/operators';
import { Subscription, EMPTY } from 'rxjs';

//modelos
import { Subtitles } from './../../../../../shared/modules/subtitles/subtitles';
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { DateService } from 'src/app/shared/services/core/date.service';

import { ITecnologiaInformacaoNivelEstoque } from './../models/nivelEstoque';
import { ITecnologiaInformacaoEstoqueProduto } from '../../produtos/models/produto';
import { TecnologiaInformacaoEstoqueProdutosService } from '../../produtos/services/produtos.service';
@Component({
  selector: 'tecnologia-informacao-deposito-nivel-estoque-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class TecnologiaInformacaoEstoqueNivelEstoqueListaComponent
  implements OnInit, OnDestroy {
  breadCrumbTree: Array<Breadcrumb>;

  idSubModulo: number;
  niveisEstoque: ITecnologiaInformacaoNivelEstoque[] = [];
  empresas = [];
  produtos: Array<ITecnologiaInformacaoEstoqueProduto> = [];
  niveisEstoqueSelecionado: ITecnologiaInformacaoNivelEstoque;
  noResult: boolean;
  loadingEmpresas: boolean;
  loadingProdutos: boolean;
  loading = true; //Loading FullPage
  loadingNavBar = false; //Loading do NAVBAR
  $activatedRouteSubscription: Subscription;
  tableConfig: Partial<CustomTableConfig> = { subtitleBorder: true };
  form: FormGroup;

  // Tipos de Situação dos NivelEstoque (Ativo/Inativo)
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
    private estoqueService: TecnologiaInformacaoEstoqueService,
    private produtosService:TecnologiaInformacaoEstoqueProdutosService,
    private nivelEstoqueService: TecnologiaInformacaoEstoqueNivelEstoqueService,
    private formBuilder: FormBuilder,
    private confirmModalService: ConfirmModalService,
    private routerService: RouterService,
    private dateService: DateService
  ) {}

  ngOnInit() {
    this.buildForm();
    this.getEmpresas();
    this.getProdutos();
    this.setBreadCrumb();
    this.onActivatedRoute();
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
          this.getNiveisEstoque(this.getParams());
      }
    );
  }

  buildForm() {
    this.form = this.formBuilder.group({
      ID_TEIN_ESTO_NIVL: [null],
      ID_TEIN_ESTO_PROD: [null],
      TT_ESTO_MXMO: [null],
      TT_ESTO_MNMO: [null],
      TT_ESTO_ATUA: [null],
      NM_PROD: [null],
      NM_EMPR: [null],
      UUID_EMPR: [null],
      ID_TEIN_ESTO_PRTP: [null],
      ID_TEIN_ESTO_PRMO: [null],
      IN_STAT: [null],
      TT_REGI_PAGI: [this.itemsPerPage],
      PAGI: [1],
      TIME: [new Date().getTime()],
    });
  }

  setPageRegistros(itemsPerPage) {
    this.itemsPerPage = itemsPerPage;
    this.onFilter();
  }



  getProdutos(params?: Partial<ITecnologiaInformacaoEstoqueProduto>) {
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
            this.produtos = response.body['data'];
          } else {
            this.produtos = [];
          }
        },
        (error) => {
          this.pnotify.error();
        }
      );
  }


  getEmpresas(params?) {
    const _params = params ?? {};
    _params.IN_STAT = '1';
    _params.TT_REGI_PAGI = '1000000';

    this.estoqueService
      .getEmpresas(_params)
      .pipe(
        finalize(() => {
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.empresas = response.body['result'];
          } else {
            this.empresas = [];
          }
        },
        (error) => {
          this.pnotify.error();
        }
      );
  }

  getNiveisEstoque(params?) {
    if (!this.loading) this.loadingNavBar = true;
    this.nivelEstoqueService
      .getNiveisEstoque(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.niveisEstoque = response.body['data'];
            this.totalItems = response.body['total'];
            this.noResult = false;
          } else {
            this.noResult = true;
            this.niveisEstoque = [];
          }
        },
        (error) => {
          this.pnotify.error();
          this.noResult = true;
        }
      );
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
        descricao: 'Nivel de Estoque',
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

  changeType(deposito: ITecnologiaInformacaoNivelEstoque) {
    const stat = deposito.IN_STAT == '1' ? '0' : '1';

    this.confirmChange(stat)
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) => {
          if (!result) return EMPTY;

          this.loadingNavBar = true;
          deposito.IN_STAT = stat;
          return this.nivelEstoqueService.postNiveisEstoque(deposito);
        }),
        finalize(() => {
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (success: any) => {
          this.pnotify.success();
          //tipoContrato.IN_STAT = stat;
        },
        (error: any) => {
          deposito.IN_STAT = deposito.IN_STAT == '1' ? '0' : '1';
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

  openRegister(deposito: ITecnologiaInformacaoNivelEstoque) {
    this.route.navigate(['../', deposito.ID_TEIN_ESTO_NIVL], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(deposito),
    });
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
