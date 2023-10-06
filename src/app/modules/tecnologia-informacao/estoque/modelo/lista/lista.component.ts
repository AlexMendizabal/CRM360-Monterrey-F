import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { TecnologiaInformacaoEstoqueTipoProdutosService } from '../../tipo-produto/services/tipo-produto.service';
import { ConfirmModalService } from './../../../../../shared/modules/confirm-modal/confirm-modal.service';
//angular
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';

//servicos
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { TecnologiaInformacaoEstoqueModeloService } from '../services/modelo.service';
import { RouterService } from 'src/app/shared/services/core/router.service';

// rxjs
import { finalize, take, switchMap } from 'rxjs/operators';
import { Subscription, EMPTY } from 'rxjs';

//modelos
import { Subtitles } from './../../../../../shared/modules/subtitles/subtitles';
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { DateService } from 'src/app/shared/services/core/date.service';

import { ITecnologiaInformacaoEstoqueModelo } from './../models/modelo';
import { ITecnologiaInformacaoTipoProduto } from '../../tipo-produto/models/tipoProduto';
import { PageChangedEvent } from 'ngx-bootstrap';

@Component({
  selector: 'tecnologia-informacao-estoque-produtos-modelo-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class TecnologiaInformacaoEstoqueModeloListaComponent
  implements OnInit, OnDestroy {
  breadCrumbTree: Array<Breadcrumb>;

  idSubModulo: number;
  modelos: Array<ITecnologiaInformacaoEstoqueModelo>;
  noResult: boolean;
  loading = true; //Loading FullPage
  loadingNavBar = false; //Loading do NAVBAR
  loadingTipoProduto = false;
  tipoProduto: ITecnologiaInformacaoTipoProduto[] = [];

  $activatedRouteSubscription: Subscription;
  
  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
    border: true,
  };

  form: FormGroup;

  // Tipos de Situação dos Modelos (Ativo/Inativo)
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
    private modeloService: TecnologiaInformacaoEstoqueModeloService,
    private formBuilder: FormBuilder,
    private confirmModalService: ConfirmModalService,
    private routerService: RouterService,
    private dateService: DateService,
    private tipoProdutoService: TecnologiaInformacaoEstoqueTipoProdutosService
  ) {}

  ngOnInit() {
    this.buildForm();
    this.setBreadCrumb();
    this.onActivatedRoute();
    this.getTiposProduto();
  }

  ngOnDestroy() {
    this.$activatedRouteSubscription.unsubscribe();
  }

  getTiposProduto() {
    this.loadingTipoProduto = true;
    this.tipoProdutoService
      .getTiposProduto({ IN_STAT: '1', IN_PAGI: '0' })
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

  onActivatedRoute() {
    this.$activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (response) => {
        const _response = this.routerService.getBase64UrlParams(response);
        this.form.patchValue(_response);
        if (_response.hasOwnProperty('TT_REGI_PAGI'))
          this.itemsPerPage = _response.TT_REGI_PAGI;
        this.getModelos(this.getParams());
      }
    );
  }

  buildForm() {
    this.form = this.formBuilder.group({
      ID_TEIN_ESTO_PRTP: [null],
      ID_TEIN_ESTO_PRMO: [null],
      NM_MODE: [null],
      NM_TIPO: [null],
      IN_STAT: [null],
      PAGI: [1],
      TT_REGI_PAGI: [this.itemsPerPage],
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
        descricao: 'Inventario',
        routerLink: `/tecnologia-informacao/estoque/${id}`,
      },
      {
        descricao: 'Modelos',
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


  getModelos(params?) {
    if (!this.loading) this.loadingNavBar = true;

    this.modeloService
      .getModelos(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.modelos = response.body['data'];
            this.totalItems = response.body['total'];
            this.noResult = false;
          } else {
            this.noResult = true;
            this.modelos = [];
          }
        },
        (error) => {
          this.pnotify.error();
          this.noResult = true;
        }
      );
  }

  changeType(modelos: ITecnologiaInformacaoEstoqueModelo) {
    const stat = modelos.IN_STAT == '1' ? '0' : '1';

    this.confirmChange(stat)
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) => {
          if (!result) return EMPTY;

          this.loadingNavBar = true;
          modelos.IN_STAT = stat;
          return this.modeloService.postModelo(modelos);
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
          modelos.IN_STAT = modelos.IN_STAT == '1' ? '0' : '1';
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
