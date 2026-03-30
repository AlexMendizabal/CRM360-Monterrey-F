import { TecnologiaInformacaoEstoqueMovimentacoesService } from './../../movimentacoes/services/movimentacoes.service';
import { TecnologiaInformacaoEstoqueService } from './../../services/estoque.service';
import { ITecnologiaInformacaoNivelEstoque } from './../../nivel-estoque/models/nivelEstoque';
import { TecnologiaInformacaoEstoqueNivelEstoqueService } from './../../nivel-estoque/services/nivel-estoque.service';
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
import { TecnologiaInformacaoEstoquePainelAprovacaoService } from '../services/painel-aprovacao.service';
import { RouterService } from 'src/app/shared/services/core/router.service';

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
import { ITecnologiaInformacaoEstoquePainelAprovacao } from './../models/painel-aprovacao';


@Component({
  selector: 'tecnologia-informacao-estoque-painel-aprovacao-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class TecnologiaInformacaoEstoquePainelAprovacaoListaComponent
  implements OnInit, OnDestroy {
    
  breadCrumbTree: Array<Breadcrumb>;
  idSubModulo: number;
  noResult: boolean;
  modalRef: BsModalRef;
  form: FormGroup;
  $activatedRouteSubscription: Subscription;
  bsConfig: Partial<BsDatepickerConfig>;
  //LOADINGS
  loading = true;
  loadingDetails = false;
  loadingNavBar = false;
  loadingEmpresas:boolean;

  //VARIAVEIS
  totalItens: any = [];
  empresas = [];
  solicitacoes: Array<ITecnologiaInformacaoEstoquePainelAprovacao>;
  solicitacaoSelecionada: ITecnologiaInformacaoEstoquePainelAprovacao;
  niveisEstoque: Array<ITecnologiaInformacaoNivelEstoque>;
  // CUSTOM TABLE
  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
  };

  // Tipos de Situação das Solicitações (Aprovada/Reprovada/Pendente)
  tipos = [
    {
      cod: 'APROVADO',
      nome: 'Aprovada',
    },
    {
      cod: 'REPROVADO',
      nome: 'Reprovada',
    },
    {
      cod: 'PENDENTE',
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
    private aprovacoesService: TecnologiaInformacaoEstoquePainelAprovacaoService,
    private movimentacoesService:TecnologiaInformacaoEstoqueMovimentacoesService,
    private formBuilder: FormBuilder,
    private xlsxService: XlsxService,
    private modalService: BsModalService,
    private nivelEstoqueService: TecnologiaInformacaoEstoqueNivelEstoqueService,
    private confirmModalService: ConfirmModalService,
    private estoqueService: TecnologiaInformacaoEstoqueService,
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
  }

  ngOnDestroy() {
    this.$activatedRouteSubscription.unsubscribe();
    if(this.modalRef != undefined){
      this.modalRef.hide();
    }
  }

  onActivatedRoute() {
    this.$activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (response) => {
        const _response = this.routerService.getBase64UrlParams(response);
        this.form.patchValue(_response);
        if (_response.hasOwnProperty('TT_REGI_PAGI'))
          this.itemsPerPage = _response.TT_REGI_PAGI;
        this.getAprovacoes(this.getParams());
      }
    );
  }

  getEmpresas(params?) {
    this.loadingEmpresas = true;
    const _params = params ?? {};
    _params.IN_STAT = '1';
    this.estoqueService
      .getEmpresas(_params)
      .pipe(
        finalize(() => {
          this.loadingEmpresas = false;
        })
      )
      .subscribe((response) => {
        if (response.status === 200) {
          this.empresas = response.body['result'];
        }
      });
  }



  openModal(template: TemplateRef<any>, status) {
    this.getEmpresas();
    this.solicitacaoSelecionada = status;
    this.modalRef = this.modalService.show(template, {
      animated: false,
      class: 'modal-xl',
    });
  }

  hideModal() {
    this.modalRef.hide();
  }


  getNiveisEstoque(id: Partial<ITecnologiaInformacaoNivelEstoque>) {
    this.nivelEstoqueService
      .getNiveisEstoque({ID_TEIN_ESTO_PROD: id})
      .pipe(
        finalize(() => {
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            console.log(response.body['data'])
            this.niveisEstoque = response.body['data'];
          } else {
            this.niveisEstoque = [];
            this.pnotify.notice('Não encontramos nenhuma detalhe do produto!');
          }
        },
        (error) => {
          this.pnotify.error();
          this.noResult = true;
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
      ID_TEIN_ESTO_APRO: [null],
      ID_TEIN_ESTO_PROD: [null],
      SG_SIST_ORIG: [null],
      UUID_EMPR: [null, [Validators.required]],
      DS_UNID_MEDI: [null],
      DS_APRO: [null],
      DS_PARE: [null, [Validators.required, Validators.minLength(3)]],
      MATR_USUA_CADA: [null],
      DS_USUA_CADA: [null],
      DT_INCL: [null],
      DT_INIC: [new Date()],
      DT_FINA: [new Date()],
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
        routerLink: `/tecnologia-informacao/home`,
      },
      {
        descricao: 'Inventario',
        routerLink: `/tecnologia-informacao/estoque/${id}`,
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



  getAprovacoes(params?) {
    if (!this.loading) this.loadingNavBar = true;
    this.aprovacoesService
      .getAprovacoes(params)
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

  classStatusBorder(status: ITecnologiaInformacaoEstoquePainelAprovacao): string {
    let borderClass: string;

    if (status.DS_APRO == 'APROVADO') {
      borderClass = 'border-success';
    } else if (status.DS_APRO == 'REPROVADO') {
      borderClass = 'border-danger';
    } else if (status.DS_APRO == 'PENDENTE') {
      borderClass = 'border-primary';
    }

    return borderClass;
  }

  requestSuccess(status: ITecnologiaInformacaoEstoquePainelAprovacao) {
    const stat = 1;
    this.confirmChange(stat)
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) => {
          if (!result) return EMPTY;

          this.loadingNavBar = true;
          status.DS_APRO = 'APROVADO';
          status.UUID_EMPR = this.form.get('UUID_EMPR').value;
          status.DS_PARE = this.form.get('DS_PARE').value;
          return this.aprovacoesService.postAprovacoes(status);
        }),
        finalize(() => {
          this.loadingNavBar = false;
          this.form.reset();
        })
      )
      .subscribe(
        (success: any) => {
          this.pnotify.success();
          this.hideModal();
          this.getAprovacoes();
        },
        (error: any) => {
          this.pnotify.error('Erro ao aprovar a solicitação');
        }
      );
  }

  requestFail(status: ITecnologiaInformacaoEstoquePainelAprovacao) {
    const stat = 2;

    this.confirmChange(stat)
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) => {
          if (!result) return EMPTY;
          this.loadingNavBar = true;
          status.DS_APRO = 'REPROVADO';
          status.UUID_EMPR = this.form.get('UUID_EMPR').value;
          status.DS_PARE = this.form.get('DS_PARE').value;
          return this.aprovacoesService.postAprovacoes(status);
        }),
        finalize(() => {
          this.loadingNavBar = false;
          this.form.reset();
        })
      )
      .subscribe(
        (success: any) => {
          this.pnotify.success();
          this.hideModal();
          this.getAprovacoes();
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
