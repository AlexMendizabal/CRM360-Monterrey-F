//angular
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';

//servicos
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ConfirmModalService } from './../../../../../shared/modules/confirm-modal/confirm-modal.service';
import { DetailPanelService } from './../../../../../shared/templates/detail-panel/detal-panel.service';
import { LogisticaEntradaMateriaisTiposConformidadeService } from '../services/tipos-conformidade.service';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { XlsxService } from 'src/app/shared/modules/xlsx/xlsx.service';
import { DateService } from 'src/app/shared/services/core/date.service';

// rxjs
import { finalize, take, switchMap } from 'rxjs/operators';
import { Subscription, EMPTY } from 'rxjs';

//modelos
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { BsModalRef } from 'ngx-bootstrap';
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';
import { CustomTableConfig } from './../../../../../shared/templates/custom-table/models/config';

//Interfaces
import { ILogisticaEntradaMateriaisTiposConformidade } from './../models/tiposConformidade';


@Component({
  selector: 'logistica-entrada-materiais-tipos-conformidade-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class LogisticaEntradaMateriaisTiposConformidadeListaComponent
  implements OnInit, OnDestroy {
    
  breadCrumbTree: Array<Breadcrumb>;
  idSubModulo: number;
  noResult: boolean;
  noResponsaveis: boolean;
  modalRef: BsModalRef;
  form: FormGroup;
  showDetailPanelSubscription: Subscription;
  showDetailPanel = false;
  $activatedRouteSubscription: Subscription;
  ORDE_BY = 'ID_LOGI_ENMA_FHNC_TIPO';
  ORDE_TYPE = 'desc';
  //LOADINGS
  loading = true; 
  loadingNavBar = false;
  loadingResponsaveis = false;

  //VARIAVEIS
  responsaveis = [];
  totalItens: any = [];
  tiposConformidade: Array<ILogisticaEntradaMateriaisTiposConformidade>;
  tipoSelecionado: ILogisticaEntradaMateriaisTiposConformidade;

  // CUSTOM TABLE
  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
  };

  // Tipos de Situação dos TiposConformidade (Ativo/Inativo)
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

 // Tipos de Categorias
  categorias = [
    {
      cod: '1',
      nome: 'Qualidade',
    },
    {
      cod: '2',
      nome: 'Quantidade',
    },
  ];

  // Subtitles (Ativo/Inativo)
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
    private tiposConformidadeService: LogisticaEntradaMateriaisTiposConformidadeService,
    private formBuilder: FormBuilder,
    private xlsxService: XlsxService,
    private confirmModalService: ConfirmModalService,
    private routerService: RouterService,
    private dateService: DateService,
    private detailPanelService: DetailPanelService
  ) {}

  ngOnInit() {
    this.buildForm();
    this.setBreadCrumb();
    this.onActivatedRoute();
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
        this.getTiposConformidade(this.getParams());
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

  buildForm() {
    this.form = this.formBuilder.group({
      ID_LOGI_ENMA_FHNC_TIPO: [null],
      NM_TIPO: [null],
      IN_STAT: [null],
      DS_OBSE: [null],
      NR_MATR: [null],
      NM_USUA: [null],
      DT_INCL: [null],
      DT_ATUA: [null],
      PAGI: [1],
      TT_REGI_PAGI: [this.itemsPerPage],
      TIME: [new Date().getTime()],
      ORDE_BY:[this.ORDE_BY],
      ORDE_TYPE:[this.ORDE_TYPE],
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
        routerLink: `/logistica/home`,
      },
      {
        descricao: 'Entrada de Materiais',
        routerLink: `/logistica/entrada-materiais/${id}`,
      },
      {
        descricao: 'Tipos de Não Conformidade',
      },
    ];
  }

  onFilter() {
    this.detailPanelService.hide();
    this.form.get('PAGI').setValue(1);
    this.form.get('TIME').setValue(new Date().getTime());
    this.form.get('ORDE_TYPE').setValue(this.ORDE_TYPE);
    this.form.get('ORDE_BY').setValue(this.ORDE_BY);
    this.route.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams()),
    });
  }

  onDetails(tipo: ILogisticaEntradaMateriaisTiposConformidade): void {
    this.loadingNavBar = true;
    this.tipoSelecionado = tipo;
    this.getResponsaveis({ ID_LOGI_ENMA_FHNC_TIPO: tipo.ID_LOGI_ENMA_FHNC_TIPO , IN_STAT:'1'});
    this.detailPanelService.show();
    this.detailPanelService.loadedFinished(false);

    setTimeout(() => {
      this.loadingNavBar = false;
    }, 500);
  }

  getTiposConformidade(params?) {
    if (!this.loading) this.loadingNavBar = true;
    this.tiposConformidadeService
      .getTiposConformidade(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.tiposConformidade = response.body['data'];
            this.totalItems = response.body['total'];
            this.noResult = false;
          } else {
            this.noResult = true;
            this.tiposConformidade = [];
          }
        },
        (error: any) => {
          try {
            this.pnotify.error(error.error.message);
          } catch (error) {
            this.pnotify.error();
          }
        });
  }


  getResponsaveis(params?) {
    this.loadingResponsaveis = true;
    this.tiposConformidadeService
      .getResponsaveis(params)
      .pipe(
        finalize(() => {
          this.loadingResponsaveis = false;
        })
      )
      .subscribe(async (response) => {
        if (response.status !== 200) {
          this.noResponsaveis =true;
          return;
        }
        this.responsaveis = response['body']['data'];
        this.noResponsaveis = false
      },
      (error) => {
        this.pnotify.error('Não foi encontrado nenhum responsável');
        this.noResponsaveis =true;
      }
    );
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

  classStatusBorder(status: ILogisticaEntradaMateriaisTiposConformidade): string {
    let borderClass: string;

    if (status.IN_STAT == 1) {
      borderClass = 'border-success';
    } else if (status.IN_STAT == 0) {
      borderClass = 'border-danger';
    }

    return borderClass;
  }

  changeType(status: ILogisticaEntradaMateriaisTiposConformidade) {
    const stat = status.IN_STAT == 1 ? 0 : 1;

    this.confirmChange(stat)
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) => {
          if (!result) return EMPTY;

          this.loadingNavBar = true;
          status.IN_STAT = stat;
          return this.tiposConformidadeService.postTiposConformidade(status);
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
          status.IN_STAT = status.IN_STAT == 1 ? 0 : 1;
          this.pnotify.error();
        }
      );
  }

  confirmChange(stat): any {
    if (stat == 1)
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

  onExport(): void {
    let data = new Date().toLocaleDateString().split('/'),
      dataExport = `${data[0]}${data[1]}${data[2]}`;

    let listagemExport: any = [];
    listagemExport = this.tiposConformidade.concat(this.totalItens);

    this.xlsxService.exportFile(listagemExport, `TiposConformidade${dataExport}`);
  }

  setOrderBy(column: string): void {
    if (this.ORDE_BY === column) {
      if (this.ORDE_TYPE == 'desc') {
        this.ORDE_TYPE = 'asc';
      } else if (this.ORDE_TYPE == 'asc') {
        this.ORDE_TYPE = 'desc';
      }
    } else {
      this.ORDE_BY = column;
      this.ORDE_TYPE = 'asc';
    }
    this.onFilter();
  }
}
