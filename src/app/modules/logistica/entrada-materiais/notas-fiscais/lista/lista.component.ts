import { DateService } from './../../../../../shared/services/core/date.service';
import { LogisticaEntradaMateriaisStatusRecebimentoService } from './../../status-recebimento/services/status-recebimento.service';


//angular
import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';

//servicos
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ConfirmModalService } from './../../../../../shared/modules/confirm-modal/confirm-modal.service';
import { LogisticaEntradaMateriaisNotasFiscaisService } from '../services/notas-fiscais.service';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { XlsxService } from 'src/app/shared/modules/xlsx/xlsx.service';
import { LogisticaEntradaMateriaisService } from '../../services/entrada-materiais.service';

// rxjs
import { finalize, take, switchMap } from 'rxjs/operators';
import { Subscription, EMPTY } from 'rxjs';

//modelos
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { BsModalRef, BsModalService, BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap';
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';
import { CustomTableConfig } from './../../../../../shared/templates/custom-table/models/config';

//Interfaces
import { ILogisticaEntradaMateriaisNotasFiscais } from './../models/notasFiscais';


@Component({
  selector: 'logistica-entrada-materiais-notas-fiscais-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class LogisticaEntradaMateriaisNotasFiscaisListaComponent
  implements OnInit, OnDestroy {
    
  breadCrumbTree: Array<Breadcrumb>;
  idSubModulo: number;
  noResult: boolean;
  noMateriais: boolean;
  noHistoricoMateriais= {};
  noAlteracoes: boolean;
  modalRef1: BsModalRef;
  modalRef2: BsModalRef;
  form: FormGroup;
  $activatedRouteSubscription: Subscription;
  bsConfig: Partial<BsDatepickerConfig>;
  ORDE_BY = 'ID_LOGI_ENMA_NOFI';
  ORDE_TYPE = 'desc';
  //LOADINGS
  loading = true; 
  loadingNavBar = false; 
  loadingFornecedores = false;
  loadingMateriais = false;
  loadingHistoricoMateriais = false;
  loadingEmpresas = false;
  loadingDepositos = false;
  loadingAlteracoes = false;
  loadingStatusRecebimento = false;
  //VARIAVEIS
  fornecedores =[];
  empresas =[];
  depositos =[];
  materiais =[];
  historicoMateriais = [];
  alteracoes=[];
  statusRecebimento=[];
  totalItens: any = [];
  notasFiscais: Array<ILogisticaEntradaMateriaisNotasFiscais>;
  allNotasFiscais: Array<ILogisticaEntradaMateriaisNotasFiscais>;
  notaFiscalSelecionada: ILogisticaEntradaMateriaisNotasFiscais;

  //CARDS
  notas: number = 0;
  notasEmpty: boolean = false;

  fichasNaoConforme: number = 0;
  fichasNaoConformeEmpty: boolean = false;

  duplicados: number = 0;
  duplicadosEmpty: boolean = false;

  countoNotas: number;
  countoFichasNaoConforme: number;
  countoDuplicados: number;

  cardsLoading: boolean = true;

  // CUSTOM TABLE
  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
  };

  // Tipos de Situação das Notas Fiscais (Ativo/Inativo)
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

  tiposData = [
    {
      cod: '1',
      nome: 'Emissão',
    },
    {
      cod: '2',
      nome: 'Recebimento',
    },
    {
      cod: '3',
      nome: 'Entrada no Estoque',
    },
    {
      cod: '4',
      nome: 'Cadastro',
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
    private localeService: BsLocaleService,
    private notasFiscaisService: LogisticaEntradaMateriaisNotasFiscaisService,
    private entradaMateriaisService: LogisticaEntradaMateriaisService,
    private statusRecebimentoService: LogisticaEntradaMateriaisStatusRecebimentoService,
    private formBuilder: FormBuilder,
    private xlsxService: XlsxService,
    private confirmModalService: ConfirmModalService,
    private modalService: BsModalService,
    private routerService: RouterService,
    private dateService: DateService,
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
    this.getEmpresas();
    this.getDepositos();
    this.getStatusRecebimento();
    this.getLotesDuplicados();
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

  onActivatedRoute() {
    this.$activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (response) => {
        const _response = this.routerService.getBase64UrlParams(response);
        this.form.patchValue(_response);
        if (_response.hasOwnProperty('TT_REGI_PAGI'))
          this.itemsPerPage = _response.TT_REGI_PAGI;
        this.getNotasFiscais(this.getParams());
      }
    );
  }


  onReset() {
    this.form.reset();
    this.form.patchValue({
      PAGI: 1,
      TT_REGI_PAGI: 100,
      TP_DATA_FINA: '1',
      TP_DATA_INIC: '1',
      DT_INIC: new Date(),
      DT_FINA: new Date(),
      TIME: [new Date().getTime()],
    });
  }

  buildForm() {
    this.form = this.formBuilder.group({
      ID_LOGI_ENMA_NOFI: [null],
      NR_NOTA_FISC: [null],
      NM_FORN: [null],
      CD_MATE: [null],
      ID_FORN: [null],
      NM_DEPO: [null],
      DT_EMIS_NOTA_FISC: [null],
      NR_NOTA_FISC_REFE: [null],
      ID_LOGI_ENMA_NOFI_STAT: [null],
      NM_STAT: [null],
      NM_MATE: [null],
      DS_LOTE: [null],
      IN_FHNC: [null],
      DS_LOGI_ENTR_MATE_UNID_MEDI: [null],
      DS_LOGI_ENTR_MATE_LOTE: [null],
      TP_DATA_FINA: ['1'],
      TP_DATA_INIC: ['1'],
      UUID_EMPR: [null],
      UUID_DEPO: [null],
      NM_EMPR: [null],
      QT_LOGI_ENTR_MATE: [null],
      IN_STAT: [null],
      DS_OBSE: [null],
      MATR_USUA_CADA: [null],
      DS_USUA_CADA: [null],
      DT_INCL: [null],
      DT_INIC: [new Date()],
      DT_FINA: [new Date()],
      PAGI: [1],
      TT_REGI_PAGI: [this.itemsPerPage],
      ORDE_BY: [this.ORDE_BY],
      ORDE_TYPE: [this.ORDE_TYPE],
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
        descricao: 'Notas Fiscais',
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
    this.form.reset();
  }

  gerarFicha(id:number) {
    const params = this.activatedRoute.snapshot.params;
    const idSubmodulo = params.hasOwnProperty('idSubModulo') ? params.idSubModulo : undefined;
  this.route.navigate([`/logistica/entrada-materiais/${idSubmodulo}/fichas-nao-conformidade/novo`], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams({ID_LOGI_ENMA_NOFI: id}),
    });
  }

  openModalDetalhes(template: TemplateRef<any>, nota) {
    this.getNotasMateriais({
      ID_LOGI_ENMA_NOFI: nota.ID_LOGI_ENMA_NOFI, IN_STAT: '1'
    });
    this.getAlteracoes({ID_LOGI_ENMA_NOFI: nota.ID_LOGI_ENMA_NOFI});
    this.getHistoricoMateriais({ID_LOGI_ENMA_NOFI: nota.ID_LOGI_ENMA_NOFI});
    this.notaFiscalSelecionada = nota;
    this.modalRef1 = this.modalService.show(template, {
      animated: false,
      class: 'modal-xl',
    });
  }

  hideModalDetalhes() {
    this.modalRef1.hide();
  }

  openModalDuplicadas(template: TemplateRef<any>) {
    this.modalRef2 = this.modalService.show(template, {
      animated: false,
      class: 'modal-xl',
    });
  }

  hideModalDuplicadas() {
    this.modalRef2.hide();
    this.getLotesDuplicados();
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



  getNotasMateriais(params?) {
    this.loadingMateriais = true;
    this.notasFiscaisService
      .getNotasMateriais(params)
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
      (error: any) => {
        this.noMateriais= true;
        try {
          this.pnotify.error(error.error.message);
          this.noMateriais = true;
        } catch (error) {
          this.pnotify.error();
        }
      });
}

  fichasNaoConformeChange(){
    this.form.get('IN_FHNC').setValue('1');
    this.onFilter();
  }

  getHistoricoMateriais(params) {
    this.loadingHistoricoMateriais= true;
    this.notasFiscaisService
      .getHistoricoMateriais({...params, ORDE_TYPE:'desc'})
      .pipe(
        finalize(() => {
          this.loadingHistoricoMateriais = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status !== 200) {
            return;
          }
          this.historicoMateriais = response['body']['data'];
        },
        (error: any) => {
          try {
            this.pnotify.error(error.error.message);
          } catch (error) {
            this.pnotify.error();
          }
        });
  }
      
  hasHistoricoMateriais(id):boolean{
    if(this.loadingHistoricoMateriais[id])
      return false
    if(!this.historicoMateriais[id])
      return false;
    if(this.historicoMateriais[id].length == 0)
      return false;
    return true;
  }

  getNotasFiscais(params?) {
    if (!this.loading) this.loadingNavBar = true;
    this.cardsLoading = false;
    this.notasFiscaisService
      .getNotasFiscais(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cardsLoading = true;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.notasFiscais = response.body['data'];
            this.totalItems = response.body['total'];
            this.notas = response.body['total'];
            this.fichasNaoConforme = response.body['notConform'];
            this.noResult = false;
          } else {
            this.noResult = true;
            this.notas = 0
            this.notasFiscais = [];
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
  

  getLotesDuplicados(params?) {
    const _params = {...params,IN_DS_OBSE:0}
    this.notasFiscaisService
      .getLotesDuplicados(_params)
      .subscribe((response) => {
        if (response.status === 200) {
          this.duplicados = response.body['total'];
        }else {
          this.duplicados = 0;
        }
      },
      (error: any) => {
        try {
          this.pnotify.error(error.error.message);
          this.duplicados = 0;
        } catch (error) {
          this.pnotify.error();
        }
      });
}

  typeChange(params){
    if(params.ID_LOGI_ENMA_NOFI_STAT)
      return false;

    if(params.ID_EMPR)
      return false;

    if(params.ID_FORN)
      return false;

    if(params.NR_NOTA_FISC)
      return false;

    if(params.DT_EMIS_NOTA_FISC)
      return false;

    if(params.DS_OBSE)
      return false;
    
    if(params.IN_STAT)
      return false;

    return true;
  }

  getExport(params?) {
    this.loadingNavBar= true;
    params = this.getParams();
    const _params = {...params,IN_PAGI:'0'}
    this.loadingNavBar = true;
    this.notasFiscaisService
      .getExport(_params)
      .pipe(
        finalize(() => {
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.allNotasFiscais = response.body['data'];
            this.onExport();
          } else {
            this.allNotasFiscais = [];
          }
        },
        (error: any) => {
          try {
            this.pnotify.error(error.error.message);
          } catch (error) {
            this.pnotify.error();
          }
        });
  }

  getEmpresas(params?) {
    this.loadingEmpresas=true;
    this.entradaMateriaisService
      .getEmpresas(params)
      .pipe(
        finalize(() => {
          this.loadingEmpresas = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.empresas = response.body['result'];
          } else {
            this.pnotify.notice('Nenhum registro encontrado!');
            this.empresas = [];
          }
        },
        (error: any) => {
          try {
            this.pnotify.error(error.error.message);
            this.empresas = [];
          } catch (error) {
            this.pnotify.error();
          }
        });
  }

  getDepositos(params?) {
    this.loadingDepositos=true;
    this.entradaMateriaisService
      .getDepositos(params)
      .pipe(
        finalize(() => {
          this.loadingDepositos = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.depositos = response.body['result'];
          } else {
            this.pnotify.notice('Nenhum registro encontrado!');
            this.depositos = [];
          }
        },
        (error: any) => {
          try {
            this.pnotify.error(error.error.message);
            this.depositos = [];
          } catch (error) {
            this.pnotify.error();
          }
        });
  }



  getAlteracoes(params?) {
    const _params = params ?? {};
    _params.ORDE_TYPE = 'desc';

    this.loadingAlteracoes = true;
    this.notasFiscaisService
      .getAlteracoes(_params)
      .pipe(
        finalize(() => {
          this.loadingAlteracoes = false;
        })
      )
      .subscribe((response) => {
        if (response.status === 200) {
          this.alteracoes = response.body['data'];
          this.noAlteracoes =false;
        }else {
          this.alteracoes = [];
          this.noAlteracoes =true;
        }
      },
      (error: any) => {
        try {
          this.pnotify.error(error.error.message);
          this.noAlteracoes = true;
        } catch (error) {
          this.pnotify.error();
        }
      });
}

  titleHistorico(params){
    const _newDT = new Date(params.DT_INCL)
    const data = this.dateService.convertToBrazilianDate(_newDT);
    if(params.IN_STAT != 0){
      return ("ALTERAÇÃO REALIZADA POR " + params.NM_USUA + " NO DIA " + data )
    }
    if(params.SEQU_MATE == null && params.IN_STAT != 0){
      return ("MATERIAL REMOVIDO POR " + params.NM_USUA + " NO DIA " + data )
    }
    return ("REGISTRO INATIVADO POR " + params.NM_USUA + " NO DIA " + data )
  }

  getFornecedores(params?) {
    const _params = params ?? {};
    _params.IN_STAT = '1';
    _params.IN_PAGI = '0';

    this.loadingFornecedores = true;
    this.entradaMateriaisService
      .getFornecedores(_params)
      .pipe(
        finalize(() => {
          this.loadingFornecedores = false;
        })
      )
      .subscribe((response) => {
        if (response.status === 200) {
          this.fornecedores = response.body['data'];
        }else {
          this.fornecedores = [];
        }
      },
      (error: any) => {
        try {
          this.pnotify.error(error.error.message);
          this.fornecedores = [];
        } catch (error) {
          this.pnotify.error();
        }
      });
}
  getStatusRecebimento(params?) {
    const _params = params ?? {};
    _params.IN_STAT = '1';
    _params.IN_PAGI = '0';

  this.loadingStatusRecebimento = true;
  this.statusRecebimentoService
    .getStatusRecebimento(_params)
    .pipe(
      finalize(() => {
        this.loadingStatusRecebimento = false;
      })
    )
    .subscribe((response) => {
      if (response.status === 200) {
        this.statusRecebimento = response.body['data'];
      }else {
        this.statusRecebimento = [];
      }
    },
    (error: any) => {
      try {
        this.pnotify.error(error.error.message);
        this.statusRecebimento = [];
      } catch (error) {
        this.pnotify.error();
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

  classStatusBorder(notas: ILogisticaEntradaMateriaisNotasFiscais): string {
    let borderClass: string;

    if (notas.IN_STAT == 1) {
      borderClass = 'border-success';
    } else if (notas.IN_STAT == 0) {
      borderClass = 'border-danger';
    }

    return borderClass;
  }

  changeType(nota: ILogisticaEntradaMateriaisNotasFiscais) {
    const stat = nota.IN_STAT == 1 ? 0 : 1;

    this.confirmChange(stat)
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) => {
          if (!result) return EMPTY;

          this.loadingNavBar = true;
          nota.IN_STAT = stat;
          return this.notasFiscaisService.postNotasFiscais({ID_LOGI_ENMA_NOFI:nota.ID_LOGI_ENMA_NOFI, IN_STAT:stat});
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
          try {
            this.pnotify.error(error.error.message);
            nota.IN_STAT = nota.IN_STAT == 1 ? 0 : 1;
          } catch (error) {
            this.pnotify.error();
          }
        });
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
    listagemExport = this.allNotasFiscais;

    this.xlsxService.exportFile(listagemExport, `Notas_Fiscais${dataExport}`);
  }
}
