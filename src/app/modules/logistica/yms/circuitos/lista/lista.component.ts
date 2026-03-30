import { ILogisticaFiliais } from './../../../cadastros/filiais/models/filiais';
import { LogisticaFiliaisService } from './../../../cadastros/filiais/services/filiais.service';
//angular
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';

//servicos
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ConfirmModalService } from './../../../../../shared/modules/confirm-modal/confirm-modal.service';
import { DetailPanelService } from './../../../../../shared/templates/detail-panel/detal-panel.service';
import { LogisticaYmsCircuitosService } from '../services/circuitos.service';
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
import { ILogisticaYmsCircuitos } from './../models/circuitos';


@Component({
  selector: 'logistica-yms-circuitos-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class LogisticaYmsCircuitosListaComponent
  implements OnInit, OnDestroy {
    
  breadCrumbTree: Array<Breadcrumb>;
  idSubModulo: number;
  noResult: boolean;
  loadingCircuitos: boolean;
  modalRef: BsModalRef;
  form: FormGroup;
  showDetailPanelSubscription: Subscription;
  showDetailPanel = false;
  $activatedRouteSubscription: Subscription;

  //LOADINGS
  loading = true; 
  loadingNavBar = false; 
  loadingFiliais: boolean;
  loadingAssociacaoEtapas: boolean;
  //VARIAVEIS
  filiais: Array<ILogisticaFiliais>;
  totalItens: any = [];
  filterCircuitos: Array<ILogisticaYmsCircuitos>;
  circuitos: Array<ILogisticaYmsCircuitos>;
  circuitoSelecionado: ILogisticaYmsCircuitos;
  noAssocEtapas: boolean
  associacaoEtapas: Array<ILogisticaYmsCircuitos>;
  // CUSTOM TABLE
  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
  };

  tableConfigAssocEtapas: Partial<CustomTableConfig> = {
    fixedHeader: false,
    bodyHeight: 230,
    hover: false,
  };

  // Tipos de Situação dos Circuitos (Ativo/Inativo)
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
    private circuitosService: LogisticaYmsCircuitosService,
    private filiaisService: LogisticaFiliaisService,
  ) {}

  ngOnInit() {
    this.buildForm();
    this.setBreadCrumb();
    this.onActivatedRoute();
    this.onDetailPanelEmitter();
    this.getFilterCircuitos();
    this.getFiliais();
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
          this.getCircuitos(this.getParams());
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
      UUID_LOGI_YMS_CIRC: [null],
      UUID_LOGI_FILI: [null],
      NM_CIRC: [null],
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
        descricao: 'Circuitos',
      },
    ];
  }

  getFiliais(){
    this.loadingFiliais = true;
    this.filiaisService
    .getFiliais({ IN_STAT: '1', IN_PAGI: '0', IN_YMS:1 })
    .pipe(
      finalize(() => {
        this.loadingFiliais = false;
      })
    )
    .subscribe(
      (response) => {
        if (response.status === 200) {
          this.filiais = response.body['data']
        } else {
          this.filiais = [];
          this.pnotify.notice('Nenhuma filial encontrada!')
        }
      },
      (error) => {
        const message = error.error.message
        message ? this.pnotify.error(message): this.pnotify.error();
      }
    );
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

  onDetails(circuitos: ILogisticaYmsCircuitos): void {
    this.getEtapasAssociados({UUID_LOGI_YMS_CIRC: circuitos.UUID_LOGI_YMS_CIRC});
    this.detailPanelService.show();
    this.circuitoSelecionado = circuitos;
    this.detailPanelService.loadedFinished(false);
  }

  getEtapasAssociados(params){
    this.loadingAssociacaoEtapas = true;
    params.IN_STAT = '1';
    params.IN_PAGI = '0';
    console.log(params)
    this.circuitosService
      .getEtapasAssociados(params)
      .pipe(
        finalize(() => {
          this.loadingAssociacaoEtapas = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.associacaoEtapas = response.body['data'];

            if (this.associacaoEtapas.length > 9) {
              this.tableConfigAssocEtapas.fixedHeader = true;
            }

            this.noAssocEtapas = false
          } else {
            this.pnotify.notice('Nenhuma associação encontrada!');
            this.noAssocEtapas = true
            this.associacaoEtapas = [];
          }
        },
        (error) => {
          this.pnotify.error();
        }
      );
  }

  getCircuitos(params?) {
    if (!this.loading) this.loadingNavBar = true;
    this.circuitosService
      .getCircuitos(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.circuitos = response.body['data'];
            this.totalItems = response.body['total'];
            this.noResult = false;
          } else {
            this.noResult = true;
            this.circuitos = [];
          }
        },
        (error) => {
          this.pnotify.error();
          this.noResult = true;
        }
      );
  }

  getFilterCircuitos() {
    this.loadingCircuitos = true;
    this.circuitosService
      .getCircuitos({ IN_STAT: '1', IN_PAGI: '0' })
      .pipe(
        finalize(() => {
          this.loadingCircuitos = false;
        })
      )
      .subscribe((response) => {
        if (response.status === 200) {
          this.filterCircuitos = response.body['data'];
        }else{
          this.pnotify.notice('Nenhum registro encontrado!')
        }
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

  classStatusBorder(circuitos: ILogisticaYmsCircuitos): string {
    let borderClass: string;

    if (circuitos.IN_STAT == 1) {
      borderClass = 'border-success';
    } else if (circuitos.IN_STAT == 2) {
      borderClass = 'border-danger';
    }

    return borderClass;
  }

  changeType(params: ILogisticaYmsCircuitos) {
    const stat = params.IN_STAT == 1 ? 0 : 1;

    this.confirmChange(stat)
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) => {
          if (!result) return EMPTY;

          this.loadingNavBar = true;
          params.IN_STAT = stat;
          return this.circuitosService.postCircuitos(params);
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
    listagemExport = this.circuitos.concat(this.totalItens);

    this.xlsxService.exportFile(listagemExport, `Circuitos${dataExport}`);
  }
}
