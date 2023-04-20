import { ILogisticaYmsSetores } from './../../setores/models/setores';
import { ILogisticaYmsCircuitos } from './../../circuitos/models/circuitos';
import { LogisticaYmsSetoresService } from './../../setores/services/setores.service';
import { LogisticaYmsCircuitosService } from './../../circuitos/services/circuitos.service';
//angular
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';

//servicos
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ConfirmModalService } from './../../../../../shared/modules/confirm-modal/confirm-modal.service';
import { DetailPanelService } from './../../../../../shared/templates/detail-panel/detal-panel.service';
import { LogisticaYmsEtapasService } from '../services/etapas.service';
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
import { ILogisticaYmsEtapas } from './../models/etapas';


@Component({
  selector: 'logistica-yms-etapas-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class LogisticaYmsEtapasListaComponent
  implements OnInit, OnDestroy {
    
  breadCrumbTree: Array<Breadcrumb>;
  idSubModulo: number;
  noResult: boolean;
  loadingEtapas: boolean;
  modalRef: BsModalRef;
  form: FormGroup;
  showDetailPanelSubscription: Subscription;
  showDetailPanel = false;
  $activatedRouteSubscription: Subscription;
  circuitos: Array<ILogisticaYmsCircuitos>;
  setores: Array<ILogisticaYmsSetores>;
  noAssocSetores: boolean
  associacaoSetores: Array<ILogisticaYmsEtapas>;
  //LOADINGS
  loading = true; 
  loadingNavBar = false; 
  loadingCircuitos:boolean;
  loadingSetores:boolean;
  loadingAssociacaoSetores: boolean;
  //VARIAVEIS
  totalItens: any = [];
  filterEtapas: Array<ILogisticaYmsEtapas>;
  etapas: Array<ILogisticaYmsEtapas>;
  etapaSelecionada: ILogisticaYmsEtapas;

  // CUSTOM TABLE
  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
  };

  tableConfigAssocSetores: Partial<CustomTableConfig> = {
    fixedHeader: false,
    bodyHeight: 230,
    hover: false,
  };

  // Tipos de Situação dos Etapas (Ativo/Inativo)
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
    private etapasService: LogisticaYmsEtapasService,
    private circuitosService: LogisticaYmsCircuitosService,
    private setoresService: LogisticaYmsSetoresService,
  ) {}

  ngOnInit() {
    this.buildForm();
    this.setBreadCrumb();
    this.onActivatedRoute();
    this.onDetailPanelEmitter();
    this.getFilterEtapas();
    this.getCircuitos();
    this.getSetores();
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
          this.getEtapas(this.getParams());
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

  getCircuitos(params?: Partial<ILogisticaYmsCircuitos>) {
    const _params = params ?? {};
    _params.IN_STAT = 1;
    _params.IN_PAGI = 0;
    this.loadingCircuitos = true;
    this.circuitosService
      .getCircuitos(_params)
      .pipe(
        finalize(() => {
          this.loadingCircuitos = false;
        })
      )
      .subscribe((response) => {
        if (response.status === 200) {
          this.circuitos = response.body['data'];
        }else{
          this.circuitos = [];
        }
      },
      (error: any) => {
        try {
          this.pnotify.error(error.error.message);
        } catch (error) {
          this.pnotify.error();
        }
      }
    );
  }

  getSetores(params?: Partial<ILogisticaYmsSetores>) {
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
          this.setores = response.body['data'];
        }else{
          this.setores = [];
        }
      },
      (error: any) => {
        try {
          this.pnotify.error(error.error.message);
        } catch (error) {
          this.pnotify.error();
        }
      }
    );
  }

  buildForm() {
    this.form = this.formBuilder.group({
      UUID_LOGI_YMS_ETAP: [null],
      NM_ETAP: [null],
      ID_LOGI_YMS_SETO:[null],
      NM_SETO:[null],
      ID_LOGI_YMS_CIRC:[null],
      NM_CIRC:[null],
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
        descricao: 'Etapas',
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

  onDetails(etapas: ILogisticaYmsEtapas): void {
    this.getSetoresAssociados({UUID_LOGI_YMS_ETAP: etapas.UUID_LOGI_YMS_ETAP});
    this.detailPanelService.show();
    this.etapaSelecionada = etapas;
    this.detailPanelService.loadedFinished(false);
  }

  getEtapas(params?) {
    if (!this.loading) this.loadingNavBar = true;
    this.etapasService
      .getEtapas(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.etapas = response.body['data'];
            this.totalItems = response.body['total'];
            this.noResult = false;
          } else {
            this.noResult = true;
            this.etapas = [];
          }
        },
        (error: any) => {
          try {
            this.noResult = true;
            this.pnotify.error(error.error.message);
          } catch (error) {
            this.pnotify.error();
          }
        }
      );
    }


    getSetoresAssociados(params){
      this.loadingAssociacaoSetores = true;
      params.IN_STAT = '1';
      params.IN_PAGI = '0';
      params.ORDE_BY = 'NR_SQNC'
      params.ORDE_BY = 'asc'
      console.log(params)
      this.etapasService
        .getSetoresAssociados(params)
        .pipe(
          finalize(() => {
            this.loadingAssociacaoSetores = false;
          })
        )
        .subscribe(
          (response) => {
            if (response.status === 200) {
              this.associacaoSetores = response.body['data'];
  
              if (this.associacaoSetores.length > 9) {
                this.tableConfigAssocSetores.fixedHeader = true;
              }
  
              this.noAssocSetores = false
            } else {
              this.pnotify.notice('Nenhuma associação encontrada!');
              this.noAssocSetores = true
              this.associacaoSetores = [];
            }
          },
          (error) => {
            this.pnotify.error();
          }
        );
    }

  getFilterEtapas() {
    this.loadingEtapas = true;
    this.etapasService
      .getEtapas({ IN_STAT: '1', IN_PAGI: '0' })
      .pipe(
        finalize(() => {
          this.loadingEtapas = false;
        })
      )
      .subscribe((response) => {
        if (response.status === 200) {
          this.filterEtapas = response.body['data'];
        }else{
          this.filterEtapas = [];
        }
      },
      (error: any) => {
        try {
          this.pnotify.error(error.error.message);
        } catch (error) {
          this.pnotify.error();
        }
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

  classStatusBorder(etapas: ILogisticaYmsEtapas): string {
    let borderClass: string;

    if (etapas.IN_STAT == 1) {
      borderClass = 'border-success';
    } else if (etapas.IN_STAT == 2) {
      borderClass = 'border-danger';
    }

    return borderClass;
  }

  changeType(params: ILogisticaYmsEtapas) {
    const stat = params.IN_STAT == 1 ? 0 : 1;

    this.confirmChange(stat)
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) => {
          if (!result) return EMPTY;

          this.loadingNavBar = true;
          params.IN_STAT = stat;
          return this.etapasService.postEtapas(params);
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
    listagemExport = this.etapas.concat(this.totalItens);

    this.xlsxService.exportFile(listagemExport, `Etapas${dataExport}`);
  }
}
