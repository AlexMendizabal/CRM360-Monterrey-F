import { LogisticaYmsTiposSetorService } from './../../tipos-setor/services/tipos-setor.service';
import { ILogisticaYmsTiposSetor } from './../../tipos-setor/models/tipos-setor';
//angular
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Data } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';

//servicos
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ConfirmModalService } from './../../../../../shared/modules/confirm-modal/confirm-modal.service';
import { DetailPanelService } from './../../../../../shared/templates/detail-panel/detal-panel.service';
import { LogisticaYmsSetoresService } from '../services/setores.service';
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
import { ILogisticaYmsSetores } from './../models/setores';
import { LogisticaFiliaisService } from '../../../cadastros/filiais/services/filiais.service';


@Component({
  selector: 'logistica-yms-setores-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class LogisticaYmsSetoresListaComponent
  implements OnInit, OnDestroy {
    
  breadCrumbTree: Array<Breadcrumb>;
  idSubModulo: number;
  noResult: boolean;
  loadingSetores: boolean;
  modalRef: BsModalRef;
  form: FormGroup;
  showDetailPanelSubscription: Subscription;
  showDetailPanel = false;
  $activatedRouteSubscription: Subscription;

  //LOADINGS
  loading = true; 
  loadingNavBar = false;
  loadingTiposSetor: boolean;
  loadingFilial: boolean;
  loadingAssociacaoMateriais: boolean;
  loadingAssociacaoIntervalos: boolean;

  //VARIAVEIS
  noAssocIntervalos: boolean
  associacaoIntervalos: Array<ILogisticaYmsSetores>;
  noAssocMateriais: boolean
  associacaoMateriais: Array<ILogisticaYmsSetores>;
  totalItens: any = [];
  filial = []
  filterSetores: Array<ILogisticaYmsSetores>;
  setores: Array<ILogisticaYmsSetores>;
  setorSelecionado: ILogisticaYmsSetores;
  tiposSetor: Array<ILogisticaYmsTiposSetor>;

  // CUSTOM TABLE
  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
  };

  tableConfigAssocMateriais: Partial<CustomTableConfig> = {
    fixedHeader: false,
    bodyHeight: 230,
    hover: false,
  };

  tableConfigAssocIntervalos: Partial<CustomTableConfig> = {
    fixedHeader: false,
    bodyHeight: 230,
    hover: false,
  };

  // Tipos de Situação dos Setores (Ativo/Inativo)
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
    private formBuilder: FormBuilder,
    private xlsxService: XlsxService,
    private dateService: DateService,
    private routerService: RouterService,
    private activatedRoute: ActivatedRoute,
    private detailPanelService: DetailPanelService,
    private confirmModalService: ConfirmModalService,
    private setoresService: LogisticaYmsSetoresService,
    private filiaisService: LogisticaFiliaisService,
    private tiposSetorService: LogisticaYmsTiposSetorService,
  ) {}

  ngOnInit() {
    this.buildForm();
    this.setBreadCrumb();
    this.onActivatedRoute();
    this.onDetailPanelEmitter();
    this.getFilterSetores();
    this.getTiposSetor();
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
          this.getSetores(this.getParams());
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
      UUID_LOGI_YMS_SETO: [null],
      NM_SETO: [null],
      UUID_LOGI_YMS_SETO_TIPO: [null],
      NM_SETO_TIPO: [null],
      IN_STAT: [null],
      DS_OBSE: [null],
      NR_MATR: [null],
      NM_USUA: [null],
      DT_INCL: [null],
      DT_ATUA: [null],
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
        routerLink: `/logistica/home`,
      },
      {
        descricao: 'YMS',
        routerLink: `/logistica/yms/${id}`,
      },
      {
        descricao: 'Setores',
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

  onDetails(setores: ILogisticaYmsSetores): void {
    this.getIntervalos({UUID_LOGI_YMS_SETO: setores.UUID_LOGI_YMS_SETO})
    this.getMateriaisAssociados({UUID_LOGI_YMS_SETO: setores.UUID_LOGI_YMS_SETO});
    this.detailPanelService.show();
    this.setorSelecionado = setores;
    this.detailPanelService.loadedFinished(false);
  }

  getIntervalos(params?) {
    params.IN_STAT = '1';
    params.IN_PAGI = '0';
    params.ORDE_BY = 'ID_REFE_ERP'
    params.ORDE_TYPE = 'desc'

    this.loadingAssociacaoIntervalos = true;
    this.setoresService
      .getIntervalos(params)
      .pipe(
        finalize(() => {
          this.loadingAssociacaoIntervalos = false;
        })
      )
      .subscribe(response => {
        if (response.status === 200) {
          this.associacaoIntervalos = response.body['data'];

          if (this.associacaoIntervalos.length > 9) {
            this.tableConfigAssocIntervalos.fixedHeader = true;
          }

          this.noAssocIntervalos = false
        } else {
          this.pnotify.notice('Nenhuma associação encontrada!');
          this.noAssocIntervalos = true
          this.associacaoIntervalos = [];
        }
      },
      (error) => {
        this.pnotify.error();
      }
    );
  }

  getMateriaisAssociados(params){
    this.loadingAssociacaoMateriais = true;
    params.IN_STAT = '1';
    params.IN_PAGI = '0';
    params.ORDE_BY = 'ID_REFE_ERP'
    params.ORDE_TYPE = 'desc'
    console.log(params)
    this.setoresService
      .getMateriaisAssociados(params)
      .pipe(
        finalize(() => {
          this.loadingAssociacaoMateriais = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.associacaoMateriais = response.body['data'];

            if (this.associacaoMateriais.length > 9) {
              this.tableConfigAssocMateriais.fixedHeader = true;
            }

            this.noAssocMateriais = false
          } else {
            this.pnotify.notice('Nenhuma associação encontrada!');
            this.noAssocMateriais = true
            this.associacaoMateriais = [];
          }
        },
        (error) => {
          this.pnotify.error();
        }
      );
  }



  getSetores(params?) {
    if (!this.loading) this.loadingNavBar = true;
    this.setoresService
      .getSetores(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.setores = response.body['data'];
            this.totalItems = response.body['total'];
            this.noResult = false;
          } else {
            this.noResult = true;
            this.setores = [];
          }
        },
        (error: any) => {
          this.noResult = true;
          const message = error.error.message
          message ? this.pnotify.error(message): this.pnotify.error();
        }
      );
  }

  getFilterSetores(params?: Partial<ILogisticaYmsSetores>) {
    const _params = params ?? {};
    _params.IN_STAT = 1;
    _params.IN_PAGI = 0;
    this.loadingSetores = true;
    this.setoresService
      .getSetores(_params)
      .pipe(
        finalize(() => {
          this.loadingSetores = false;
        })
      )
      .subscribe((response) => {
        if (response.status === 200) {
          this.filterSetores = response.body['data'];
        }else{
          this.pnotify.notice('Nenhum registro encontrado!')
        }
      },
      (error: any) => {
        const message = error.error.message
        message ? this.pnotify.error(message): this.pnotify.error();
      }
    );
  }

  getTiposSetor() {
    this.loadingTiposSetor = true;
    this.tiposSetorService
      .getTiposSetor({ IN_STAT: '1', IN_PAGI: '0' })
      .pipe(
        finalize(() => {
          this.loadingTiposSetor = false;
        })
      )
      .subscribe((response) => {
        if (response.status === 200) {
          this.tiposSetor = response.body['data'];
        }else{
          this.pnotify.notice('Nenhum registro encontrado!')
        }
      },
      (error: any) => {
        const message = error.error.message
        message ? this.pnotify.error(message): this.pnotify.error();
      }
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

  classStatusBorder(setores: ILogisticaYmsSetores): string {
    let borderClass: string;

    if (setores.IN_STAT == 1) {
      borderClass = 'border-success';
    } else if (setores.IN_STAT == 2) {
      borderClass = 'border-danger';
    }

    return borderClass;
  }

  changeType(params: ILogisticaYmsSetores) {
    const stat = params.IN_STAT == 1 ? 0 : 1;

    this.confirmChange(stat)
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) => {
          if (!result) return EMPTY;

          this.loadingNavBar = true;
          params.IN_STAT = stat;
          return this.setoresService.postSetores(params);
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
          params.IN_STAT = params.IN_STAT == 1 ? 0 : 1;
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
    listagemExport = this.setores.concat(this.totalItens);

    this.xlsxService.exportFile(listagemExport, `Setores${dataExport}`);
  }
  convertMysqlTime(time: string) {
    return this.dateService.convertMysqlTime(time);
  }
}
