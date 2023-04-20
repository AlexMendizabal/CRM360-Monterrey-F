import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { ConfirmModalService } from './../../../../../shared/modules/confirm-modal/confirm-modal.service';
//angular
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';

//servicos
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { TecnologiaInformacaoEstoqueTipoProdutosService } from '../services/tipo-produto.service';
import { RouterService } from 'src/app/shared/services/core/router.service';

// rxjs
import { finalize, take, switchMap } from 'rxjs/operators';
import { Subscription, EMPTY } from 'rxjs';

//modelos
import { Subtitles } from './../../../../../shared/modules/subtitles/subtitles';
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { DateService } from 'src/app/shared/services/core/date.service';

import { ITecnologiaInformacaoTipoProduto } from './../models/tipoProduto';
import { PageChangedEvent } from 'ngx-bootstrap';
@Component({
  selector: 'tecnologia-informacao-estoque-tipo-produto-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class TecnologiaInformacaoEstoqueTipoProdutosListaComponent
  implements OnInit, OnDestroy {
  breadCrumbTree: Array<Breadcrumb>;

  idSubModulo: number;
  tipoProdutos: ITecnologiaInformacaoTipoProduto[] = [];
  noResult: boolean;
  loading = true; //Loading FullPage
  loadingNavBar = false; //Loading do NAVBAR
  
  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
    border: true,
  };
  $activatedRouteSubscription: Subscription;

  form: FormGroup;

  // Tipos de Situação dos Tipos de Produtos (Ativo/Inativo)
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
    private tipoProdutoService: TecnologiaInformacaoEstoqueTipoProdutosService,
    private formBuilder: FormBuilder,
    private confirmModalService: ConfirmModalService,
    private routerService: RouterService,
    private dateService: DateService
  ) {}

  ngOnInit() {
    this.buildForm();
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
        this.getTiposProduto(this.getParams());
      }
    );
  }

  setPageRegistros(itemsPerPage) {
    this.itemsPerPage = itemsPerPage;
    this.onFilter();
  }

  buildForm() {
    this.form = this.formBuilder.group({
      ID_TEIN_ESTO_PRTP: [null],
      NM_TIPO: [null],
      IN_STAT: [null],
      PAGI: [1],
      TT_REGI_PAGI: [this.itemsPerPage],
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
        descricao: 'Estoque',
        routerLink: `/tecnologia-informacao/estoque/${id}`,
      },
      {
        descricao: 'Tipo de Produto',
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

  getTiposProduto(params?) {
    if (!this.loading) this.loadingNavBar = true;

    this.tipoProdutoService
      .getTiposProduto(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.tipoProdutos = response.body['data'];
            this.totalItems = response.body['total'];
            this.noResult = false;
          } else {
            this.noResult = true;
            this.tipoProdutos = [];
          }
        },
        (error) => {
          this.pnotify.error();
          this.noResult = true;
        }
      );
  }

  changeType(tipoProduto: ITecnologiaInformacaoTipoProduto) {
    const stat = tipoProduto.IN_STAT == '1' ? '0' : '1';

    this.confirmChange(stat)
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) => {
          if (!result) return EMPTY;

          this.loadingNavBar = true;
          tipoProduto.IN_STAT = stat;
          return this.tipoProdutoService.postTipoProduto(tipoProduto);
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
          tipoProduto.IN_STAT = tipoProduto.IN_STAT == '1' ? '0' : '1';
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
