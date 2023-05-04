import { LogisticaYmsTiposCircuitoService } from './../../tipos-circuito/services/tipos-circuito.service';
import { LogisticaFiliaisService } from './../../../cadastros/filiais/services/filiais.service';
import { ILogisticaFiliais } from './../../../cadastros/filiais/models/filiais';
import { ILogisticaYmsTiposCircuito } from './../../tipos-circuito/models/tipos-circuito';
import { ILogisticaMotorista } from './../../../cadastros/motoristas/models/motorista';
import { LogisticaMotoristaService } from './../../../cadastros/motoristas/services/motorista.service';
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
import { LogisticaYmsAgendamentosService } from '../services/agendamentos.service';
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
import { ILogisticaYmsAgendamentos } from '../models/agendamentos';


@Component({
  selector: 'logistica-yms-agendamentos-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class LogisticaYmsAgendamentosListaComponent
  implements OnInit, OnDestroy {
    
  breadCrumbTree: Array<Breadcrumb>;
  idSubModulo: number;
  noResult: boolean;
  loadingAgendamentos: boolean;
  modalRef: BsModalRef;
  form: FormGroup;
  showDetailPanelSubscription: Subscription;
  showDetailPanel = false;
  $activatedRouteSubscription: Subscription;

  //LOADINGS
  loading = true; 
  loadingNavBar = false
  loadingTiposCircuito:boolean;
  loadingFiliais: boolean;

  //VARIAVEIS
  totalItens: any = [];
  agendamentos: Array<ILogisticaYmsAgendamentos>;
  agendamentoSelecionada: ILogisticaYmsAgendamentos;
  tiposCircuito: Array<ILogisticaYmsTiposCircuito>;
  filiais: Array<ILogisticaFiliais>;
  // CUSTOM TABLE
  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
  };

  // Tipos de Situação dos Agendamentos (Ativo/Inativo)
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
    private motoristaService: LogisticaMotoristaService,
    private agendamentosService: LogisticaYmsAgendamentosService,
    private filiaisService: LogisticaFiliaisService,
    private tiposCircuitoService: LogisticaYmsTiposCircuitoService
  ) {}

  ngOnInit() {
    this.buildForm();
    this.setBreadCrumb();
    this.onActivatedRoute();
    this.onDetailPanelEmitter();
    this.getFiliais();
    this.getTiposCircuito();
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
          this.getAgendamentos(this.getParams());
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

  getFiliais() {
    this.loadingFiliais = true;
    this.filiaisService
      .getFiliais({ IN_STAT: '1', IN_PAGI: '0' })
      .pipe(
        finalize(() => {
          this.loadingFiliais = false;
        })
      )
      .subscribe((response) => {
        if (response.status === 200) {
          this.filiais = response.body['data'];
        }else{
          this.pnotify.notice('Nenhum registro encontrado!')
        }
      }),
      (error) => {
        this.filiais = [];
        const message = error.error.message
        message ? this.pnotify.error(message): this.pnotify.error();
      };
  }

  getTiposCircuito() {
    this.loadingTiposCircuito = true;
    this.tiposCircuitoService
      .getTiposCircuito({ IN_STAT: '1', IN_PAGI: '0' })
      .pipe(
        finalize(() => {
          this.loadingTiposCircuito = false;
        })
      )
      .subscribe((response) => {
        if (response.status === 200) {
          this.tiposCircuito = response.body['data'];
        }else{
          this.pnotify.notice('Nenhum registro encontrado!')
        }
      }),
      (error: any) => {
        this.tiposCircuito= [];
        const message = error.error.message
        message ? this.pnotify.error(message): this.pnotify.error();
      }
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
      ID_LOGI_YMS_CIRC_TIPO: [null],
      ID_LOGI_FILI: [null],
      ID_LOGI_MOTO:[null],
      NM_MOTO: [null],
      PLAC: [null],
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
        descricao: 'Agendamentos',
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

  onDetails(agendamentos: ILogisticaYmsAgendamentos): void {
    this.detailPanelService.show();
    this.agendamentoSelecionada = agendamentos;
    this.detailPanelService.loadedFinished(false);
  }

  getAgendamentos(params?) {
    if (!this.loading) this.loadingNavBar = true;
    this.agendamentosService
      .getAgendamentos(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.agendamentos = response.body['data'];
            this.totalItems = response.body['total'];
            this.noResult = false;
          } else {
            this.noResult = true;
            this.agendamentos = [];
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

  classStatusBorder(agendamentos: ILogisticaYmsAgendamentos): string {
    let borderClass: string;

    if (agendamentos.IN_STAT == 1) {
      borderClass = 'border-success';
    } else if (agendamentos.IN_STAT == 2) {
      borderClass = 'border-danger';
    }

    return borderClass;
  }

  changeType(params: ILogisticaYmsAgendamentos) {
    const stat = params.IN_STAT == 1 ? 0 : 1;

    this.confirmChange(stat)
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) => {
          if (!result) return EMPTY;

          this.loadingNavBar = true;
          params.IN_STAT = stat;
          return this.agendamentosService.postAgendamentos(params);
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
    listagemExport = this.agendamentos.concat(this.totalItens);

    this.xlsxService.exportFile(listagemExport, `Agendamentos${dataExport}`);
  }
}
