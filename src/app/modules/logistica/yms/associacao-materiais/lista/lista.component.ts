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
import { LogisticaYmsSetoresService } from './../../setores/services/setores.service';
import { LogisticaYmsAssociacaoMateriaisService } from '../services/associacao-materiais.service';

// rxjs
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';

//modelos
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { BsModalRef } from 'ngx-bootstrap';
import { CustomTableConfig } from './../../../../../shared/templates/custom-table/models/config';

//Interfaces
import { ILogisticaYmsSetores } from './../../setores/models/setores';
import { ILogisticaYmsAssociacaoMateriais } from './../models/associacao-materiais';


@Component({
  selector: 'logistica-associacao-materiais-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class LogisticaYmsAssociacaoMateriaisListaComponent
  implements OnInit, OnDestroy {    

    form: FormGroup;
    modalRef: BsModalRef;
    showDetailPanelSubscription: Subscription;
    $activatedRouteSubscription: Subscription;
    
    noResult: boolean;
    noAssocMateriais: boolean;
    showDetailPanel = false;
    
    //LOADINGS
    loading = true; 
    loadingNavBar = false; 
    loadingSetores: boolean;
    loadingAssociacaoMateriais: boolean;
    
    //VARIAVEIS
    setores: Array<ILogisticaYmsSetores>;
    totalItens: any = [];
    idSubModulo: number;
    filterSetores: Array<ILogisticaYmsSetores>;
    breadCrumbTree: Array<Breadcrumb>;
    associacaoMateriais: Array<ILogisticaYmsAssociacaoMateriais>;
    associacaoSelecionada: ILogisticaYmsAssociacaoMateriais;
    filterAssociacaoMateriais: Array<ILogisticaYmsAssociacaoMateriais>;

    // CUSTOM TABLE
    tableConfig: Partial<CustomTableConfig> = {
      subtitleBorder: false,
    };

    tableConfigAssocMateriais: Partial<CustomTableConfig> = {
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
    private setoresService: LogisticaYmsSetoresService,
    private detailPanelService: DetailPanelService,
    private associacaoMateriaisService: LogisticaYmsAssociacaoMateriaisService,
  ) {}

  ngOnInit() {
    this.buildForm();
    this.setBreadCrumb();
    this.onActivatedRoute();
    this.onDetailPanelEmitter();
    this.getFilterSetores();
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
      UUID_LOGI_YMS_AREA: [null],
      UUID_LOGI_YMS_AREA_USUA: [null],
      NM_AREA: [null],
      NM_SETO: [null],
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
        descricao: 'Materiais por Setor',
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

  onDetails(associacaoMateriais: ILogisticaYmsAssociacaoMateriais): void {
    this.getAssociacaoMateriais({UUID_LOGI_YMS_SETO: associacaoMateriais.UUID_LOGI_YMS_SETO , IN_STAT: 1});
    this.detailPanelService.show();
    this.associacaoSelecionada = associacaoMateriais;
    this.detailPanelService.loadedFinished(false);
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
        (error) => {
          const message = error.error.message
          message ? this.pnotify.error(message): this.pnotify.error();
          this.noResult = true;
        }
      );
  }

  getFilterSetores() {
    this.loadingSetores = true;
    this.setoresService
      .getSetores({ IN_STAT: '1', IN_PAGI: '0' })
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
      }),
      (error) => {
        const message = error.error.message
        message ? this.pnotify.error(message): this.pnotify.error();
      };
  }

  getAssociacaoMateriais(params?) {
    this.noAssocMateriais = true
    this.loadingAssociacaoMateriais = true;
    this.associacaoMateriaisService
      .getAssociacaoMateriais(params)
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
    listagemExport = this.associacaoMateriais.concat(this.totalItens);

    this.xlsxService.exportFile(listagemExport, `AssociacaoMateriais${dataExport}`);
  }
}
