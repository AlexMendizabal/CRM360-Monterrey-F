import { CustomTableConfig } from './../../../../../../shared/templates/custom-table/models/config';
import { Router, ActivatedRoute } from '@angular/router';
import { PNotifyService } from './../../../../../../shared/services/core/pnotify.service';
import { RouterService } from './../../../../../../shared/services/core/router.service';
import { DateService } from './../../../../../../shared/services/core/date.service';
import { DetailPanelService } from 'src/app/shared/templates/detail-panel/detal-panel.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';

import { FormGroup, FormBuilder } from '@angular/forms';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ComercialIntegracoesDagdaServicesAssociacaoCondicoesPagamento } from '../../services/associacao-condicoes-pagamento.service';
import { Subscription, EMPTY } from 'rxjs';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { take, switchMap, finalize } from 'rxjs/operators';

@Component({
  selector: 'lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
  providers: [DetailPanelService],
})
export class ComercialIntegracoesDagdaIntegracaoCondicoesPagamentoListaComponent
  implements OnInit, OnDestroy
{
  currentUser: any = JSON.parse(localStorage.getItem('currentUser'));
  idMtcorp: any = this.currentUser['info']['id'];
  spinnerFullScreen: boolean = true;
  loaderNavbar: boolean = false;
  breadCrumbTree: any = [];
  items: any = [];
  form: FormGroup;
  $activateRoutedSubscription: Subscription;
  data: Date = new Date();
  dadosEmpty = false;
  dadosEmptyDetalhes = false;
  dadosLoaded = false;
  showTable = false;

  itemSelecionado: any = {
    codigoTid: null,
    descricaoTid: null,
    codigoDagda: null,
    descricaoDagda: null,
  };
  isDetailOpen = false;

  appTitle = 'Integração de Condições de Pagamentos';
  panelTitle = 'Associações';

  /* Paginação */
  itemsPerPage = 10;
  totalItems: number;
  currentPage = 1;
  begin = 0;
  end: number = this.itemsPerPage;

  orderBy = 'codigoTid';
  orderType = 'DESC';

  /* Config Table */
  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
  };

  /* Painel de detalhes */
  $showDetailPanelSubscription: Subscription;
  showDetailPanel = false;

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private dateService: DateService,
    private localeService: BsLocaleService,
    private routerService: RouterService,
    private pnotify: PNotifyService,
    private route: Router,
    private detailPanelService: DetailPanelService,
    private associacaoService: ComercialIntegracoesDagdaServicesAssociacaoCondicoesPagamento,
    private confirmModalService: ConfirmModalService
  ) {
    this.localeService.use('pt-br');

    this.form = this.formBuilder.group({
      codigoTid: [null],
      descricaoTid: [null],
      codigoDagda: [null],
      descricaoDagda: [null],
      registros: 10,
      pagina: this.currentPage,
      orderBy: this.orderBy,
      orderType: this.orderType,
      time: [new Date().getTime()],
    });
  }

  // Busca todas as associações
  getAssociacoes(params?: any) {
    this.totalItems = 0;
    this.associacaoService
      .getAssociacoes(params)
      .pipe(
        finalize(() => {
          this.spinnerFullScreen = false;
          this.loaderNavbar = false;
          this.dadosLoaded = true;
        })
      )
      .subscribe({
        next: (response) => {
          if (response.status != 200) {
            this.dadosEmpty = true;
            this.pnotify.notice('Nenhum resgistro foi encontrado!');
            this.showTable = false;
            return;
          }

          this.items = response.body['data'];
          this.totalItems = response.body['data'].length;
        },
        error: (error) => this.pnotify.error(),
      });
  }

  ngOnInit(): void {
    this.setBreadCrumb();
    this.getActiveRoute();
    this.onSubscription();
  }

  ngOnDestroy() {
    this.$activateRoutedSubscription.unsubscribe();
    this.$showDetailPanelSubscription.unsubscribe();
  }

  onConfirmDelete(item) {
    this.confirmDelete()
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) => (result ? this.onDelete(item) : EMPTY)),
        finalize(() => {
          this.loaderNavbar = true;
        })
      )
      .subscribe(
        (success: any) => {
          this.pnotify.success();
          this.onFilter();
        },
        (error: any) => {
          this.pnotify.error();
        }
      );
  }

  async onDelete(item) {
    const params: any = {
      ...item,
      exclusao: 1,
    };
    this.associacaoService.createAssociacao(params).subscribe({
      next: (response) => {
        console.log(response);
        this.loaderNavbar = false;
        if (response.status != 200) {
          this.pnotify.notice('Ocorreu um erro ao realizar a associação!');
          return;
        }
      },
      error: (error) => this.pnotify.error(),
    });
  }

  confirmDelete(): any {
    return this.confirmModalService.showConfirm(
      'inactivate',
      'Confirmar Exclusão',
      'Deseja realmente prosseguir com a exclusão do registro?',
      'Cancelar',
      'Confirmar'
    );
  }

  onFilter() {
    this.showTable = true;
    this.form.get('time').setValue(new Date().getTime());
    this.loaderNavbar = true;
    this.detailPanelService.hide();
    if (this.form.value['registros']) {
      this.itemsPerPage = this.form.value['registros'];
      this.end = this.form.value['registros'];
    }
    this.route.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams()),
    });
  }

  getActiveRoute() {
    this.spinnerFullScreen = true;
    this.$activateRoutedSubscription =
      this.activatedRoute.queryParams.subscribe((response) => {
        if (Object.keys(response).length > 0) {
          const _response = this.routerService.getBase64UrlParams(response);
          this.form.patchValue(_response);
        }

        this.getAssociacoes(this.getParams());
        if (response.q) {
          this.showTable = true;
        }
      });
  }

  setBreadCrumb() {
    const id = this.activatedRoute.snapshot.params.idSubModulo;
    this.breadCrumbTree = [
      {
        descricao: 'Home',
        routerLink: `/comercial/home`,
      },
      {
        descricao: 'Integração Dagda',
        routerLink: `/comercial/integracoes/dagda/${id}`,
      },
      {
        descricao: this.appTitle,
      },
    ];
  }

  /* Paginação */
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
          _params[prop] = this.dateService
            .convertToBrazilianDate(_obj[prop])
            .substring(0, 10);
        else _params[prop] = _obj[prop];
      }
    }

    return _params;
  }

  setOrderBy(column: string): void {
    if (this.orderBy === column) {
      if (this.orderType == 'desc') {
        this.orderType = 'asc';
      } else if (this.orderType == 'asc') {
        this.orderType = 'desc';
      }
    } else {
      this.orderBy = column;
      this.orderType = 'asc';
    }
    this.form.get('orderBy').setValue(this.orderBy);
    this.form.get('orderType').setValue(this.orderType);
    this.onFilter();
  }

  onEdit(item) {
    this.route.navigate(['./', item.id], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(item),
    });
  }

  onSubscription() {
    this.$showDetailPanelSubscription =
      this.detailPanelService.config.subscribe((event: any) => {
        this.showDetailPanel = event.showing;
      });
  }

  onDetailPanel(item): void {
    this.detailPanelService.show();
    this.itemSelecionado = item;
    this.dadosEmptyDetalhes = false;
    this.detailPanelService.loadedFinished(false);
    this.isDetailOpen = true;
  }
}
