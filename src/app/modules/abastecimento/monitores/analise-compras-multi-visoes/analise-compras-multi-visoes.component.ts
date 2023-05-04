import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap';

import { Subscription } from 'rxjs';

import { defineLocale } from 'ngx-bootstrap/chronos';
import { ptBrLocale } from 'ngx-bootstrap/locale';
defineLocale('pt-br', ptBrLocale);

import { finalize } from 'rxjs/operators';

import { DateService } from 'src/app/shared/services/core/date.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';

import { AbastecimentoMonitoresAnaliseComprasMultiVisoesService } from './analise-compras-multi-visoes.service';

@Component({
  selector: 'analise-compras-multi-visoes',
  templateUrl: './analise-compras-multi-visoes.component.html',
  styleUrls: ['./analise-compras-multi-visoes.component.scss']
})
export class AbastecimentoMonitoresAnaliseComprasMultiVisoesComponent implements OnInit {

  loaderFullScreen: boolean = true;
  loaderNavbar: boolean;
  loading: boolean = false;
  noResult: boolean = false;
  compareEndDate: boolean = false;
  compareStartDate: boolean = false;
  compareEndDateCurrent: boolean = false;
  showModalFavoritos: boolean = false;
  showModalAlterarAgrupamento: boolean = false;
  showModalVisaoMensal: boolean = false;

  bsConfig: Partial<BsDatepickerConfig>;

  form: FormGroup;

  showModal: boolean = false;
  itemModal: any = [];
  modal: any = [];

  breadCrumbTree: any = [];
  depositos: any = [];
  linhas: any = [];
  subLinhas: any = [];
  classes: any = [];
  data: any = [];

  depositosAssociados: any = [];
  tiposMateriais: any = [];
  tiposNiveisEstoques: any = [];
  materiais: any = [];
  arrayDepositos: any = [];

  idView: number;

  situations: any = [
    { id: 1, nome: 'Ativo' },
    { id: 0, nome: 'Inativo' }
  ];

  $activatedRouteSubscription: Subscription;

  /* Pagination */
  itemsPerPageParam = 15;
  totalItems = 10;
  currentPage = 1;
  numberOfItems = [15, 25, 50];
  /* Pagination */

  /* Ordenação */
  reverse: boolean = false;
  key: string = 'NM_MATE';
  /* Ordenação */

  periodosBusca: any = [
    // { id: 1, nome: 'Padrão' },
    { id: 2, nome: 'Customizado' }
  ];

  infoPrincipal: any = [
    { ID: 1, NM_INFO_PRIN: 'Material' },
    { ID: 2, NM_INFO_PRIN: 'Classe' },
    { ID: 3, NM_INFO_PRIN: 'Sublinha' },
    { ID: 4, NM_INFO_PRIN: 'Linha' },
    { ID: 5, NM_INFO_PRIN: 'Depósito' },
    { ID: 6, NM_INFO_PRIN: 'Empresa' },
    { ID: 7, NM_INFO_PRIN: 'Tipo Material' },

  ];

  agrupamento: any = [
    { ID: 1, NM_INFO_AGRU: 'Por depósito' },
    { ID: 2, NM_INFO_AGRU: 'Por empresa' },
    { ID: 3, NM_INFO_AGRU: 'Em todo Grupo' },

  ];

  volume: any = [
    { ID: 3, NM_INFO_VOLU: 'Estoque Disponível' },
    //{ ID: 1, NM_INFO_VOLU: 'Entradas' },
    { ID: 2, NM_INFO_VOLU: 'Saídas' },
    { ID: 4, NM_INFO_VOLU: 'Carteira' },
    { ID: 5, NM_INFO_VOLU: 'Perdas' },

  ];

  infoAdicionais: any = [
    { ID: 1, NM_INFO_ADIC: 'Atual' },
    { ID: 2, NM_INFO_ADIC: 'Supenso' },
    { ID: 3, NM_INFO_ADIC: 'Comprometido' }
  ];

  infoEstatistica: any = [
    { ID: 1, NM_INFO_ESTA: 'Giro' },
    { ID: 2, NM_INFO_ESTA: 'Ritmo' },
  ];

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
    private service: AbastecimentoMonitoresAnaliseComprasMultiVisoesService,
 ) {
    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );
    this.form = this.formBuilder.group({
      INFO_PRIN: [null, Validators.required],
      INFO_AGRU: [null, Validators.required],
      INFO_VOLU: [null, Validators.required],
      INFO_ADIC: [null],
      INFO_ESTA: [null],
      empresas: [null],
      depositos: [null],
      dataInicial: [null],
      dataFinal: [null],
      nivelEstoque: [null],
      tipoMaterial: [null],
      linha: [null, Validators.required],
      subLinha: [null],
      classe: [null],
      material: [null],
      paramData: [null, Validators.required],
      infAdicionais: [null],
      situacao: [null, Validators.required],
      qtItensPagina: [this.itemsPerPageParam],
      pagina: [this.currentPage],
      orderBy: [null],
      orderType: [null]
    });
  }

  ngOnInit(): void {
    this.setValueParamData();
    setTimeout(() => {
      this.loaderFullScreen = false;
    }, 1000);
    this.registrarAcesso();
    this.setBreadCrumb();
    this.titleService.setTitle('Análise de Compras Multíplas Visões');
    this.checkRouterParams();
    this.getTiposMateriais();
    this.getTiposNiveisEstoque();
    this.getLinhas();
  }

  setValueParamData() {
    this.form.get('paramData').setValue(2);
    this.form.get('situacao').setValue(1);
    this.enabledDate();
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
          descricao: 'Análise de Compras Multíplas Visões'
        }
      ];
    });
  }

  getLinhas(): void {
    this.loaderNavbar = true;
    this.linhas = [];

    let campos = ['classe', 'subLinha', 'material', 'empresas', 'depositos'];
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

  getSubLinhas(): void {
    this.loaderNavbar = true;
    let campos = ['subLinha', 'classe', 'material', 'empresas', 'depositos'];
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
    let idTipoMaterial = this.form.get('tipoMaterial').value;
    let idSituacao = this.form.get('situacao').value;
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

  getDepositosAssociados(): void {
    this.loaderNavbar = true;
    this.depositosAssociados = [];

    let campos = ['empresas', 'depositos'];
    this.setFormReset(campos);
    this.setFormDisable(campos);

    let idLinhas = this.form.get('linha').value;
    let idClasses = this.form.get('classe').value;
    let idTipoMaterial = this.form.get('tipoMaterial').value;
    let idSituacao = 1;
    if (
      (this.form.value['classe'] != null &&
        this.form.value['classe'].length > 0) ||
      (this.form.value['linha'] != null && this.form.value['linha'].length > 0)
    ) {
      this.service
        .getDepositosAssociados(idLinhas, idClasses, idTipoMaterial, idSituacao)
        .pipe(finalize(() => (this.loaderNavbar = false)))
        .subscribe(
          (res: any) => {
            if (Object.keys(res).length > 0) {
              if (res['body']['responseCode'] === 200) {
                this.depositosAssociados = res['body']['result'];
                this.setFormEnable(['empresas']);
              } else if (res['body']['responseCode'] === 404) {
                this.pnotifyService.notice('Não há empresa vinculada');
              }
            }
          },
          error => {
            this.pnotifyService.error('Erro ao carregar Empresas associadas');
          }
        );
    } else {
      this.loaderNavbar = false;
    }
  }

  getDepositos(param?: any): void {
    this.loaderNavbar = true;
    this.depositos = [];

    let campos = ['depositos'];
    this.setFormReset(campos);
    this.setFormDisable(campos);

    if (Object.keys(this.form.get('empresas').value).length > 0) {
      let idsEmpresa = this.form.get('empresas').value;
      let idSituacao = 1;

      this.service
        .getDepositos(idsEmpresa, idSituacao)
        .pipe(finalize(() => (this.loaderNavbar = false)))
        .subscribe(
          res => {
            if (Object.keys(res).length > 0) {
              if (res['body']['responseCode'] === 200) {
                this.depositos = res['body']['result'];
                this.getArrayDepositos(param);
                this.setFormEnable(campos);
              } else if (res['body']['responseCode'] === 404) {
                this.setFormDisable(campos);
              }
            }
          },
          error => {
            this.pnotifyService.error('Erro ao carregar Depositos');
          }
        );
    } else {
      this.loaderNavbar = false;
      this.setFormDisable(campos);
    }
  }

  /* Função para filtrar os depositos que possue vinculo com as classes */
  getArrayDepositos(event: any): void {
    let depositosFiltrados: Array<any> = [];

    this.depositos.forEach(deposito => {
      event.forEach(element => {
        element['DEPO'].forEach(d => {
          if (d['ID_DEPO'] == deposito['ID']) depositosFiltrados.push(deposito);
        });
      });
    });

    this.depositos = depositosFiltrados;
  }
  /* Função para filtrar os depositos que possue vinculo com as classes */

  getTiposNiveisEstoque(): void {
    let idSituacao = 1;

    this.loaderNavbar = true;
    this.tiposNiveisEstoques = [];
    this.service
      .getTiposNiveisEstoque(idSituacao)
      .pipe(finalize(() => (this.loaderNavbar = false)))
      .subscribe(
        res => {
          if (Object.keys(res).length > 0) {
            if (res.status === 200) {
              this.tiposNiveisEstoques = res['body']['result'];
            }
          }
        },
        error => {
          this.pnotifyService.error('Erro ao carregar Tipos de Niveis de Estoque');
        }
      );
  }

  getTiposMateriais(): void {
    let idSituacao = 1;

    this.loaderNavbar = true;
    this.tiposMateriais = [];
    this.service
      .getTiposMateriais(idSituacao)
      .pipe(finalize(() => (this.loaderNavbar = false)))
      .subscribe(
        res => {
          if (Object.keys(res).length > 0) {
            if (res.status === 200) {
              this.tiposMateriais = res['body']['result'];
            }
          }
        },
        error => {
          this.pnotifyService.error('Erro ao carregar Tipos de Materiais');
        }
      );
  }

  checkRouterParams(): void {
    this.$activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (queryParams: any) => {
        if (Object.keys(queryParams).length > 0) {
          let _response = this.routerService.getBase64UrlParams(queryParams);
          //busca de dados
          this.setFormValues(_response);
        }
      }
    );
    this.$activatedRouteSubscription.unsubscribe();
  }

  addItem(newItem: any): void {
    this.itemModal = newItem;
  }

  setFormValues(queryParams?: any): void {
    let empresas = queryParams['empresas'] ? queryParams['empresas'] : null;
    let depositos = queryParams['depositos'] ? queryParams['depositos'] : null;
    let nivelEstoque = queryParams['nivelEstoque']
      ? queryParams['nivelEstoque']
      : null;
    let tipoMaterial = queryParams['tipoMaterial']
      ? queryParams['tipoMaterial']
      : null;
    let situacao = queryParams['situacao'];
    let linha = queryParams['linha'] ? queryParams['linha'] : null;
    let subLinha = queryParams['subLinha'] ? queryParams['subLinha'] : null;
    let classe = queryParams['classe'] ? queryParams['classe'] : [];
    let material = queryParams['material'] ? queryParams['material'] : null;
    let paramData = queryParams['paramData'] ? queryParams['paramData'] : null;
    let dataInicial = queryParams['dataInicial']
      ? queryParams['dataInicial']
      : null;
    let dataFinal = queryParams['dataFinal'] ? queryParams['dataFinal'] : null;
    let tipoVisualizacao = queryParams['tipoVisualizacao']
      ? queryParams['tipoVisualizacao']
      : null;
    let infAdicionais = queryParams['infAdicionais']
      ? queryParams['infAdicionais']
      : null;
    //let pagina = queryParams['pagina'];
    let orderBy = queryParams['orderBy'];
    let orderType = queryParams['orderType'];

    this.idView = queryParams['INFO_PRIN'];

    if (paramData == 2) {
      this.setFormEnable(['dataInicial', 'dataFinal']);
    }

    this.currentPage = queryParams['pagina'];

    this.itemsPerPageParam = queryParams['qtItensPagina'];

    this.key = orderBy;

    if (orderType === "ASC") {
      this.reverse = false;
    } else if (orderType === "DESC") {
      this.reverse = true;
    }

    // console.log(this.setDateValid(dataInicial));

    // let dataInicial = this.setDateValid(this.form.value['dataInicial']);
    // let dataFinal = this.setDateValid(this.form.value['dataFinal']);

    //consulta para recarregamento dos dados no form
    this.getDadosForm({ empresas, linha, classe, tipoMaterial, situacao });

    // this.form.patchValue({
    //   empresas: empresas,
    //   depositos: depositos,
    //   nivelEstoque: nivelEstoque,
    //   tipoMaterial: tipoMaterial,
    //   situacao: situacao,
    //   linha: linha,
    //   subLinha: subLinha,
    //   classe: classe,
    //   material: material,
    //   paramData: paramData,
    //   dataInicial: dataInicial,
    //   dataFinal: dataFinal,
    //   tipoVisualizacao: tipoVisualizacao,
    //   infAdicionais: infAdicionais,
    //   qtItensPagina: this.itemsPerPageParam,
    //   pagina: this.currentPage,
    //   orderBy: orderBy,
    //   orderType: orderType
    // });

    this.form.patchValue(queryParams);

  }

  /* Consulta para recarregamento de dados nos selects dos form */
  getDadosForm(params: any): void {
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
          params['tipoMaterial'],
          params['situacao']
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

    /* Alimenta o select de empresas */
    if (Object.keys(params['linha']).length > 0) {
      let campos = ['empresas'];
      this.service
        .getDepositosAssociados(
          params['linha'],
          params['classe'],
          params['tipoMaterial'],
          1
        )
        .pipe(finalize(() => (this.loaderNavbar = false)))
        .subscribe(
          (res: any) => {
            if (Object.keys(res).length > 0) {
              if (res.status === 200) {
                this.depositosAssociados = res['body']['result'];
                this.setFormEnable(campos);
              }
            }
          },
          error => {
            this.pnotifyService.error('Erro ao carregar Depositos associados');
          }
        );
    }

    /* Alimenta select depositos */
    if (params['empresas'] !== null) {
      let campos = ['depositos'];

      this.service
        .getDepositos(params['empresas'], 1)
        .pipe(finalize(() => (this.loaderNavbar = false)))
        .subscribe(
          (res: any) => {
            if (Object.keys(res).length > 0) {
              if (res.status === 200) {
                this.depositos = res['body']['result'];
                this.setFormEnable(campos);
              }
            }
          },
          error => {
            this.pnotifyService.error('Erro ao carregar Depositos');
          }
        );
    } else {
      this.setFormEnable(['depositos']);
    }
  }

  getParams(): any {
    let _params = {};
    let _obj = this.form.value;

    for (let prop in _obj) {
      if (_obj[prop]) {
        if (_obj[prop] instanceof Date) {
          _obj[prop] = this.dateService.convertToUrlDate(_obj[prop]);
        }
        _params[prop] = _obj[prop];
      }
    }

    return _params;
  }

  /* Resetas as colunas que serão exibidas */

  resetForm(): void {
    let camposReset = [
      'linha',
      'subLinha',
      'classe',
      'material',
      'empresas',
      'depositos'
    ];
    let camposDisable = [
      'subLinha',
      'classe',
      'material',
      'empresas',
      'depositos'
    ];
    this.setFormReset(camposReset);
    this.setFormDisable(camposDisable);
  }

  onFilter(page: any): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams())
    });
    //this.search(this.getParams());
    this.idView = this.getParams()['INFO_PRIN'];
  }

  excelExport(): void {
    this.pnotifyService.success("Exportado com sucesso");
  }

  setFormDisable(selects: any): any {
    selects.forEach(element => {
      return this.form.get(element).disable();
    });
  }

  setFormEnable(selects: any): any {
    selects.forEach(element => {
      return this.form.get(element).enable();
    });
  }

  setFormReset(selects: any): any {
    selects.forEach(element => {
      return this.form.get(element).reset();
    });
  }

  // setDateValid(date) {
  //   if (date instanceof Date) {
  //     date = this.dateService.convertToUrlDate(date);
  //   }
  //   return date;
  // }

  enabledDate(): void {
    let campoData = ['dataInicial', 'dataFinal'];
    let today = new Date;
    this.setFormReset(campoData);
    this.setFormEnable(campoData);
    this.form.get('dataInicial').setValue(this.getLastThreeMonthsDay());
    this.form.get('dataFinal').setValue(today);
  }

  activeInputDate(): void {
    if (this.form.value['paramData'] == 2) {
      this.enabledDate();
    } else if (this.form.value['paramData'] == 1) {
      this.disabledDate();
    }
  }

  disabledDate(): void {
    let campoData = ['dataInicial', 'dataFinal'];
    this.setFormReset(campoData);
    this.setFormDisable(campoData);
  }

  compareEndDateFunc(): boolean {
    let now = new Date();
    if (!this.form.get('dataFinal').value) {
      this.compareEndDateCurrent = false;
      return false;
    } else if (this.form.get('dataFinal').value > now) {
      this.compareEndDateCurrent = true;
      return this.compareEndDateCurrent;
    }
  }

  compareStartDateFunc(): boolean {
    let now = new Date();
    if (!this.form.get('dataInicial').value) {
      this.compareStartDate = false;
      return false;
    } else if (this.form.get('dataInicial').value > now) {
      this.compareStartDate = true;
      return this.compareStartDate;
    }
  }

  compareDate(): boolean {
    let stra = this.form.get('dataInicial').value;
    let strb = this.form.get('dataFinal').value;
    let dataInicial = {};
    let dataFinal = {};

    if (stra instanceof Date) {
      dataInicial = stra;
    } else if (stra !== null) {
      dataInicial = new Date(stra.split('-').reverse().join('-'));
    }

    if (strb instanceof Date) {
      dataFinal = strb;
    } else if (strb !== null) {
      dataFinal = new Date(strb.split('-').reverse().join('-'));;
    }

    if (!dataInicial) {
      this.compareEndDate = false;
      return false;
    } else if (dataInicial > dataFinal) {
      this.compareEndDate = true;
      return this.compareEndDate;
    }
  }

  getLastThreeMonthsDay(): any {
    let date = new Date();
    date.setMonth(date.getMonth() - 3);
    return date;
  }

  setValuesFavorite(): void {
    this.modal.title = "Favoritos";
    this.showModalFavoritos = true;
    console.log(this.form.value);
  }

  setValuesAlterarAgrupamento(): void {
    this.showModalAlterarAgrupamento = true;
    this.modal.title="Alterar Agrupamento";
  }

  setValuesVisaoMensal(): void {
    this.showModalVisaoMensal = true;
    this.modal.title="Visão Mensal";
  }

  onCloseModal(): void {
    this.showModalFavoritos = false;
    this.showModalAlterarAgrupamento = false;
    this.showModalVisaoMensal = false;
  }

  onFieldError(field: string): string {
    if (this.onFieldInvalid(field)) {
      return 'is-invalid';
    }
    return '';
  }

  onFieldInvalid(field: any): any {
    field = this.form.get(field);
    return field.status == 'INVALID' && field.touched;
  }

  onFieldRequired(field: string): string {
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
