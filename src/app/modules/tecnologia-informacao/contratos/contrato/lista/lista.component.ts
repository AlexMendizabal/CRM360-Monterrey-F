import { concat } from 'rxjs';
//angular
import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';

//servicos
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { TecnologiaInformacaoCadastroContratoService } from '../services/contrato.service';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { DateService } from 'src/app/shared/services/core/date.service';
import { ConfirmModalService } from './../../../../../shared/modules/confirm-modal/confirm-modal.service';
import { DetailPanelService } from './../../../../../shared/templates/detail-panel/detal-panel.service';
import { TecnologiaInformacaoCadastroTipoContratoService } from './../../tipo-contrato/services/tipo-contrato.service';
import { MoedasService } from 'src/app/shared/services/requests/moedas.service';

// rxjs
import { finalize, take, switchMap } from 'rxjs/operators';
import { Subscription, EMPTY } from 'rxjs';

//ngx
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

//modelos
import { ITecnologiaInformacaoTipoContrato } from './../../tipo-Contrato/models/tipoContrato';
import { Subtitles } from './../../../../../shared/modules/subtitles/subtitles';
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { ITecnologiaInformacaoItem } from './../../item/models/item';
import { ITecnologiaInformacaoContrato } from './../models/contrato';
import { PageChangedEvent } from 'ngx-bootstrap';
import { XlsxService } from 'src/app/shared/modules/xlsx/xlsx.service';

@Component({
  selector: 'tecnologia-informacao-cadastros-contrato-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class TecnologiaInformacaoCadastrosContratoListaComponent
  implements OnInit, OnDestroy {
  breadCrumbTree: Array<Breadcrumb>;
  loadingTipoContrato: boolean;
  idSubModulo: number;
  noResult: boolean;

  contratosVinculados: ITecnologiaInformacaoContrato[] = [];
  loading = true; //Loading FullPage
  loadingNavBar = false; //Loading do NAVBAR
  itensLoading = false; //Loading dos Itens no Modal
  itens: Array<ITecnologiaInformacaoItem> = new Array();
  modalRef: BsModalRef;
  item: ITecnologiaInformacaoItem;
  form: FormGroup;

  noVinculo = true;
  loadingVinculo = true;
  contratos: Array<ITecnologiaInformacaoContrato>;
  tipoContrato: ITecnologiaInformacaoTipoContrato[] = [];
  $activatedRouteSubscription: Subscription;
  tipoMoeda: ITecnologiaInformacaoContrato[] = [];
  totalContratosExp: any = [];

  // Detalhes
  showDetailPanelSubscription: Subscription;
  showDetailPanel = false;
  contratoSelecionado: ITecnologiaInformacaoContrato;

  // Tipos de Situação dos Tipos de Contratos (Ativo/Inativo)
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
  itemsPerPage: number = 10;
  totalItems: number;
  currentPage: number = 1;
  begin: number = 0;
  end: number = 10;
  /* Pagination */

  constructor(
    private route: Router,
    private pnotify: PNotifyService,
    private activatedRoute: ActivatedRoute,
    private contratoService: TecnologiaInformacaoCadastroContratoService,
    private formBuilder: FormBuilder,
    private xlsxService: XlsxService,
    private confirmModalService: ConfirmModalService,
    private routerService: RouterService,
    private dateService: DateService,
    private moedasService: MoedasService,
    private detailPanelService: DetailPanelService,
    private tipoContratoService: TecnologiaInformacaoCadastroTipoContratoService
  ) {}

  ngOnInit() {
    this.buildForm();
    this.setBreadCrumb();
    this.onActivatedRoute();
    this.getTipoContrato();
    this.onDetailPanelEmitter();
    this.getMoedas();
  }

  ngOnDestroy() {
    this.$activatedRouteSubscription.unsubscribe();
  }

  onActivatedRoute() {
    this.$activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (response) => {
        const _response = this.routerService.getBase64UrlParams(response);
        this.form.patchValue(_response);
        this.getContrato(this.getParams());
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

  onDetails(contrato: ITecnologiaInformacaoContrato): void {
    this.getContratosVinculados({
      ID_TECN_INFO_CONT_REFE: contrato.ID_TECN_INFO_CONT,
    });
    this.loadingNavBar = true;
    this.detailPanelService.show();
    this.contratoSelecionado = contrato;
    this.detailPanelService.loadedFinished(false);

    setTimeout(() => {
      this.loadingNavBar = false;
    }, 500);
  }
  getTipoContrato(params?: Partial<ITecnologiaInformacaoTipoContrato>) {
    const _params = params ?? {};
    _params.IN_STAT = '1';
    this.loadingTipoContrato = true;
    this.tipoContratoService
      .getTipoContrato(_params)
      .pipe(
        finalize(() => {
          this.loadingTipoContrato = false;
        })
      )
      .subscribe((response) => {
        if (response.status === 200) {
          this.tipoContrato = response.body['data'];
        }
      });
  }

  getTotalContrato(params?) {
    this.loadingNavBar= true;
    params = this.getParams();
    const _params = {...params,IN_PAGI:'0'}
    this.contratoService
      .getContrato(_params)
      .pipe(
        finalize(() => {
          this.loadingNavBar= false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.totalContratosExp = response.body['data'];
            this.onExport();
          } else {
            this.totalContratosExp = [];
          }
        },
        (error) => {
          this.pnotify.error();
        }
      );
  }


  getMoedas(params?: Partial<ITecnologiaInformacaoContrato>) {
    this.moedasService
      .getMoedas()
      .pipe(finalize(() => {}))
      .subscribe((response) => {
        if (response.status === 200) {
          this.tipoMoeda = response.body['data'];
        }
      });
  }
  onSelect(item) {
    item.IN_SELE = !item.IN_SELE;
  }

  buildForm() {
    this.form = this.formBuilder.group({
      ID_TECN_INFO_CONT: [null],
      DS_CONT: [null],
      VL_CONT: [null],
      ID_TECN_INFO_CONT_TIPO: [null],
      IN_STAT: [null],
      QT_DOCU: [null],
      PAGI: [1],
      IN_SELE: [false],
      TIME: [new Date().getTime()],
      DT_INIC: [null],
      DT_VENC: [null],
      DT_INCL: [null],
      NM_USUA_CADA: [null],
      PRAZ_CANC: [null],
    });
  }

  setBreadCrumb() {
    const id = this.activatedRoute.snapshot.params.idSubModulo;
    this.breadCrumbTree = [
      {
        descricao: 'Home',
        routerLink: `/tecnologia-informacao/home`,
      },
      {
        descricao: 'Contratos',
        routerLink: `/tecnologia-informacao/contratos/${id}`,
      },
      {
        descricao: 'Contratos',
      },
    ];
  }

  getContratosVinculados(params: Partial<ITecnologiaInformacaoContrato>) {
    this.loadingVinculo = true;
    this.noVinculo = true;
    this.contratoService
      .getContrato(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingVinculo = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.contratosVinculados = response.body['data'];
            this.noVinculo = false;
          } else {
            this.noVinculo = true;
            this.contratosVinculados = [];
          }
        },
        (error) => {
          this.pnotify.error();
        }
      );
  }
  onFilter() {
    this.detailPanelService.hide();
    this.form.get('TIME').setValue(new Date().getTime());
    this.route.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams()),
    });
  }

  getContrato(params?) {
    if (!this.loading) this.loadingNavBar = true;

    this.contratoService
      .getContrato(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.contratos = response.body['data'];
            this.totalItems = response.body['total'];
            this.noResult = false;
          } else {
            this.noResult = true;
            this.contratos = [];
          }
        },
        (error) => {
          this.pnotify.error();
          this.noResult = true;
        }
      );
  }

  changeType(contrato: ITecnologiaInformacaoContrato) {
    const stat = contrato.IN_STAT == '1' ? '0' : '1';

    this.confirmChange(stat)
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) => {
          if (!result) return EMPTY;

          this.loadingNavBar = true;
          contrato.IN_STAT = stat;
          return this.contratoService.postContrato(contrato);
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
          contrato.IN_STAT = contrato.IN_STAT == '1' ? '0' : '1';
          this.pnotify.error();
        }
      );
  }

  confirmChange(stat): any {
    if (stat == '1')
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
    listagemExport = this.totalContratosExp;

    this.xlsxService.exportFile(
      listagemExport,
      `Controle_Contratos_${dataExport}`
    );
  }
}
