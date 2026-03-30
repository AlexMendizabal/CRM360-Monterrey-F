import { PdfService } from './../../../../../shared/services/core/pdf.service';
import { ILogisticaEntradaMateriaisTiposConformidade } from './../../tipos-conformidade/models/tiposConformidade';
import { LogisticaEntradaMateriaisTiposConformidadeService } from './../../tipos-conformidade/services/tipos-conformidade.service';
import { ILogisticaEntradaMateriaisOcorrencias } from './../models/ocorrencias';
import { LogisticaEntradaMateriaisFichaConformidadeService } from './../services/ficha-conformidade.service';
import { ILogisticaEntradaMateriaisDocumentos } from '../models/documentos';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Input, TemplateRef, Output } from '@angular/core';
//angular
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';

//servicos
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ConfirmModalService } from './../../../../../shared/modules/confirm-modal/confirm-modal.service';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { XlsxService } from 'src/app/shared/services/core/xlsx.service';
import { DateService } from 'src/app/shared/services/core/date.service';

// rxjs
import { finalize, take, switchMap } from 'rxjs/operators';
import { Subscription, EMPTY } from 'rxjs';

//modelos
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { BsModalRef, BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap';
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';
import { CustomTableConfig } from './../../../../../shared/templates/custom-table/models/config';

//Interfaces
import { ILogisticaEntradaMateriaisFichaConformidade } from './../models/fichaConformidade';


@Component({
  selector: 'logistica-entrada-materiais-ficha-conformidade-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class LogisticaEntradaMateriaisFichaConformidadeListaComponent
  implements OnInit, OnDestroy {
   
  breadCrumbTree: Array<Breadcrumb>;
  idSubModulo: number;
  noResult: boolean;
  modalRef1: BsModalRef;
  modalRef2: BsModalRef;
  form: FormGroup;
  $activatedRouteSubscription: Subscription;

  //LOADINGS
  loading = true; 
  loadingNavBar = false; 
  loadingImagens = false;
  loadingMateriais = false;
  loadingDocumentos = false;
  loadingOcorrencias: boolean;
  loadingTiposConformidade = false;
  loadingDocumentosOcorrencias:boolean;
  loadingResponsaveisOcorrencias:boolean;
  //VARIAVEIS
  noResponsaveisOcorrencia: boolean;
  noMateriais: boolean;
  noOcorrencias: boolean;
  hiddenModal: boolean = false;
  fichaId:number;
  totalImagens:number;
  totalDocumentos:number;
  allFichas: any = [];
  materiais =[];
  imagens: Array<ILogisticaEntradaMateriaisDocumentos>;
  documentos: Array<ILogisticaEntradaMateriaisDocumentos>;
  documentosOcorrencia = {};
  responsaveisOcorrencia = {};
  tiposConformidade: Array<ILogisticaEntradaMateriaisTiposConformidade>;
  ocorrencias: Array<ILogisticaEntradaMateriaisOcorrencias>;
  fichasConformidade: Array<ILogisticaEntradaMateriaisFichaConformidade>;
  fichaSelecionada: ILogisticaEntradaMateriaisFichaConformidade;
  bsConfig: Partial<BsDatepickerConfig>;
  ORDE_BY = 'ID_LOGI_ENMA_FHNC';
  ORDE_TYPE = 'desc';
  // CUSTOM TABLE
  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
  };

  disabledButton:boolean

  // Tipos de Situação das Fichas de  não Conformidade (Ativo/Inativo)
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

    // Tipos de Status dos Pareceres
    status = [
      {
        cod: '1',
        nome: 'Finalizada',
      },
      {
        cod: '0',
        nome: 'Em Andamento',
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
    private activatedRoute: ActivatedRoute,
    private fichasConformidadeService: LogisticaEntradaMateriaisFichaConformidadeService,
    private tiposConformidadeService: LogisticaEntradaMateriaisTiposConformidadeService,
    private formBuilder: FormBuilder,
    private localeService: BsLocaleService,
    private xlsxService: XlsxService,
    private pdfService: PdfService,
    private confirmModalService: ConfirmModalService,
    private modalService: BsModalService,
    private routerService: RouterService,
    private dateService: DateService
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
    this.getTiposConformidade();
  }

  ngOnDestroy() {
    this.$activatedRouteSubscription.unsubscribe();
    if(this.modalRef1 != undefined){
      this.modalRef1.hide();
    }
    if(this.modalRef2 != undefined){
      this.modalRef2.hide();
    }
  }
  onFecharModal(event){
    if(event == true){
      this.hideModalOcorrencias()
      this.getOcorrencias({ID_LOGI_ENMA_FHNC:  this.fichaSelecionada['ID_LOGI_ENMA_FHNC'],IN_STAT: '1'});
      this.fichasConformidadeService
      .getFichasConformidade({ID_LOGI_ENMA_FHNC:  this.fichaSelecionada['ID_LOGI_ENMA_FHNC']})
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.fichaSelecionada = response.body['data'][0];
          } 
          return
        },
      );
    } 
    return
  }
  onActivatedRoute() {
    this.$activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (response) => {
        const _response = this.routerService.getBase64UrlParams(response);
        this.form.patchValue(_response);
        if (_response.hasOwnProperty('TT_REGI_PAGI'))
          this.itemsPerPage = _response.TT_REGI_PAGI;
        this.getFichasConformidade(this.getParams());
      }
    );
  }

  onReset() {
    this.form.reset();
    this.form.patchValue({
      PAGI: 1,
      TT_REGI_PAGI: 100,
      DT_INIC: new Date(),
      DT_FINA: new Date(),
      TIME: [new Date().getTime()],
    });
  }

  buildForm() {
    this.form = this.formBuilder.group({
      ID_LOGI_ENMA_FHNC: [null],
      ID_LOGI_ENMA_FHNC_TIPO: [null],
      NM_TIPO: [null],
      IN_STAT: [null],
      DS_UNID_MEDI: [null],
      DS_OBSE: [null],
      NM_MATE: [null],
      NM_FORN: [null],
      IN_CONC: [null],
      DS_LOTE: [null],
      NR_NOTA_FISC: [null],
      MATR_USUA_CADA: [null],
      DS_USUA_CADA: [null],
      DT_INCL: [null],
      PAGI: [1],
      DT_INIC: [new Date()],
      DT_FINA: [new Date()],
      TT_REGI_PAGI: [this.itemsPerPage],
      TIME: [new Date().getTime()],
      ORDE_BY: [this.ORDE_BY],
      ORDE_TYPE: [this.ORDE_TYPE],
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
        descricao: 'Fichas de Não Conformidade',
      },
    ];
  }

  onFilter() {
    this.form.get('PAGI').setValue(1);
    this.form.get('TIME').setValue(new Date().getTime());
    this.form.get('ORDE_TYPE').setValue(this.ORDE_TYPE);
    this.form.get('ORDE_BY').setValue(this.ORDE_BY);
    this.route.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams()),
    });
  }

  getFichasConformidade(params?) {
    if (!this.loading) this.loadingNavBar = true;
    this.fichasConformidadeService
      .getFichasConformidade(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.fichasConformidade = response.body['data'];
            this.totalItems = response.body['total'];
            this.noResult = false;
          } else {
            this.noResult = true;
            this.fichasConformidade = [];
          }
        },
        (error: any) => {
          this.noResult = true;
          try {
            this.pnotify.error(error.error.message);
          } catch (error) {
            this.pnotify.error();
          }
        });
  }

  getRelatorio(params?) {
    params = this.getParams();
    this.loadingNavBar = true;
    this.fichasConformidadeService
      .getRelatorio(params)
      .pipe(
        finalize(() => {
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        response => {
          
          if(response.status !== 200){
            this.pnotify.notice('Nenhum registro localizado.');
            return
          }

          this.xlsxService.export({data: response.body['data']})

        },
        error => {
          const message = error?.error?.message;
          message ? this.pnotify.error(message) : this.pnotify.error();
        });
  }

  getMateriais(params?) {
    this.loadingMateriais = true;
    this.fichasConformidadeService
      .getFormMaterial(params)
      .pipe(
        finalize(() => {
          this.loadingMateriais = false;
        })
      )
      .subscribe((response) => {
        if (response.status === 200) {
          this.materiais = response.body['data'];
          this.noMateriais =false;
        }else {
          this.materiais = [];
          this.noMateriais= true;
        }
      },
      (error) => {
        this.pnotify.error('Não foi encontrado nenhum material');
        this.noMateriais = true;
      }
    );
  }

  getImagens(params?) {
    this.loadingImagens = true;
    this.fichasConformidadeService.getDocumento(params).subscribe(
      (response) => {
        if (response.status === 200) {
          this.imagens = response.body['data'];
          this.totalImagens = response.body['data'].length
          this.loadingImagens = false;
        } else {
          this.imagens = [];
          this.totalImagens = 0;
          this.loadingImagens = false;
        }
      },
      (error) => {
        this.imagens = [];
        this.loadingImagens = false;
      }
    );
  }

  getDocumentoOcorrencia(params: ILogisticaEntradaMateriaisOcorrencias) {
    this.loadingDocumentosOcorrencias = true;
    this.fichasConformidadeService
      .getDocumentoOcorrencia(params)
      .pipe(
        finalize(() => {
          this.loadingDocumentosOcorrencias = false;
        })
      )
      .subscribe(async (response) => {
        if (response.status !== 200) {
          return;
        }
        const documentos = response['body']['data'];
        this.documentosOcorrencia[params.ID_LOGI_ENMA_FHNC_OCOR] = documentos;
      },
      (error) => {
        this.pnotify.error('Não foi encontrado nenhum documento');
      }
    );
  }

  getResponsaveisOcorrencia(params: ILogisticaEntradaMateriaisOcorrencias) {
    this.loadingResponsaveisOcorrencias = true;
    this.fichasConformidadeService
      .getResponsaveisOcorrencia(params)
      .pipe(
        finalize(() => {
          this.loadingResponsaveisOcorrencias = false;
        })
      )
      .subscribe(async (response) => {
        if (response.status !== 200) {
        this.noResponsaveisOcorrencia = true;
          return;
        }
        const responsaveis = response['body']['data'];
        this.noResponsaveisOcorrencia = false;
        this.responsaveisOcorrencia[params.ID_LOGI_ENMA_FHNC_OCOR] = responsaveis;
      },
      (error) => {
        this.pnotify.error('Não foi encontrado nenhum responsável');
        this.noResponsaveisOcorrencia = true;
      }
    );
  }

  getOcorrencias(params?) {
    this.loadingOcorrencias = true;
    this.disabledButton = true;
    params = {...params, ORDE_TYPE:'desc'}
    this.fichasConformidadeService.getOcorrencias(params)
    .subscribe(
      (response) => {
        if (response.status === 200) {
          this.ocorrencias = response.body['data'];
          if(response.body['total']){
            this.disabledButton = false;
          }
          this.noOcorrencias = false;
          this.ocorrencias.forEach(ocorrencia => {
            this.getDocumentoOcorrencia(ocorrencia)
            this.getResponsaveisOcorrencia(ocorrencia)
            this.loadingOcorrencias = false;
          });
        } else {
          this.ocorrencias = [];
          this.noOcorrencias = true;
          this.loadingOcorrencias = false;
        }
      },
      (error) => {
        this.ocorrencias = [];
        this.noOcorrencias = true;
        this.loadingOcorrencias = false;
      }
    );
  }

  getDocumentos(params?) {
    this.loadingDocumentos = true;
    this.fichasConformidadeService.getDocumento(params).subscribe(
      (response) => {
        if (response.status === 200) {
          this.documentos = response.body['data'];
          this.totalDocumentos = response.body['data'].length
          this.loadingDocumentos = false;
        } else {
          this.documentos = [];
          this.totalDocumentos = 0;
          this.loadingDocumentos = false;
        }
      },
      (error) => {
        this.documentos = [];
        this.loadingDocumentos = false;
      }
    );
  }

  finalizarFicha(ocorrencia){
    const params = ocorrencia ?? {};
    const _params = {...params,IN_CONC: 1}
    this.fichasConformidadeService
    .postFichasConformidade(_params)
    .subscribe(
      (response: any) => {
        if (response.status === 200) {
          this.pnotify.success();
          this.hideModal()
          this.getFichasConformidade();
        } else {
          this.pnotify.error();
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


  openModal(template: TemplateRef<any>, ficha?) {
    this.noOcorrencias =true;
    this.hiddenModal = false;
    const _params = {ID_LOGI_ENMA_FHNC: ficha['ID_LOGI_ENMA_FHNC'],IN_STAT: '1'}
    const _paramsImagem = {..._params, TP_DOCU: 'IMAGEM'}
    const _paramsDocumento = {..._params, TP_DOCU: 'DOCUMENTO' }
    this.fichaSelecionada = ficha;
    this.getImagens(_paramsImagem)
    this.getDocumentos(_paramsDocumento)
    this.getMateriais(_params)
    this.getOcorrencias(_params)
    this.modalRef1 = this.modalService.show(template, {
      animated: false,
      class: 'modal-xl',
    });
  }

  hideModal() {
    this.modalRef1.hide();
  }

  openModalOcorrencias(template: TemplateRef<any>) {
    const id = this.fichaSelecionada['ID_LOGI_ENMA_FHNC']
    this.fichaId = id
    this.hiddenModal = true;
    this.modalRef2 = this.modalService.show(template, {
      animated: true,
      class: 'modal-lg',
      backdrop: 'static',
    });
  }
  hideModalOcorrencias() {
    this.hiddenModal = false
    this.modalRef2.hide();
  }

  onDownload(params?) {
    this.pnotify.notice('Documento PDF será gerado em breve!')
    const _id = params['ID_LOGI_ENMA_FHNC'];
    this.pdfService.download('ficha-pdf', `Ficha_Nao_Conformidade - ${_id}`);
  }

  onPrint(){
    
    window.print();
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

  classStatusBorder(status: ILogisticaEntradaMateriaisFichaConformidade): string {
    let borderClass: string;

    if (status.IN_STAT == 1) {
      borderClass = 'border-success';
    } else if (status.IN_STAT == 0) {
      borderClass = 'border-danger';
    }

    return borderClass;
  }

  changeType(status: ILogisticaEntradaMateriaisFichaConformidade) {
    const stat = status.IN_STAT == 1 ? 0 : 1;

    this.confirmChange(stat)
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) => {
          if (!result) return EMPTY;
          this.loadingNavBar = true;
          status.IN_STAT = stat;
          return this.fichasConformidadeService.postFichasConformidade(status);
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
          status.IN_STAT = status.IN_STAT == 1 ? 0 : 1;
          this.pnotify.error();
        }
      );
  }

  getTiposConformidade(params?) {
    const _params = params ?? {};
    _params.IN_STAT = '1';

  this.loadingTiposConformidade = true;
  this.tiposConformidadeService
    .getTiposConformidade(_params)
    .pipe(
      finalize(() => {
        this.loadingTiposConformidade = false;
      })
    )
    .subscribe((response) => {
      if (response.status === 200) {
        this.tiposConformidade = response.body['data'];
      }else {
        this.tiposConformidade = [];
      }
    },
    (error) => {
      this.pnotify.error('Não foi encontrado nenhum status de recebimento');
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


  setOrderBy(column: string): void {
    if (this.ORDE_BY === column) {
      if (this.ORDE_TYPE == 'desc') {
        this.ORDE_TYPE = 'asc';
      } else if (this.ORDE_TYPE == 'asc') {
        this.ORDE_TYPE = 'desc';
      }
    } else {
      this.ORDE_BY = column;
      this.ORDE_TYPE = 'asc';
    }
    this.onFilter();
  }

}
