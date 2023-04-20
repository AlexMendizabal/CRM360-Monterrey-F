import { ConfirmModalService } from './../../../../../shared/modules/confirm-modal/confirm-modal.service';
//angular
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';

//servicos
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { TecnologiaInformacaoCadastroTipoItemService } from '../services/tipo-item.service';
import { RouterService } from 'src/app/shared/services/core/router.service';

// rxjs
import { finalize, take, switchMap } from 'rxjs/operators';
import { Subscription, EMPTY } from 'rxjs';

//modelos
import { Subtitles } from './../../../../../shared/modules/subtitles/subtitles';
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { DateService } from 'src/app/shared/services/core/date.service';

import { ITecnologiaInformacaoTipoItem } from './../models/tipoItem';
import { PageChangedEvent } from 'ngx-bootstrap';
@Component({
  selector: 'tecnologia-informacao-cadastros-tipo-item-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class TecnologiaInformacaoCadastrosTipoItemListaComponent
  implements OnInit, OnDestroy {
  breadCrumbTree: Array<Breadcrumb>;

  idSubModulo: number;
  tipoItems: ITecnologiaInformacaoTipoItem[] = [];
  noResult: boolean;
  loading = true; //Loading FullPage
  loadingNavBar = false; //Loading do NAVBAR

  $activatedRouteSubscription: Subscription;

  form: FormGroup;

  // Tipos de Situação dos Tipos de Items (Ativo/Inativo)
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
  itemsPerPage: number = 10;
  totalItems: number;
  currentPage: number = 1;
  begin: number = 0;
  end: number = 10;
  /* Pagination */

  constructor(
    private route: Router,
    private pnotify: PNotifyService,
    private activatedRoute: ActivatedRoute,
    private tipoItemService: TecnologiaInformacaoCadastroTipoItemService,
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
        this.getTipoItem(this.getParams());
      }
    );
  }

  buildForm() {
    this.form = this.formBuilder.group({
      ID_TECN_INFO_ITEM_TIPO: [null],
      NM_ITEM_TIPO: [null],
      IN_STAT: [null],
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
        descricao: 'Contratos',
        routerLink: `/tecnologia-informacao/contratos/${id}`,
      },
      {
        descricao: 'Tipo de Item',
      },
    ];
  }

  onFilter() {
    this.form.get('TIME').setValue(new Date().getTime());
    this.route.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams()),
    });
  }

  getTipoItem(params?) {
    if (!this.loading) this.loadingNavBar = true;

    this.tipoItemService
      .getTipoItem(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.tipoItems = response.body['data'];
            this.totalItems = response.body['total'];
            this.noResult = false;
          } else {
            this.noResult = true;
            this.tipoItems = [];
          }
        },
        (error) => {
          this.pnotify.error();
          this.noResult = true;
        }
      );
  }

  changeType(tipoItem: ITecnologiaInformacaoTipoItem) {
    const stat = tipoItem.IN_STAT == '1' ? '0' : '1';

    this.confirmChange(stat)
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) => {
          if (!result) return EMPTY;

          this.loadingNavBar = true;
          tipoItem.IN_STAT = stat;
          return this.tipoItemService.postTipoItem(tipoItem);
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
          tipoItem.IN_STAT = tipoItem.IN_STAT == '1' ? '0' : '1';
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

  openRegister(tipoItem: ITecnologiaInformacaoTipoItem) {
    this.route.navigate(['../', tipoItem.ID_TECN_INFO_ITEM_TIPO], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(tipoItem),
    });
  }

  onPageChanged(event: PageChangedEvent): void {
    this.begin = (event.page - 1) * event.itemsPerPage;
    this.end = event.page * event.itemsPerPage;
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
