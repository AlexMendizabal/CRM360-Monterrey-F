import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { PageChangedEvent } from 'ngx-bootstrap/pagination/ngx-bootstrap-pagination';
import { ptBrLocale } from 'ngx-bootstrap/locale';
defineLocale('pt-br', ptBrLocale);

import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { DateService } from 'src/app/shared/services/core/date.service';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';

import { AbastecimentoMonitoresIntegracaoPedidosService } from './integracao-pedidos.service';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'integracao-pedidos',
  templateUrl: './integracao-pedidos.component.html',
  styleUrls: ['./integracao-pedidos.component.scss']
})
export class AbastecimentoMonitoresIntegracaoPedidosComponent implements OnInit {
  loaderFullScreen: boolean = true;
  loaderNavbar: boolean;
  loading: boolean = false;
  loadingDetalhes: boolean = false;
  loadingLogs: boolean = false;
  noResult: boolean = false;
  noResultDetalhes: boolean = false;
  noResultLogs: boolean = false;
  visibleEtapas: boolean = false;

  bsConfig: Partial<BsDatepickerConfig>;

  form: FormGroup;

  breadCrumbTree: any = [];
  dados: any = [];
  dadosDetalhes: any = [];
  dadosLogs: any = [];
  dadosExcel: any = [];
  integradores: any = [];
  depositos: any = [
    { id: 1, name: "Tiete" },
    { id: 2, name: "RDP" },
    { id: 3, name: "Osasco" },
    { id: 4, name: "MT COGI" }
  ];
  linhas: any = [];
  subLinhas: any = [];
  classes: any = [];
  materiais: any = [];
  situacoes: any = [];

  /* Ordenação */
  reverse: boolean = false;
  key: string = 'NM_EMPR';
  /* Ordenação */

  /* Ordenação modal */
  reverseA: boolean = false;
  keyA: string = 'NR_ITEM_PEDI';

  reverseB: boolean = false;
  keyB: string = 'NR_ITEM_PEDI';

  /* Paginação */
  itemsPerPage: number = 15;
  totalItems: number = 15;
  currentPage: number = 1;
  begin: number = 0;
  end: number = 15;
  /* Paginação */

  /* PaginationModal*/
  currentPageA: number = 1;
  beginA: number = 0;
  endA: number = 15;

  currentPageB: number = 1;
  beginB: number = 0;
  endB: number = 15;

  activatedRouteSubscription: Subscription;

  /* dados do usuário */
  currentUser: any = JSON.parse(localStorage.getItem('currentUser'));
  idUsuario: any = this.currentUser['info']['id'];
  /* dados do usuário */

  modal: any = [];

  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private localeService: BsLocaleService,
    private pnotifyService: PNotifyService,
    private atividadesService: AtividadesService,
    private routerService: RouterService,
    private titleService: TitleService,
    private dateService: DateService,
    private service: AbastecimentoMonitoresIntegracaoPedidosService
  ) {
    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );
    this.form = this.formBuilder.group({
      dataInicial: [null],
      dataFinal: [null],
      integrador: [null, Validators.required],
      depositos: [null],
      linha: [null],
      subLinha: [null],
      classe: [null],
      material: [null],
      situacao: [null],
      // qtItensPagina: [this.itemsPerPageParam],
      // pagina: [this.currentPage],
      // orderBy: [null],
      // orderType: [null]
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.loaderFullScreen = false;
    }, 1000);
    this.registrarAcesso();
    this.setBreadCrumb();
    this.titleService.setTitle('Integração de Pedidos');
    this.checkRouterParams();
    this.getLinhas();
    this.getSituacoes();
    this.getIntegradoresPedidos();
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  setBreadCrumb(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/abastecimento/home'
        },
        {
          descricao: 'Monitores',
          routerLink: `/abastecimento/monitores/${params['idSubModulo']}`
        },
        {
          descricao: 'Integração de Pedidos'
        }
      ];
    });
  }

  checkRouterParams(): void {
    this.activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (queryParams: any) => {
        if (Object.keys(queryParams).length > 0) {
          let _response = this.routerService.getBase64UrlParams(queryParams);
          //busca de dados
          this.search(_response);
          this.setFormValues(_response);
        }
      }
    );
    this.activatedRouteSubscription.unsubscribe();
  }

  setFormValues(queryParams) {
    let dataInicial = queryParams['DT_INIC_ENVI']
      ? queryParams['DT_INIC_ENVI']
      : null;
    let dataFinal = queryParams['DT_FINA_ENVI'] ? queryParams['DT_FINA_ENVI'] : null;
    let integrador = [];
    integrador = queryParams['ID_APOI_INTE_PEDI'] ? queryParams['ID_APOI_INTE_PEDI'] : null;
    let depositos = queryParams['ID_DEPO'] ? queryParams['ID_DEPO'] : null;
    let situacao = queryParams['ID_STAT_PEDI'] ? queryParams['ID_STAT_PEDI'] : null;
    let linha = queryParams['ID_LINH'] ? queryParams['ID_LINH'] : null;
    let subLinha = queryParams['ID_SUB_LINH'] ? queryParams['ID_SUB_LINH'] : null;
    let classe = queryParams['ID_CLAS'] ? queryParams['ID_CLAS'] : [];
    let material = queryParams['ID_MATE'] ? queryParams['ID_MATE'] : null;

    //consulta para recarregamento dos dados no form
    this.getDadosForm({ linha, subLinha, classe, integrador });

    this.form.patchValue({
      dataInicial: dataInicial,
      dataFinal: dataFinal,
      integrador: integrador,
      depositos: depositos,
      linha: linha,
      subLinha: subLinha,
      classe: classe,
      material: material,
      situacao: situacao,
      // qtItensPagina: this.itemsPerPageParam,
      // pagina: this.currentPage,
      // orderBy: orderBy,
      // orderType: orderType
    });

  }

  getDadosForm(params) {
    /* Alimenta select depositos */
    if (params['integrador'] !== null) {
      let _params = {
        ID_APOI_INTE_PEDI: params['integrador']
      };

      this.service
        .getIntegradorDepositos(_params)
        .pipe(finalize(() => (this.loaderNavbar = false)))
        .subscribe(
          res => {
            if (Object.keys(res).length > 0) {
              if (res.status === 200) {
                this.depositos = res['body']['result'];
                this.setFormEnable(['depositos']);
              }
            }
          },
          error => {
            this.pnotifyService.error('Erro ao carregar Integradores');
          }
        );
    } else {
      this.loaderNavbar = false;
      this.setFormDisable(['depositos']);
    }

    /* Alimenta select Sublinha */
    if (params['linha'] !== null) {
      let campos = ['subLinha'];

      this.service
        .getSubLinhas(params['linha'], 1)
        .pipe(finalize(() => (this.loaderNavbar = false)))
        .subscribe(
          (res: any) => {
            if (Object.keys(res).length > 0) {
              if (res.status === 200) {
                if (res['body']['responseCode'] === 200) {
                  this.subLinhas = res['body']['result'];
                  this.setFormEnable(campos);
                } else if (res['body']['responseCode'] === 404) {
                  this.setFormDisable(campos);
                }
              }
            }
          },
          error => {
            this.pnotifyService.error('Erro ao carregar Sublinhas');
          }
        );
    } else {
      this.setFormDisable(['subLinha']);
    }

    /* Alimenta select Classes */
    if (params['linha'] !== null) {
      let campos = ['classe'];

      this.service
        .getClasses(params['linha'], params['subLinha'], 1)
        .pipe(finalize(() => (this.loaderNavbar = false)))
        .subscribe(
          (res: any) => {
            if (Object.keys(res).length > 0) {
              if (res.status === 200) {
                this.classes = res['body']['result'];
                this.setFormEnable(campos);
              }
            }
          },
          error => {
            this.pnotifyService.error('Erro ao carregar Classes');
          }
        );
    }

    /* Alimenta select Materiais */
    if (Object.keys(params['classe']).length > 0) {
      let campos = ['material'];

      this.service
        .getMateriais(
          params['classe'],
          "",
          1
        )
        .pipe(finalize(() => (this.loaderNavbar = false)))
        .subscribe(
          (res: any) => {
            if (Object.keys(res).length > 0) {
              if (res['body'].responseCode === 200) {
                this.materiais = res['body'].result;
                this.setFormEnable(campos);
              } else if (
                res['body']['responseCode'] === 204 ||
                res['body']['responseCode'] === 404
              ) {
                this.setFormDisable(campos);
                this.pnotifyService.notice(
                  'Não há materiais cadastrados para essa classe'
                );
              }
            }
            this.loaderNavbar = false;
          },
          error => {
            this.pnotifyService.error('Erro ao carregar filtro Materias');
          }
        );
    } else {
      this.loaderNavbar = false;
      this.setFormDisable(['material']);
    }
  }

  getIntegradoresPedidos(): void {
    this.loaderNavbar = true;
    this.integradores = [];

    let idSituacao = 1;

    this.service
      .getIntegradoresPedidos(idSituacao)
      .pipe(finalize(() => (this.loaderNavbar = false)))
      .subscribe(
        res => {
          if (Object.keys(res).length > 0) {
            if (res.status === 200) {
              this.integradores = res['body']['result'];
            }
          }
        },
        error => {
          this.pnotifyService.error('Erro ao carregar Integradores');
        }
      );
  }

  getIntegradorDepositos(): void {
    this.loaderNavbar = true;
    this.depositos = [];

    if (this.form.get('integrador').status === 'VALID') {
      let params = {
        ID_APOI_INTE_PEDI: this.form.value['integrador']
      };

      this.service
        .getIntegradorDepositos(params)
        .pipe(finalize(() => (this.loaderNavbar = false)))
        .subscribe(
          res => {
            if (Object.keys(res).length > 0) {
              if (res.status === 200) {
                this.depositos = res['body']['result'];
                this.setFormEnable(['depositos']);
              }
            }
          },
          error => {
            this.pnotifyService.error('Erro ao carregar Integradores');
          }
        );
    } else {
      this.loaderNavbar = false;
      this.setFormDisable(['depositos']);
      this.setFormReset(['depositos']);
    }
  }

  getLinhas(): void {
    this.loaderNavbar = true;
    this.linhas = [];

    let campos = ['classe', 'subLinha', 'material', 'depositos'];
    this.setFormDisable(campos);

    let idSituacao = 1;

    this.service
      .getLinhas(idSituacao)
      .pipe(finalize(() => (this.loaderNavbar = false)))
      .subscribe(
        res => {
          if (Object.keys(res).length > 0) {
            if (res.status === 200) {
              this.linhas = res['body']['result'];
            }
          }
        },
        error => {
          this.pnotifyService.error('Erro ao carregar Linhas');
        }
      );
  }

  getSituacoes(): void {
    this.loaderNavbar = true;
    this.situacoes = [];

    this.service
      .getSituacoes()
      .pipe(finalize(() => (this.loaderNavbar = false)))
      .subscribe(
        res => {
          if (Object.keys(res).length > 0) {
            if (res.status === 200) {
              this.situacoes = res['body']['result'];
            }
          }
        },
        error => {
          this.pnotifyService.error('Erro ao carregar Situações');
        }
      );
  }

  getSubLinhas(): void {
    this.loaderNavbar = true;
    let campos = ['subLinha', 'classe', 'material'];
    this.setFormReset(campos);
    this.setFormDisable(campos);

    this.subLinhas = [];

    if (this.form.get('linha').status === 'VALID') {
      let descricaoLinhas = this.form.get('linha').value;
      let idSituacao = 1;
      this.service
        .getSubLinhas(descricaoLinhas, idSituacao)
        .pipe(finalize(() => (this.loaderNavbar = false)))
        .subscribe(
          res => {
            if (Object.keys(res).length > 0) {
              if (res.status === 200) {
                if (res['body']['responseCode'] === 200) {
                  this.subLinhas = res['body']['result'];
                  this.setFormEnable(['subLinha']);
                } else if (res['body']['responseCode'] === 404) {
                  this.pnotifyService.notice('Não há sublinha cadastrada');
                }
              }
            }
          },
          error => {
            this.pnotifyService.error('Erro ao carregar sublinhas');
          }
        );
    } else {
      this.loaderNavbar = false;
      this.setFormDisable(['subLinha']);
    }
  }

  getClasses(): void {
    this.classes = [];
    this.loaderNavbar = true;

    let campos = ['classe'];
    this.setFormReset(campos);

    if (
      this.form.value['linha'] != null &&
      this.form.value['linha'].length > 0
    ) {
      let descricaoLinhas = this.form.get('linha').value;
      let idSubLinha = this.form.get('subLinha').value;
      let idSituacao = 1;

      this.service
        .getClasses(descricaoLinhas, idSubLinha, idSituacao)
        .pipe(finalize(() => (this.loaderNavbar = false)))
        .subscribe(
          res => {
            if (Object.keys(res).length > 0) {
              if (res.status === 200) {
                this.classes = res['body']['result'];
                this.setFormEnable(campos);
              }
            }
          },
          error => {
            this.pnotifyService.error('Erro ao carregar Classes');
          }
        );
    } else {
      this.loaderNavbar = false;
      this.setFormDisable(campos);
    }
  }

  getMateriais(): void {
    this.materiais = [];
    this.loaderNavbar = true;
    let campos = ['material'];
    this.setFormReset(campos);

    let idClasses = this.form.get('classe').value;
    let idTipoMaterial = "";
    let idSituacao = 1;
    if (
      this.form.value['classe'] != null &&
      this.form.value['classe'].length > 0
    ) {
      this.service
        .getMateriais(idClasses, idTipoMaterial, idSituacao)
        .pipe(finalize(() => (this.loaderNavbar = false)))
        .subscribe(
          (res: any) => {
            if (Object.keys(res).length > 0) {
              if (res['body'].responseCode === 200) {
                this.materiais = res['body'].result;
                this.setFormEnable(campos);
              } else if (
                res['body']['responseCode'] === 204 ||
                res['body']['responseCode'] === 404
              ) {
                this.materiais = [];
                this.setFormDisable(campos);
                this.pnotifyService.notice(
                  'Não há materiais cadastrados para essa classe'
                );
              }
            }
            this.loaderNavbar = false;
          },
          error => {
            this.pnotifyService.error('Erro ao carregar filtro Materias');
          }
        );
    } else {
      this.loaderNavbar = false;
      this.setFormDisable(campos);
    }
  }

  onFilter() {
    let dataInicial = this.setDateValid(this.form.value['dataInicial']);
    let dataFinal = this.setDateValid(this.form.value['dataFinal']);

    this.setRouterParams({
      DT_INIC_ENVI: dataInicial ? dataInicial : "",
      DT_FINA_ENVI: dataFinal ? dataFinal : "",
      ID_APOI_INTE_PEDI: this.form.value['integrador'] ? this.form.value['integrador'] : "",
      ID_DEPO: this.form.value['depositos'] ? this.form.value['depositos'] : "",
      ID_LINH: this.form.value['linha'] ? this.form.value['linha'] : "",
      ID_SUB_LINH: this.form.value['subLinha'] ? this.form.value['subLinha'] : "",
      ID_CLAS: this.form.value['classe'] ? this.form.value['classe'] : "",
      ID_MATE: this.form.value['material'] ? this.form.value['material'] : "",
      ID_STAT_PEDI: this.form.value['situacao'] ? this.form.value['situacao'] : "",
      IN_INCL_ITEM_PEDI: "",
      IN_GERA_RELA_EXCE: "",
      ID_USUA: "",
      TT_REGI_PAGI: "",
      NR_PAGE_INIC: "",
      ORDE_BY: "",
      ORDE_TYPE: ""
    });
  }

  setRouterParams(params) {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(params)
    });
    //busca dados
    this.search(params);
  }

  search(params: any): void {
    this.loaderNavbar = true;
    this.loading = false;

    this.service
      .getPedidosIntegracao(params)
      .pipe(finalize(() => (this.loaderNavbar = false)))
      .subscribe(
        (res: any) => {
          if (res.status === 200) {
            if (res['body']['responseCode'] === 200) {
              this.dados = res['body']['result'];
              this.loading = true;
              this.noResult = false;
            } else if (res['body']['responseCode'] === 404) {
              this.noResult = true;
              this.pnotifyService.notice('Não há dados');
            }
          }
        },
        error => {
          this.pnotifyService.error('Erro ao carregar dados');
          this.noResult = true;
        }
      );
  }

  excelExport() {
    let dataInicial = this.setDateValid(this.form.value['dataInicial']);
    let dataFinal = this.setDateValid(this.form.value['dataFinal']);

    let params = {
      DT_INIC_ENVI: dataInicial ? dataInicial : "",
      DT_FINA_ENVI: dataFinal ? dataFinal : "",
      ID_APOI_INTE_PEDI: this.form.value['integrador'] ? this.form.value['integrador'] : "",
      ID_DEPO: this.form.value['depositos'] ? this.form.value['depositos'] : "",
      ID_LINH: this.form.value['linha'] ? this.form.value['linha'] : "",
      ID_SUB_LINH: this.form.value['subLinha'] ? this.form.value['subLinha'] : "",
      ID_CLAS: this.form.value['classe'] ? this.form.value['classe'] : "",
      ID_MATE: this.form.value['material'] ? this.form.value['material'] : "",
      ID_STAT_PEDI: this.form.value['situacao'] ? this.form.value['situacao'] : "",
      IN_INCL_ITEM_PEDI: 1,
      IN_GERA_RELA_EXCE: 1,
      ID_USUA: parseInt(this.idUsuario),
      TT_REGI_PAGI: "",
      NR_PAGE_INIC: "",
      ORDE_BY: "",
      ORDE_TYPE: ""
    };

    this.getPedidosIntegracaoExcel(params);
  }

  getPedidosIntegracaoExcel(params) {
    this.loaderNavbar = true;
    this.dadosExcel = [];

    this.service
      .getPedidosIntegracao(params)
      .pipe(finalize(() => (this.loaderNavbar = false)))
      .subscribe(
        (res: any) => {
          if (Object.keys(res).length > 0) {
            if (res['body']['responseCode'] === 200) {
              this.dadosExcel = res['body']['result'];
              this.pnotifyService.success(this.dadosExcel);
            } else if (
              res['body']['responseCode'] === 404
            ) {
              this.pnotifyService.notice('Nenhuma informação encontrada');
            }
          }
        },
        error => {
          this.pnotifyService.error('Erro ao carregar para excel dados');
        }
      );
  }

  onDetalhes(item) {
    this.modal.codFornecedor = item.ID_FORN_REFE_ERP;
    this.modal.descFornecedor = item.NM_FORN;
    this.modal.nPedido = item.NR_PEDI;
    this.modal.linhaPedido = item.NM_LINH;
    this.modal.condPagamento = item.DS_COND_PAGA;
    this.modal.dataEnvio = item.DT_ULTI_ENVI_PEDI;

    let params = {
      ID_INTE_PEDI_COMP: item.ID
    }

    this.getPedidosIntegracaoItens(params);
  }

  onLogs(item) {
    let params = {
      ID_INTE_PEDI_COMP: item.ID ? item.ID : "",
      ID_INTE_PEDI_COMP_ITEM: item.ID_ITEM_PEDI ? item.ID_ITEM_PEDI : "",
    }

    this.getPedidosIntegracaoLogs(params)
  }

  getPedidosIntegracaoLogs(params) {
    this.loaderNavbar = true;
    this.loadingLogs = false;

    this.service
      .getPedidosIntegracaoLogs(params)
      .pipe(finalize(() => (this.loaderNavbar = false)))
      .subscribe(
        (res: any) => {
          if (res.status === 200) {
            if (res['body']['responseCode'] === 200) {
              this.dadosLogs = res['body']['result'];
              this.loadingLogs = true;
              this.noResultLogs = false;
            } else if (res['body']['responseCode'] === 404) {
              this.loadingLogs = true;
              this.noResultLogs = true;
              this.pnotifyService.notice('Não há dados');
            }
          }
        },
        error => {
          this.pnotifyService.error('Erro ao carregar dados');
          this.noResultLogs = true;
        }
      );
  }

  getPedidosIntegracaoItens(params) {
    this.loaderNavbar = true;
    this.loadingDetalhes = false;

    this.service
      .getPedidosIntegracaoItens(params)
      .pipe(finalize(() => (this.loaderNavbar = false)))
      .subscribe(
        (res: any) => {
          if (res.status === 200) {
            if (res['body']['responseCode'] === 200) {
              this.dadosDetalhes = res['body']['result'];
              this.loadingDetalhes = true;
              this.noResultDetalhes = false;
            } else if (res['body']['responseCode'] === 404) {
              this.loadingDetalhes = true;
              this.noResultDetalhes = true;
              this.pnotifyService.notice('Não há dados');
            }
          }
        },
        error => {
          this.pnotifyService.error('Erro ao carregar dados');
          this.noResultDetalhes = true;
          this.loadingDetalhes = true;
        }
      );
  }

  setDateValid(date) {
    if (date instanceof Date) {
      date = this.dateService.convertToUrlDate(date);
    }
    return date;
  }

  setFormDisable(selects) {
    selects.forEach(element => {
      return this.form.get(element).disable();
    });
  }

  setFormEnable(selects) {
    selects.forEach(element => {
      return this.form.get(element).enable();
    });
  }

  setFormReset(selects) {
    selects.forEach(element => {
      return this.form.get(element).reset();
    });
  }

  setIconeStatus(idStatus) {
    let icone: string;

    //Aguardando integração
    if (idStatus == 'AB3E3D41-9D81-4C68-8549-6A48E4AAC4D1') {
      icone = 'fas fa-hourglass-half';
    }
    //Pronto para integrar
    if (idStatus == '8955B81D-2B64-4839-B9F5-ACC768C9A499') {
      icone = 'far fa-paper-plane text-secondary';
    }
    //Aguardando processamento do unica
    if (idStatus == 'F8820F49-AD30-4571-A595-C7EE9AC42E5F') {
      icone = 'fas fa-exchange-alt text-info';
    }
    //Erro de processamento da unica
    if (idStatus == '8065F50C-8AF9-42E8-8AC1-8BAB9B455DB4') {
      icone = 'fas fa-window-close text-danger';
    }
    //Aguardando criação de ov
    if (idStatus == '8C812241-00BD-4809-9D0D-B13F08358796') {
      icone = 'fas fa-cogs text-purple';
    }
    //Erro de criação de ov
    if (idStatus == '69881918-9C82-4683-86B9-F822C132178F') {
      icone = 'fas fa-exclamation-triangle text-warning';
    }
    //Ov gerada com sucesso
    if (idStatus == '55DFED4D-172C-4D6C-BC5E-4BC1B007C30E') {
      icone = 'fas fa-check text-success';
    }

    return icone;
  }

  setVisibleEtapas(): void {
    this.visibleEtapas = !this.visibleEtapas;
  }

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
  /* Ordenação */
  sort(key) {
    this.key = key;
    this.reverse = !this.reverse;
  }
  /* Ordenação */

  /* Ordenaçao modal */
  sortA(keyA) {
    this.keyA = keyA;
    this.reverseA = !this.reverseA;
  }

  sortB(keyB) {
    this.keyB = keyB;
    this.reverseB = !this.reverseB;
  }


  /* Paginação Tabela Principal*/
  onPageChanged(event: PageChangedEvent): void {
    this.begin = (event.page - 1) * event.itemsPerPage;
    this.end = event.page * event.itemsPerPage;
  }
  /* Paginação */

  /* Paginação Modal*/
  onPageChangedA(event: PageChangedEvent): void {
    this.beginA = (event.page - 1) * event.itemsPerPage;
    this.endA = event.page * event.itemsPerPage;
  }

  onPageChangedB(event: PageChangedEvent): void {
    this.beginB = (event.page - 1) * event.itemsPerPage;
    this.endB = event.page * event.itemsPerPage;
  }

}
