//angular
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';

//servicos
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ConfirmModalService } from './../../../../../shared/modules/confirm-modal/confirm-modal.service';
import { DetailPanelService } from './../../../../../shared/templates/detail-panel/detal-panel.service';
import { LogisticaYmsChecklistService } from '../services/checklist.service';
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
import { ILogisticaYmsChecklist } from './../models/checklist';


@Component({
  selector: 'logistica-yms-checklist-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class LogisticaYmsChecklistListaComponent
  implements OnInit, OnDestroy {
    
  breadCrumbTree: Array<Breadcrumb>;
  idSubModulo: number;
  noResult: boolean;
  loadingChecklist: boolean;
  modalRef: BsModalRef;
  form: FormGroup;
  showDetailPanelSubscription: Subscription;
  showDetailPanel = false;
  $activatedRouteSubscription: Subscription;

  //LOADINGS
  loading = true; 
  loadingNavBar = false; 

  //VARIAVEIS
  totalItens: any = [];
  filterChecklist: Array<ILogisticaYmsChecklist>;
  checklist: Array<ILogisticaYmsChecklist>;
  checklistSelecionado: ILogisticaYmsChecklist;

  // CUSTOM TABLE
  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
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
    private checklistService: LogisticaYmsChecklistService,
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
      NM_CHEC: [null],
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
        descricao: 'Checklist',
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

  onDetails(checklist: ILogisticaYmsChecklist): void {
    this.detailPanelService.show();
    this.checklistSelecionado = checklist;
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
          this.pnotify.error();
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

  classStatusBorder(checklist: ILogisticaYmsChecklist): string {
    let borderClass: string;

    if (checklist.IN_STAT == 1) {
      borderClass = 'border-success';
    } else if (checklist.IN_STAT == 2) {
      borderClass = 'border-danger';
    }

    return borderClass;
  }

  changeType(params: ILogisticaYmsChecklist) {
    const stat = params.IN_STAT == 1 ? 0 : 1;

    this.confirmChange(stat)
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) => {
          if (!result) return EMPTY;

          this.loadingNavBar = true;
          params.IN_STAT = stat;
          return this.checklistService.postChecklist(params);
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
    listagemExport = this.checklist.concat(this.totalItens);

    this.xlsxService.exportFile(listagemExport, `Checklist${dataExport}`);
  }
}
