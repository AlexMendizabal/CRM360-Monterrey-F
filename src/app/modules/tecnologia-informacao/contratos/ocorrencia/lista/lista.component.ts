import { ITecnologiaInformacaoEstoqueProduto } from './../../../estoque/produtos/models/produto';
import { TecnologiaInformacaoEstoqueProdutosService } from './../../../estoque/produtos/services/produtos.service';
import { TecnologiaInformacaoCadastroModeloService } from './../../modelo/services/modelo.service';
import { ITecnologiaInformacaoModelo } from './../../../contratos/modelo/models/modelo';
import { TecnologiaInformacaoCadastroTipoItemService } from './../../tipo-item/services/tipo-item.service';
import { ITecnologiaInformacaoTipoItem } from './../../tipo-item/models/tipoItem';
import { ITecnologiaInformacaoContratosDocumentos } from './../models/documentos';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ConfirmModalService } from './../../../../../shared/modules/confirm-modal/confirm-modal.service';
//angular
import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';

//servicos
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { TecnologiaInformacaoCadastroOcorrenciaService } from '../services/ocorrencia.service';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { XlsxService } from 'src/app/shared/modules/xlsx/xlsx.service';

// rxjs
import { finalize, take, switchMap } from 'rxjs/operators';
import { Subscription, EMPTY } from 'rxjs';

//ocorrencias
import { Subtitles } from './../../../../../shared/modules/subtitles/subtitles';
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { DateService } from 'src/app/shared/services/core/date.service';

import { ITecnologiaInformacaoOcorrencia } from './../models/ocorrencia';
import { CustomTableConfig } from './../../../../../shared/templates/custom-table/models/config';
import { ITecnologiaInformacaoResponsaveis } from '../models/responsaveis';


@Component({
  selector: 'tecnologia-informacao-cadastros-ocorrencia-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class TecnologiaInformacaoCadastrosOcorrenciaListaComponent
  implements OnInit, OnDestroy {
  breadCrumbTree: Array<Breadcrumb>;

  idSubModulo: number;
  ocorrencias: Array<ITecnologiaInformacaoOcorrencia>;
  ocorrenciaSelecionada: Array<ITecnologiaInformacaoOcorrencia>;
  responsaveis=[];
  noResponsaveisParecer: boolean;
  noResponsaveis: boolean;
  noResult: boolean;
  noPareceres: boolean;
  loadingResponsaveis: boolean;
  loadingDocumentosParecer= true;
  loadingResponsaveisParecer= true;
  loadingPareceres= true;
  loading = true; //Loading FullPage
  loadingNavBar = false; //Loading do NAVBAR
  ocorrenciaId:number;
  $activatedRouteSubscription: Subscription;
  modalRef1: BsModalRef;
  modalRef2: BsModalRef;
  form: FormGroup;
  hiddenModal: boolean = false;
  documentosParecer = {};
  responsaveisParecer = {};
  pareceres: Array<ITecnologiaInformacaoOcorrencia> = [];
  testes = []
  imagensOcorrencia: Array<ITecnologiaInformacaoContratosDocumentos> = [];
  totalImagensOcorrencia:number;
  totalDocumentosOcorrencia:number;
  loadingImagensOcorrencia:boolean;
  documentosOcorrencia: Array<ITecnologiaInformacaoContratosDocumentos> = [];
  loadingDocumentosOcorrencias:boolean;
  loadingProduto: boolean;
  produtos: ITecnologiaInformacaoEstoqueProduto[] = [];
  // CUSTOM TABLE
  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
  };

  // Tipos de Situação dos Ocorrencias (Ativo/Inativo)
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

  status = [
    {
      cod: '1',
      nome: 'Concluída',
    },
    {
      cod: '0',
      nome: 'Em andamento',
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
  itemsPerPage = 100;
  totalItems = 10;
  currentPage = 1;
  /* Pagination */

  constructor(
    private route: Router,
    private pnotify: PNotifyService,
    private activatedRoute: ActivatedRoute,
    private ocorrenciaService: TecnologiaInformacaoCadastroOcorrenciaService,
    private formBuilder: FormBuilder,
    private xlsxService: XlsxService,
    private modalService: BsModalService,
    private produtoService: TecnologiaInformacaoEstoqueProdutosService,
    private confirmModalService: ConfirmModalService,
    private routerService: RouterService,
    private dateService: DateService
  ) {}

  ngOnInit() {
    this.buildForm();
    this.setBreadCrumb();
    this.onActivatedRoute();
    this.getProdutos();
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
        this.getOcorrencia(this.getParams());
      }
    );
  }

  buildForm() {
    this.form = this.formBuilder.group({
      ID_TEIN_OCOR: [null],
      NR_MATR: [null],
      NM_USUA: [null],
      CD_ITEM: [null],
      ID_TEIN_ESTO_PROD: [null],
      IN_STAT: [null],
      DS_OBSE: [null],
      IN_FINA: [null],
      PAGI: [1],
      TT_REGI_PAGI: [this.itemsPerPage],
      TIME: [new Date().getTime()],
    });
  }

  getProdutos(params?: Partial<ITecnologiaInformacaoEstoqueProduto>) {
    const _params = params ?? {};
    _params.IN_STAT = '1';
    _params.IN_PAGI = '0';

    this.loadingProduto = true;
    this.produtoService
      .getProdutos(_params)
      .pipe(
        finalize(() => {
          this.loadingProduto = false;
        })
      )
      .subscribe((response) => {
        if (response.status === 200) {
          this.produtos = response.body['data'];
        }
      });
  }


  onReset() {
    this.form.reset();
    this.form.patchValue({
      PAGI: 1,
      TT_REGI_PAGI: 100,
      TIME: [new Date().getTime()],
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
        descricao: 'Ocorrências',
      },
    ];
  }

  getResponsaveis(params?) {
    this.noResponsaveis = true;
    this.loadingResponsaveis = true;
    this.ocorrenciaService
      .getResponsaveis(params)
      .pipe(
        finalize(() => {
          this.loadingResponsaveis = false;
        })
      )
      .subscribe((response) => {
        if (response.status !== 200) {
          this.pnotify.notice('Nenhum responsável encontrado!')
          this.noResponsaveis = true;
          return;
        }
        this.responsaveis = response['body']['data'];
        this.noResponsaveis = false;
      },
      (error) => {
        this.noResponsaveis = true;
        this.pnotify.error('Não foi encontrado nenhum responsável');
      }
    );
  }

  onFilter() {
    this.form.get('TIME').setValue(new Date().getTime());
    this.route.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams()),
    });
  }

  openModal(template: TemplateRef<any>, ocorrencia) {
    this.noPareceres =true;
    this.totalDocumentosOcorrencia = 0;
    this.totalImagensOcorrencia = 0;
    const _params = {ID_TEIN_OCOR: ocorrencia['ID_TEIN_OCOR']}
    const _paramsImagem = {..._params, TP_DOCU: 'IMAGEM'}
    const _paramsDocumento = {..._params, TP_DOCU: 'DOCUMENTO' }
    this.getImagensOcorrencia (_paramsImagem)
    this.getDocumentosOcorrencia(_paramsDocumento)
    this.getResponsaveis(_params)
    this.getParecer(_params)
    this.ocorrenciaSelecionada = ocorrencia;
    this.modalRef1 = this.modalService.show(template, {
      animated: false,
      class: 'modal-xl',
    });
  }
  hideModal() {
    this.modalRef1.hide();
  }

  getDocumentosOcorrencia(params?) {
    this.loadingDocumentosOcorrencias = true;
    this.ocorrenciaService.getDocumento(params).subscribe(
      (response) => {
        if (response.status === 200) {
          this.documentosOcorrencia = response.body['data'];
          this.totalDocumentosOcorrencia = response.body['data'].length
          this.loadingDocumentosOcorrencias = false;
        } else {
          this.documentosOcorrencia = [];
          this.totalDocumentosOcorrencia = 0;
          this.loadingDocumentosOcorrencias = false;
        }
      },
      (error) => {
        this.documentosOcorrencia = [];
        this.loadingDocumentosOcorrencias = false;
      }
    );
  }

  onTermo(ocorrencia: ITecnologiaInformacaoOcorrencia): void {
    const id = this.activatedRoute.snapshot.params.idSubModulo;
    this.route.navigate(
      [`/tecnologia-informacao/contratos/${id}/termo-devolucao`, ocorrencia.ID_TEIN_OCOR],
      {
        relativeTo: this.activatedRoute,
      }
    );
  }

  getImagensOcorrencia(params?) {
    this.loadingImagensOcorrencia = true;
    this.ocorrenciaService.getDocumento(params).subscribe(
      (response) => {
        if (response.status === 200) {
          this.imagensOcorrencia = response.body['data'];
          this.totalImagensOcorrencia = response.body['data'].length
          this.loadingImagensOcorrencia = false;
        } else {
          this.imagensOcorrencia = [];
          this.totalImagensOcorrencia = 0;
          this.loadingImagensOcorrencia = false;
        }
      },
      (error) => {
        this.imagensOcorrencia = [];
        this.loadingImagensOcorrencia = false;
      }
    );
  }

  getOcorrencia(params?) {
    if (!this.loading) this.loadingNavBar = true;

    this.ocorrenciaService
      .getOcorrencia(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.ocorrencias = response.body['data'];
            this.totalItems = response.body['total'];
            this.noResult = false;
          } else {
            this.noResult = true;
            this.ocorrencias = [];
          }
        },
        (error) => {
          this.pnotify.error();
          this.noResult = true;
        }
      );
  }

  changeType(ocorrencias: ITecnologiaInformacaoOcorrencia) {
    const stat = ocorrencias.IN_STAT == '1' ? '0' : '1';

    this.confirmChange(stat)
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) => {
          if (!result) return EMPTY;

          this.loadingNavBar = true;
          ocorrencias.IN_STAT = stat;
          return this.ocorrenciaService.postOcorrencia(ocorrencias);
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
          ocorrencias.IN_STAT = ocorrencias.IN_STAT == '1' ? '0' : '1';
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

  onPageChanged(event) {
    this.form.get('PAGI').setValue(event.page);
    this.onFilter();
  }

  setPageRegistros(itemsPerPage) {
    this.itemsPerPage = itemsPerPage;
    this.onFilter();
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

  onFecharModal(event){
    if(event == true){
      this.hideModalParecer()
      this.getParecer({ID_TEIN_OCOR:  this.ocorrenciaSelecionada['ID_TEIN_OCOR'],IN_STAT: '1'});
      this.ocorrenciaService
      .getOcorrencia({ID_TEIN_OCOR:  this.ocorrenciaSelecionada['ID_TEIN_OCOR'],})
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.ocorrenciaSelecionada = response.body['data'][0];
          } 
          return
        },
      );
    } 
    return
  }

  openModalParecer(template: TemplateRef<any>) {
    const id = this.ocorrenciaSelecionada['ID_TEIN_OCOR']
    this.ocorrenciaId = id
    this.hiddenModal = true;
    this.modalRef2 = this.modalService.show(template, {
      animated: true,
      class: 'modal-lg',
      backdrop: 'static',
    });
  }
  hideModalParecer() {
    this.hiddenModal = false
    this.modalRef2.hide();
  }

  getParecer(params?) {
    this.loadingPareceres = true;
    params = {...params, ORDE_TYPE:'desc'}
    this.ocorrenciaService.getParecer(params)
    .subscribe(
      (response) => {
        if (response.status === 200) {
          this.pareceres = response.body['data'];
          this.noPareceres = false;
          this.pareceres.forEach(parecer => {
            this.getDocumentoParecer(parecer)
            this.getResponsaveisParecer(parecer)
            this.loadingPareceres = false;
          });
        } else {
          this.pareceres = [];
          this.noPareceres = true;
          this.loadingPareceres = false;
        }
      },
      (error) => {
        this.pareceres = [];
        this.noPareceres = true;
        this.loadingPareceres = false;
      }
    );
  }

  getDocumentoParecer(params: ITecnologiaInformacaoOcorrencia) {
    this.loadingDocumentosParecer = true;
    this.ocorrenciaService
      .getDocumentoParecer(params)
      .pipe(
        finalize(() => {
          this.loadingDocumentosParecer = false;
        })
      )
      .subscribe(async (response) => {
        if (response.status !== 200) {
          return;
        }
        const documentos = response['body']['data'];
        this.documentosParecer[params.ID_TEIN_OCPR] = documentos;
      },
      (error) => {
        this.pnotify.error('Não foi encontrado nenhum documento');
      }
    );
  }

  getResponsaveisParecer(params: Partial<ITecnologiaInformacaoResponsaveis>) {
    this.loadingResponsaveisParecer = true;
    this.ocorrenciaService
      .getResponsaveisParecer(params)
      .pipe(
        finalize(() => {
          this.loadingResponsaveisParecer = false;
        })
      )
      .subscribe(async (response) => {
        if (response.status !== 200) {
        this.noResponsaveisParecer = true;
          return;
        }
        const responsaveis = response['body']['data'];
        this.noResponsaveisParecer = false;
        this.responsaveisParecer[params.ID_TEIN_OCPR] = responsaveis;
      },
      (error) => {
        this.pnotify.error('Não foi encontrado nenhum responsável');
        this.noResponsaveisParecer = true;
      }
    );
  }

  finalizarOcorrencia(ocorrencias: ITecnologiaInformacaoOcorrencia) {
    const stat = ocorrencias.IN_FINA == 1 ? 0 : 1;

    this.confirmChangeOcorrencia(stat)
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) => {
          if (!result) return EMPTY;

          this.loadingNavBar = true;
          ocorrencias.IN_FINA = stat;
          return this.ocorrenciaService.postOcorrencia(ocorrencias);
        }),
        finalize(() => {
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (success: any) => {
          this.pnotify.success('Ocorrência concluída com sucesso!');
        },
        (error: any) => {
          ocorrencias.IN_FINA = ocorrencias.IN_FINA == 1 ? 0 : 1;
          this.pnotify.error();
        }
      );
  }

  confirmChangeOcorrencia(stat): any {
    if (stat != 1){
      this.pnotify.notice('Erro ao concluir ocorrência!')
      return ;
    }
    return this.confirmModalService.showConfirm(
      null,
      'Confirmar Finalização da Ocorrência',
      'Deseja realmente concluir a ocorrência?',
      'Cancelar',
      'Confirmar'
    );
  }

  onExport(): void {
    let data = new Date().toLocaleDateString().split('/'),
      dataExport = `${data[0]}${data[1]}${data[2]}`;

    let listagemExport: any = [];
    listagemExport = this.ocorrencias;

    this.xlsxService.exportFile(listagemExport, `Ocorrencias_${dataExport}`);
  }
}
