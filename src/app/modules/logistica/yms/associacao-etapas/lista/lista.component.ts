//angular
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Component, OnInit, OnDestroy } from '@angular/core';

//servicos
import { XlsxService } from 'src/app/shared/modules/xlsx/xlsx.service';
import { DateService } from 'src/app/shared/services/core/date.service';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { DetailPanelService } from './../../../../../shared/templates/detail-panel/detal-panel.service';
import { LogisticaYmsChecklistService } from './../../checklist/services/checklist.service';
import { LogisticaYmsAssociacaoEtapasService } from '../services/associacao-etapas.service';

// rxjs
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';

//modelos
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { BsModalRef } from 'ngx-bootstrap';
import { CustomTableConfig } from './../../../../../shared/templates/custom-table/models/config';

//Interfaces
import { ILogisticaYmsChecklist } from './../../checklist/models/checklist';
import { ILogisticaYmsAssociacaoEtapas } from './../models/associacao-etapas';


@Component({
  selector: 'logistica-associacao-etapas-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class LogisticaYmsAssociacaoEtapasListaComponent
  implements OnInit, OnDestroy {    

    form: FormGroup;
    modalRef: BsModalRef;
    showDetailPanelSubscription: Subscription;
    $activatedRouteSubscription: Subscription;
    
    noResult: boolean;
    noAssocEtapas: boolean;
    showDetailPanel = false;
    
    //LOADINGS
    loading = true; 
    loadingNavBar = false; 
    loadingChecklist: boolean;
    loadingAssociacaoEtapas: boolean;
    
    //VARIAVEIS
    checklist: Array<ILogisticaYmsChecklist>;
    totalItens: any = [];
    idSubModulo: number;
    filterChecklist: Array<ILogisticaYmsChecklist>;
    breadCrumbTree: Array<Breadcrumb>;
    associacaoEtapas: Array<ILogisticaYmsAssociacaoEtapas>;
    associacaoSelecionada: ILogisticaYmsAssociacaoEtapas;
    filterAssociacaoEtapas: Array<ILogisticaYmsAssociacaoEtapas>;

    // CUSTOM TABLE
    tableConfig: Partial<CustomTableConfig> = {
      subtitleBorder: false,
    };

    tableConfigAssocEtapas: Partial<CustomTableConfig> = {
      fixedHeader: false,
      bodyHeight: 230,
      hover: false,
    };
    
    // Tipos de Situação dos Checklist (Ativo/Inativo)
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
    private checklistService: LogisticaYmsChecklistService,
    private detailPanelService: DetailPanelService,
    private associacaoEtapasService: LogisticaYmsAssociacaoEtapasService,
  ) {}

  ngOnInit() {
    this.buildForm();
    this.setBreadCrumb();
    this.onActivatedRoute();
    this.onDetailPanelEmitter();
    this.getFilterChecklist();
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
          this.getChecklist(this.getParams());
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
      ID_LOGI_YMS_CHEC: [null],
      NM_AREA: [null],
      IN_STAT: [null],
      DS_OBSE: [null],
      NR_MATR: [null],
      NM_USUA: [null],
      DT_INCL: [null],
      DT_ATUA: [null],
      CD_CEP: [null],
      DS_ESTA: [null],
      DS_CIDA: [null],
      DS_BAIR: [null],
      DS_LOGR: [null],
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
        descricao: 'Etapas por Checklist',
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

  onDetails(associacaoEtapas: ILogisticaYmsAssociacaoEtapas): void {
    this.getAssociacaoEtapas({ID_LOGI_YMS_CHEC: associacaoEtapas.ID_LOGI_YMS_CHEC , IN_STAT: 1});
    this.detailPanelService.show();
    this.associacaoSelecionada = associacaoEtapas;
    this.detailPanelService.loadedFinished(false);
  }

  getChecklist(params?) {
    if (!this.loading) this.loadingNavBar = true;
    this.checklistService
      .getChecklist(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.checklist = response.body['data'];
            this.totalItems = response.body['total'];
            this.noResult = false;
          } else {
            this.noResult = true;
            this.checklist = [];
          }
        },
        (error) => {
          const message = error.error.message
          message ? this.pnotify.error(message): this.pnotify.error();
          this.noResult = true;
        }
      );
  }

  getFilterChecklist() {
    this.loadingChecklist = true;
    this.checklistService
      .getChecklist({ IN_STAT: '1', IN_PAGI: '0' })
      .pipe(
        finalize(() => {
          this.loadingChecklist = false;
        })
      )
      .subscribe((response) => {
        if (response.status === 200) {
          this.filterChecklist = response.body['data'];
        }else{
          this.pnotify.notice('Nenhum registro encontrado!')
        }
      }),
      (error) => {
        const message = error.error.message
        message ? this.pnotify.error(message): this.pnotify.error();
      };
  }

  getAssociacaoEtapas(params?) {
    this.noAssocEtapas = true
    this.loadingAssociacaoEtapas = true;
    this.associacaoEtapasService
      .getAssociacaoEtapas(params)
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


  onExport(): void {
    let data = new Date().toLocaleDateString().split('/'),
      dataExport = `${data[0]}${data[1]}${data[2]}`;

    let listagemExport: any = [];
    listagemExport = this.associacaoEtapas.concat(this.totalItens);

    this.xlsxService.exportFile(listagemExport, `AssociacaoEtapas${dataExport}`);
  }
}
