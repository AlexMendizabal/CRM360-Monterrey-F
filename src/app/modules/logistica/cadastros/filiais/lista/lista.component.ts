//angular
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';

//servicos
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ConfirmModalService } from './../../../../../shared/modules/confirm-modal/confirm-modal.service';
import { DetailPanelService } from './../../../../../shared/templates/detail-panel/detal-panel.service';
import { LogisticaFiliaisService } from '../services/filiais.service';
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
import { ILogisticaFiliais } from './../models/filiais';


@Component({
  selector: 'logistica-filiais-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class LogisticaFiliaisListaComponent
  implements OnInit, OnDestroy {
    
  breadCrumbTree: Array<Breadcrumb>;
  idSubModulo: number;
  noResult: boolean;
  loadingFiliais: boolean;
  modalRef: BsModalRef;
  form: FormGroup;
  $activatedRouteSubscription: Subscription;
  //LOADINGS
  loading = true; 
  loadingNavBar = false; 
  //VARIAVEIS
  totalItens: any = [];
  filterFiliais: Array<ILogisticaFiliais>;
  filiais: Array<ILogisticaFiliais>;
  // CUSTOM TABLE
  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
  };

  tableConfigAssocUsuarios: Partial<CustomTableConfig> = {
    fixedHeader: false,
    bodyHeight: 230,
    hover: false,
  };

  // Tipos de Situação dos Filiais (Ativo/Inativo)
  tipos = [
    {
      cod: '1',
      nome: 'Activos',
    },
    {
      cod: '2',
      nome: 'Inactivos',
    },
  ];

  // Subtitles (Ativo/Inativo)
  subtitles: Array<Subtitles> = [
    {
      id: 1,
      text: 'Activo',
      color: 'green',
    },
    {
      id: 2,
      text: 'Inactivo',
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
    private filiaisService: LogisticaFiliaisService,
  ) {}

  ngOnInit() {
    this.buildForm();
    this.setBreadCrumb();
    this.onActivatedRoute();
    this.getFilterFiliais();
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
          this.getFiliais(this.getParams());
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
      id: [null],
      nome: [null],
      idFilial: [null],
      status: [null],
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
        descricao: 'Prontuários',
        routerLink: `/logistica/cadastros/${id}`,
      },
      {
        descricao: 'Filiais',
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

  getFiliais(params?) {
    if (!this.loading) this.loadingNavBar = true;
    this.filiaisService
      .getFiliais(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.filiais = response.body['data'];
            this.totalItems = response.body['total'];
            this.noResult = !response.body['data']?.length;
          } else {
            this.noResult = true;
            this.filiais = [];
          }
        },
        (error) => {
          this.pnotify.error();
          this.noResult = true;
        }
      );
  }

  getFilterFiliais() {
    this.loadingFiliais = true;
    this.filiaisService
      .getFiliais({ status: '1', IN_PAGI: '0' })
      .pipe(
        finalize(() => {
          this.loadingFiliais = false;
        })
      )
      .subscribe((response) => {
        if (response.status === 200) {
          this.filterFiliais = response.body['data'];
        }else{
          this.pnotify.notice('No se encontró información!')
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

  classStatusBorder(filiais: ILogisticaFiliais): string {
    let borderClass: string;

    if (filiais.status == '1') {
      borderClass = 'border-success';
    } else if (filiais.status == '2') {
      borderClass = 'border-danger';
    }

    return borderClass;
  }

  changeType(params: ILogisticaFiliais) {
    const stat = params.status == '1' ? '0' : '1';

    this.confirmChange(stat)
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) => {
          if (!result) return EMPTY;

          this.loadingNavBar = true;
          params.status = stat;
          return this.filiaisService.postFiliais(params);
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
          params.status = params.status == '1' ? '0' : '1';
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
    listagemExport = this.filiais.concat(this.totalItens);

    this.xlsxService.exportFile(listagemExport, `Filiais${dataExport}`);
  }
}
