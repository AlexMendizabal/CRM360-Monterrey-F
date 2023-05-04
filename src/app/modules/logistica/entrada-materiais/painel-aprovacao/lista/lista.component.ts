import { IContato } from './../../../../servicos/contatos/models/contato';
import { ContatoService } from './../../../../servicos/contatos/services/contato.service';
//angular
import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

//servicos
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ConfirmModalService } from './../../../../../shared/modules/confirm-modal/confirm-modal.service';
import { DetailPanelService } from './../../../../../shared/templates/detail-panel/detal-panel.service';
import { LogisticaEntradaMateriaisPainelAprovacoesService } from '../services/aprovacao.service';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { LogisticaEntradaMateriaisMotivosService } from './../../motivos/services/motivos.service';

import { XlsxService } from 'src/app/shared/modules/xlsx/xlsx.service';
import { DateService } from 'src/app/shared/services/core/date.service';

// rxjs
import { finalize, take, switchMap } from 'rxjs/operators';
import { Subscription, EMPTY } from 'rxjs';

//modelos
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { BsModalRef, BsLocaleService, BsDatepickerConfig, BsModalService } from 'ngx-bootstrap';
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';
import { CustomTableConfig } from './../../../../../shared/templates/custom-table/models/config';

//Interfaces
import { ILogisticaEntradaMateriaisPainelAprovacoes } from './../models/aprovacoes';


@Component({
  selector: 'logistica-entrada-materiais-status-fiscais-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class LogisticaEntradaMateriaisPainelAprovacaoListaComponent
  implements OnInit, OnDestroy {
    
  breadCrumbTree: Array<Breadcrumb>;
  idSubModulo: number;
  noResult: boolean;
  modalRef: BsModalRef;
  form: FormGroup;
  showDetailPanelSubscription: Subscription;
  showDetailPanel = false;
  $activatedRouteSubscription: Subscription;
  bsConfig: Partial<BsDatepickerConfig>;
  //LOADINGS
  loading = true;
  loadingDetails = false;
  loadingNavBar = false;
  loadingModal = false;

  //VARIAVEIS
  totalItens: any = [];
  motivos= [];
  solicitacoes: Array<ILogisticaEntradaMateriaisPainelAprovacoes>;
  solicitacaoSelecionada: ILogisticaEntradaMateriaisPainelAprovacoes;
  contato: IContato[] = [];
  viewDetailsSolicitante = 1;
  viewHistorico:boolean
  // CUSTOM TABLE
  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
  };

  // Tipos de Situação das Solicitações (Aprovada/Reprovada/Pendente)
  tipos = [
    {
      cod: '1',
      nome: 'Aprovada',
    },
    {
      cod: '2',
      nome: 'Reprovada',
    },
    {
      cod: '3',
      nome: 'Pendente',
    },
  ];

  // Subtitles (Ativo/Inativo/Pendente)
  subtitles: Array<Subtitles> = [
    {
      id: 1,
      text: 'Aprovada',
      color: 'green',
    },
    {
      id: 2,
      text: 'Reprovada',
      color: 'red',
    },
    {
      id: 3,
      text: 'Pendente',
      color: 'blue',
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
    private localeService: BsLocaleService,
    private activatedRoute: ActivatedRoute,
    private aprovacoesService: LogisticaEntradaMateriaisPainelAprovacoesService,
    private formBuilder: FormBuilder,
    private contatosService: ContatoService,
    private motivosService: LogisticaEntradaMateriaisMotivosService,
    private xlsxService: XlsxService,
    private modalService: BsModalService,
    private confirmModalService: ConfirmModalService,
    private routerService: RouterService,
    private dateService: DateService,
    private detailPanelService: DetailPanelService
  ) {
    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );
  }

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
        this.getSolicitacoes(this.getParams());
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

  openModal(template: TemplateRef<any>, status) {
    this.viewDetailsSolicitante = 1;
    this.loadingModal = true;
    const _params = status.MT_LOGI_ENTR_MATE_NOME_SOLI
    this.getMotivos();
    this.getContatos({'NR_MATR':_params});
    this.solicitacaoSelecionada = status;
    this.modalRef = this.modalService.show(template, {
      animated: false,
      class: 'modal-lg',
    });
  }

  hideModal() {
    this.modalRef.hide();
  }

  onReset() {
    this.form.reset();
    this.form.patchValue({
      PAGI: 1,
      TT_REGI_PAGI: 100,
      TIME: [new Date().getTime()],
    });
  }

  getContatos(params?) {
    if (!this.loading)
      this.loadingModal = true;

    this.contatosService
      .get(params)
      .pipe(
        finalize(() => {
          this.loadingModal = false;
          this.loading = false;
        })
      )
      .subscribe(
        response => {
          if (response.status === 200) {
            this.contato = response.body["data"][0];
          } else {
            this.pnotify.error();
          }
        },
        error => {
          this.pnotify.error();
        }
      )
  }

  detailsSolicitante(params?){
    if(this.viewDetailsSolicitante == 1){
      this.viewDetailsSolicitante = 0
    }else{
      this.viewDetailsSolicitante = 1
    }
  }



  buildForm() {
    this.form = this.formBuilder.group({
      ID_LOGI_ENTR_MATE_APRO: [null],
      NM_LOGI_ENTR_MATE_NOME_SOLI: [null],
      MT_LOGI_ENTR_MATE_NOME_SOLI: [null],
      ID_LOGI_ENTR_MATE_MOTI: [null, [Validators.required]],
      DS_LOGI_ENTR_MATE_MOTI: [null],
      IN_STAT: [null],
      DT_INIC: [null],
      DS_SOLI: [null],
      DT_SOLI: [null],
      DT_FINA: [null],
      DT_APROV: [null],
      DS_OBSE: [null, [Validators.required, Validators.minLength(3)]],
      MATR_USUA_CADA: [null],
      DS_USUA_CADA: [null],
      DT_INCL: [null],
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
        descricao: 'Entrada de Materiais',
        routerLink: `/logistica/entrada-materiais/${id}`,
      },
      {
        descricao: 'Painel de Aprovações',
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

  onDetails(status: ILogisticaEntradaMateriaisPainelAprovacoes): void {
    this.loadingDetails = true;
    this.detailPanelService.show();
    this.solicitacaoSelecionada = status;
    if(this.solicitacaoSelecionada.IN_STAT == 3){
      this.viewHistorico = false
    } else {
      this.viewHistorico = true
    }

    this.detailPanelService.loadedFinished(false);

    setTimeout(() => {
      this.loadingDetails = false;
    }, 500);
  }

  getMotivos(params?) {
    this.loadingModal = true;
    const _params = params ?? {};
    _params.IN_STAT = '1';
    _params.IN_PAGI = '0';
    _params.DS_LOGI_ENTR_MATE_CATE_MOTI = 'APROVACAO'
    this.motivosService
      .getMotivos(_params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingModal = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.motivos = response.body['data'];
          } else {
            this.motivos = [];
          }
        },
        (error) => {
          this.pnotify.error();
        }
      );
  }

  getSolicitacoes(params?) {
    if (!this.loading) this.loadingNavBar = true;
    this.aprovacoesService
      .getSolicitacoes(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.solicitacoes = response.body['data'];
            this.totalItems = response.body['total'];
            this.noResult = false;
          } else {
            this.noResult = true;
            this.solicitacoes = [];
          }
        },
        (error) => {
          this.pnotify.error();
          this.noResult = true;
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

  classStatusBorder(status: ILogisticaEntradaMateriaisPainelAprovacoes): string {
    let borderClass: string;

    if (status.IN_STAT == 1) {
      borderClass = 'border-success';
    } else if (status.IN_STAT == 2) {
      borderClass = 'border-danger';
    } else if (status.IN_STAT == 3) {
      borderClass = 'border-primary';
    }

    return borderClass;
  }

  requestSuccess(status: ILogisticaEntradaMateriaisPainelAprovacoes) {
    const stat = 1;

    this.confirmChange(stat)
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) => {
          if (!result) return EMPTY;

          this.loadingNavBar = true;
          status.IN_STAT = stat;
          return this.aprovacoesService.postSolicitacoes(status);
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
          this.pnotify.error('Erro ao aprovar a solicitação');
        }
      );
  }

  requestFail(status: ILogisticaEntradaMateriaisPainelAprovacoes) {
    const stat = 2;

    this.confirmChange(stat)
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) => {
          if (!result) return EMPTY;

          this.loadingNavBar = true;
          status.IN_STAT = stat;
          return this.aprovacoesService.postSolicitacoes(status);
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
          this.pnotify.error('Erro ao reprovar a solicitação');
        }
      );
  }

  confirmChange(stat): any {
    if (stat == 1)
      return this.confirmModalService.showConfirm(
        null,
        'Confirmar Aprovação',
        'Deseja realmente aprovar a solicitação ?',
        'Cancelar',
        'Confirmar'
      );

    return this.confirmModalService.showConfirm(
      null,
      'Confirmar Reprovação',
      'Deseja realmente reprovar a solicitação?',
      'Cancelar',
      'Confirmar'
    );
  }

  onExport(): void {
    let data = new Date().toLocaleDateString().split('/'),
      dataExport = `${data[0]}${data[1]}${data[2]}`;

    let listagemExport: any = [];
    listagemExport = this.solicitacoes.concat(this.totalItens);

    this.xlsxService.exportFile(listagemExport, `Aprovacoes${dataExport}`);
  }
  
   // Validação de formulário
  onFieldError(field: string) {
    if (this.onFieldInvalid(field)) {
      return 'is-invalid';
    }
    return '';
  }

  onFieldInvalid(field: any) {
    field = this.form.get(field);
    return field.status == 'INVALID' && field.touched;
  }

  onFieldRequired(field: string) {
    let required = false;
    let formControl = new FormControl();

    if (this.form.controls[field].validator) {
      let validationResult = this.form.controls[field].validator(formControl);
      required =
        validationResult !== null && validationResult.required === true;
    }

    if (required) {
      return 'is-required';
    }
  }

  
}
