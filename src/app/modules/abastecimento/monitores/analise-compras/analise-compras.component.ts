import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { DateService } from 'src/app/shared/services/core/date.service';
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';

//Converte rota em base64
import { RouterService } from 'src/app/shared/services/core/router.service';

import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { PageChangedEvent } from 'ngx-bootstrap/pagination/ngx-bootstrap-pagination';

import { defineLocale } from 'ngx-bootstrap/chronos';
import { ptBrLocale } from 'ngx-bootstrap/locale';
defineLocale('pt-br', ptBrLocale);

import { AbastecimentoMonitoresAnaliseComprasService } from './analise-compras.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'analise-compras',
  templateUrl: './analise-compras.component.html',
  styleUrls: ['./analise-compras.component.scss']
})
export class AbastecimentoMonitoresAnaliseComprasComponent implements OnInit {

  loaderFullScreen: boolean = true;
  loaderNavbar: boolean;
  loading: boolean = false;
  loadingDetalhesModal: boolean = false;
  noResult: boolean = false;
  ativarCampoData: boolean = false;
  compararDataFinal: boolean = false;
  compararDataInicial: boolean = false;
  compararDataFinalAtual: boolean = false;

  /* Exibir Colunas */
  depositoBool: boolean = false;
  linhaBool: boolean = false;
  subLinhaBool: boolean = false;
  classeBool: boolean = false;
  uniMedidaBool: boolean = false;
  bitolaBool: boolean = false;
  larguraBool: boolean = false;
  comprimentoBool: boolean = false;
  qualidadeBool: boolean = false;
  revestimentoBool: boolean = false;
  tipoAcoBool: boolean = false;
  estAtualBool: boolean = false;
  estComprBool: boolean = false;
  estSuspBool: boolean = false;
  colsCarteira: boolean = false;
  colsVendasReal: boolean = false;
  colsVendasPerd: boolean = false;
  colsEstoque: boolean = false;
  /* Exibir Colunas */

  /* Modais */
  nivelEstBool: boolean = false;
  carteiraBool: boolean = false;
  vendasRealBool: boolean = false;
  vendasPerdBool: boolean = false;
  estoqueCompBool: boolean = false;
  estoqueSuspBool: boolean = false;
  loadingDetalhesNivelEstoque: boolean = false;
  /* Modais */

  bsConfig: Partial<BsDatepickerConfig>;

  form: FormGroup;

  breadCrumbTree: any = [];
  depositos: any = [];
  linhas: any = [];
  subLinhas: any = [];
  classes: any = [];
  dados: any = [];
  dadosFull: any = [];
  dadosTotalizadores: any = [];
  dadosExcel: any = [];
  dadosCarteiraDetalhe: any = [];
  dadosVendasRealDetalhe: any = [];
  dadosDetalhesNivelEstoqueModal: any = [];
  dadosVendasPerdDetalhe: any = [];
  colsInfAdicionais: any = [];
  depositosAssociados: any = [];
  tiposMateriais: any = [];
  tiposNiveisEstoques: any = [];
  materiais: any = [];

  itemEstoqueSupenso: any = []; 
  itemEstoqueComprometido: any = []; 
  itemVendasPerdidas: any = []; 
  itemVendasRealizadas: any = []; 
  itemCarteira: any = []; 
  itemNivelEstoque: any = []; 

  idMesAnoVendasPerdidas: string;
  idMesAnoVendasRealizadas: string;
  idMesAnoCarteira: string;

  colsMat: number = 0;
  colsEst: number = 1;
  colsCar: number = 1;
  colsVenRea: number = 2;
  colsVenPed: number = 2;

  /* Ordenação */
  reverse: boolean = false;
  key: string = 'NM_MATE';
  /* Ordenação */

  /* Pagination */
  itemsPerPageParam = 15;
  totalItems = 10;
  currentPage = 1;
  numberOfItems = [15, 25, 50];
  /* Pagination */

  arrayDepositos: any = [];

  periodosBusca: any = [
    // { id: 1, nome: 'Padrão' },
    { id: 2, nome: 'Customizado' }
  ];

  situacoes: any = [
    { id: 1, nome: 'Ativo' },
    { id: 0, nome: 'Inativo' }
  ];

  infAdicionaisDados: any = [];

  tiposVisualizacao: any = [
    { id: 'S', nome: 'Sintética por material' },
    { id: 'A', nome: 'Analítica por depósito' }
  ];

  modal: any = [];

  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true
  };

  subtitles: Array<Subtitles> = [
    {
      text: 'Acima do máximo',
      color: 'blue'
    },
    {
      text: 'Máximo',
      color: 'green'
    },
    {
      text: 'Médio',
      color: 'yellow'
    },
    {
      text: 'Mínimo',
      color: 'red'
    },
    {
      text: 'Sem cadastro',
      color: 'gray'
    }
  ];

  $activatedRouteSubscription: Subscription;

  /* dados do usuário */
  currentUser: any = JSON.parse(localStorage.getItem('currentUser'));
  idUsuario: any = this.currentUser['info']['id'];
  /* dados do usuário */

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
    private service: AbastecimentoMonitoresAnaliseComprasService
  ) {
    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );
    this.form = this.formBuilder.group({
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
      tipoVisualizacao: [null, Validators.required],
      infAdicionais: [null],
      situacao: [null, Validators.required],
      qtItensPagina: [this.itemsPerPageParam],
      pagina: [this.currentPage],
      orderBy: [null],
      orderType: [null]
    });
  }

  ngOnInit() {
    this.setValueParamData();
    setTimeout(() => {
      this.loaderFullScreen = false;
    }, 1000);
    this.registrarAcesso();
    this.setBreadCrumb();
    this.titleService.setTitle('Análise de Compras');
    this.checkRouterParams();
    this.getTiposMateriais();
    this.getTiposNiveisEstoque();
    this.getInfAdicionais();
    this.getLinhas();
  }

  setValueParamData(){
    this.form.get('paramData').setValue(2);
    this.form.get('situacao').setValue(1);
    this.form.get('tipoVisualizacao').setValue("S");
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
          descricao: 'Análise de Compras'
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
        .getSubLinhas(descricaoLinhas,idSituacao)
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
        .getDepositosAssociados(idLinhas,idClasses, idTipoMaterial, idSituacao)
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

  getDepositos(param?): void {
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
  getArrayDepositos(event) {
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

  getInfAdicionais(): void {
    this.loaderNavbar = true;
    this.service
      .getInfAdicionais()
      .pipe(finalize(() => (this.loaderNavbar = false)))
      .subscribe(
        (res: any) => {
          if (Object.keys(res).length > 0) {
            if (res.status === 200) {
              this.infAdicionaisDados = res['body']['result'];
            }
          }
        },
        error => {
          this.pnotifyService.error('Erro ao carregar Informações adicionais');
        }
      );
  }

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

  getAnaliseCompras(params) {
    this.loaderNavbar = true;
    this.loading = false;
    this.dados = [];
    this.dadosTotalizadores = [];
    this.colsInfAdicionais = [];

    /* função para resetar colunas adicionais */
    this.resetColsInfAdicionais();

    this.service
      .getAnaliseCompras(params)
      .pipe(finalize(() => (this.loaderNavbar = false)))
      .subscribe(
        (res: any) => {
          if (Object.keys(res).length > 0) {
            if (res['body']['responseCode'] === 200) {
              /* função para habilitar as colunas adicionais */
              this.colsInfAdicionais = Object.keys(res['body']['result'][0]);
              this.setColsInfAdicionaisTrue();
              /* função para habilitar as colunas adicionais */
              this.setColsMesAno();
              this.totalItems = res['body']['result'][1]['TT_REGI'];
              this.dadosFull = res['body']['result'];
              this.dadosTotalizadores = this.dadosFull.shift();
              this.dados = this.dadosFull;

              this.noResult = false;
              this.loading = true;

            } else if (
              res['body']['responseCode'] === 204 ||
              res['body']['responseCode'] === 404
            ) {
              this.noResult = true;
              this.loading = false;
              this.pnotifyService.notice('Nenhuma informação encontrada');
            }
          }
        },
        error => {
          this.noResult = true;
          this.loading = false;
          this.pnotifyService.error('Erro ao carregar dados');
        }
      );
  }

  getAnaliseComprasExcel(params) {
    this.loaderNavbar = true;
    this.dadosExcel = [];

    this.service
      .getAnaliseCompras(params)
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

  setColsMesAno() {
    this.colsCar = 1;
    this.colsVenRea = 2;
    this.colsVenPed = 2;
    this.dadosCarteiraDetalhe = [];
    this.dadosVendasRealDetalhe = [];
    this.dadosVendasPerdDetalhe = [];
    let colunasCarteira = this.colsInfAdicionais;

    colunasCarteira.forEach(e => {
      if (e.match(/^CART_ABER_/)) {
        this.colsCar = this.colsCar + 1;
        this.dadosCarteiraDetalhe.push({
          id: e.substring(10),
          row: e,
          header: e.substring(10).replace(/_/g, '/')
        });
      };

      if (e.match(/^VEND_REAL_/)) {
        this.colsVenRea = this.colsVenRea + 1;
        this.dadosVendasRealDetalhe.push({
          id: e.substring(10),
          row: e,
          header: e.substring(10).replace(/_/g, '/')
        });
      };

      if (e.match(/^VEND_PERD_/)) {
        this.colsVenPed = this.colsVenPed + 1;
        this.dadosVendasPerdDetalhe.push({
          id: e.substring(10),
          row: e,
          header: e.substring(10).replace(/_/g, '/')
        });
      };
    });
  }

  setColsCarteiraTrue(){
    this.colsCarteira = !this.colsCarteira;
  }

  setColsVendasRealTrue() {
    this.colsVendasReal = !this.colsVendasReal;
  }

  setColsVendasPerdTrue() {
    this.colsVendasPerd = !this.colsVendasPerd;
  }

  setColsEstoqueTrue() {
    this.colsEstoque = !this.colsEstoque;
  }

  /* Seta como true as colunas que serão exibidas na tabela */
  setColsInfAdicionaisTrue() {
    this.colsMat = 0;
    this.colsEst = 1;
    this.colsInfAdicionais.forEach(element => {
      if (element == 'NM_DEPO') {
        this.depositoBool = true;
      }
      if (element == 'NM_LINH') {
        this.linhaBool = true;
        this.colsMat = this.colsMat + 1;
      }
      if (element == 'NM_SUB_LINH') {
        this.subLinhaBool = true;
        this.colsMat = this.colsMat + 1;
      }
      if (element == 'NM_CLAS') {
        this.classeBool = true;
        this.colsMat = this.colsMat + 1;
      }
      if (element == 'NM_APOI_UNID_MEDI') {
        this.uniMedidaBool = true;
        this.colsMat = this.colsMat + 1;
      }
      if (element == 'VL_MEDI') {
        this.bitolaBool = true;
        this.colsMat = this.colsMat + 1;
      }
      if (element == 'VL_LARG') {
        this.larguraBool = true;
        this.colsMat = this.colsMat + 1;
      }
      if (element == 'VL_COMP') {
        this.comprimentoBool = true;
        this.colsMat = this.colsMat + 1;
      }
      if (element == 'DS_QUAL') {
        this.qualidadeBool = true;
        this.colsMat = this.colsMat + 1;
      }
      if (element == 'DS_REVE') {
        this.revestimentoBool = true;
        this.colsMat = this.colsMat + 1;
      }
      if (element == 'DS_TIPO_ACO') {
        this.tipoAcoBool = true;
        this.colsMat = this.colsMat + 1;
      }
      if (element == 'TT_ESTO_ATUA') {
        this.estAtualBool = true;
        this.colsEst = this.colsEst + 1;
      }
      if (element == 'TT_ESTO_COMP') {
        this.estComprBool = true;
        this.colsEst = this.colsEst + 1;
      }
      if (element == 'TT_ESTO_SUSP') {
        this.estSuspBool = true;
        this.colsEst = this.colsEst + 1;
      }
    });
  }
  /* Seta como true as colunas que serão exibidas na tabela */

  /* Resetas as colunas que serão exibidas */
  resetColsInfAdicionais() {
    this.depositoBool = false;
    this.linhaBool = false;
    this.subLinhaBool = false;
    this.classeBool = false;
    this.uniMedidaBool = false;
    this.bitolaBool = false;
    this.larguraBool = false;
    this.comprimentoBool = false;
    this.qualidadeBool = false;
    this.revestimentoBool = false;
    this.tipoAcoBool = false;
    this.estAtualBool = false;
    this.estComprBool = false;
    this.estSuspBool = false;
  }
  /* Resetas as colunas que serão exibidas */

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

  checkRouterParams(): void {
    this.$activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (queryParams: any) => {
        if (Object.keys(queryParams).length > 0) {
          let _response = this.routerService.getBase64UrlParams(queryParams);
          //busca de dados
          this.getAnaliseCompras(_response);
          this.setFormValues(_response);
        }
      }
    );
    this.$activatedRouteSubscription.unsubscribe();
  }

  setFormValues(queryParams) {
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

    
    if(paramData == 2){
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

    //consulta para recarregamento dos dados no form
    this.getDadosForm({ empresas, linha, classe, tipoMaterial, situacao });

    this.form.patchValue({
      empresas: empresas,
      depositos: depositos,
      nivelEstoque: nivelEstoque,
      tipoMaterial: tipoMaterial,
      situacao: situacao,
      linha: linha,
      subLinha: subLinha,
      classe: classe,
      material: material,
      paramData: paramData,
      dataInicial: dataInicial,
      dataFinal: dataFinal,
      tipoVisualizacao: tipoVisualizacao,
      infAdicionais: infAdicionais,
      qtItensPagina: this.itemsPerPageParam,
      pagina: this.currentPage,
      orderBy: orderBy,
      orderType: orderType
    });

  }

  /* Consulta para recarregamento de dados nos selects dos form */
  getDadosForm(params) {
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

  resetForm() {
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

  onFilter(pagina) {
    let dataInicial = this.setDateValid(this.form.value['dataInicial']);
    let dataFinal = this.setDateValid(this.form.value['dataFinal']);

    this.itemsPerPageParam = this.form.value['qtItensPagina'];
    this.key = this.form.value['orderBy'];

    this.setRouterParams({
      empresas: this.form.value['empresas'],
      depositos: this.form.value['depositos'],
      nivelEstoque: this.form.value['nivelEstoque'],
      tipoMaterial: this.form.value['tipoMaterial'],
      situacao: this.form.value['situacao'],
      linha: this.form.value['linha'],
      subLinha: this.form.value['subLinha'],
      classe: this.form.value['classe'],
      material: this.form.value['material'],
      paramData: this.form.value['paramData'],
      dataInicial: dataInicial,
      dataFinal: dataFinal,
      tipoVisualizacao: this.form.value['tipoVisualizacao'],
      infAdicionais: this.form.value['infAdicionais'],
      qtItensPagina: this.form.value['qtItensPagina'],
      pagina: pagina,
      orderBy: this.form.value['orderBy'],
      orderType: this.form.value['orderType']
    });
  }

  setRouterParams(params) {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(params)
    });
    this.getAnaliseCompras(params);
  }

  /* Modals */

  getNivelEstoqueModal(item) {
    this.itemNivelEstoque = item;
    this.modal.title="NÍVEL DE ESTOQUE";

    this.loadingDetalhesModal = true;
    this.nivelEstBool = true;
  }

  getCarteiraModal(item, idMesAno) {
    this.itemCarteira = item;
    this.idMesAnoCarteira = idMesAno;
    this.modal.title = "CARTEIRA";

    this.carteiraBool = true;
    this.loadingDetalhesModal = true;
  }

  getVendasRealModal(item, idMesAno) {
    this.itemVendasRealizadas = item;
    this.idMesAnoVendasRealizadas = idMesAno;
    this.modal.title="VENDAS REALIZADAS";

    this.loadingDetalhesModal = true;
    this.vendasRealBool = true;
  }

  
  getVendasPerdModal(item, idMesAno) {
    this.vendasPerdBool = true;
    this.loadingDetalhesModal = true;

    this.modal.title="VENDAS PERDIDAS";
    this.itemVendasPerdidas = item;
    this.idMesAnoVendasPerdidas = idMesAno;
  }

  getEstoqueSupensoModal(item) {
    this.loadingDetalhesModal = true;
    this.estoqueSuspBool = true;

    this.modal.title="ESTOQUE SUSPENSO";
    this.itemEstoqueSupenso = item;
  }
  
  getEstoqueComprometidoModal(item) {
    this.loadingDetalhesModal = true;
    this.estoqueCompBool = true;

    this.modal.title="ESTOQUE COMPROMETIDO";
    this.itemEstoqueComprometido = item;
  }

  closeModal(){
    this.vendasPerdBool = false;
    this.vendasRealBool = false;
    this.carteiraBool = false;
    this.nivelEstBool = false;
    this.estoqueSuspBool = false;
    this.estoqueCompBool = false;
  }

  /* Modals */

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

  activeInputDate() {
    if (this.form.value['paramData'] == 2) {
      this.enabledDate();
    } else if (this.form.value['paramData'] == 1) {
      this.disabledDate();
    }
  }

  disabledDate() {
    let campoData = ['dataInicial', 'dataFinal'];
    this.setFormReset(campoData);
    this.setFormDisable(campoData);
  }

  enabledDate() {
    let campoData = ['dataInicial', 'dataFinal'];
    let today = new Date;
    this.setFormReset(campoData);
    this.setFormEnable(campoData);
    this.form.get('dataInicial').setValue(this.getLastThreeMonthsDay());
    this.form.get('dataFinal').setValue(today);
  }

  getLastThreeMonthsDay(){
    let date = new Date();
    date.setMonth(date.getMonth() - 3);
    return date;
  }

  setDateValid(date) {
    if (date instanceof Date) {
      date = this.dateService.convertToUrlDate(date);
    }
    return date;
  }

  comparaData() {
    let stra = this.form.get('dataInicial').value;
    let strb = this.form.get('dataFinal').value;
    let dataInicial = {};
    let dataFinal = {};

    if (stra instanceof Date) {
      dataInicial = stra;
    } else if(stra !== null) {
      dataInicial = new Date(stra.split('-').reverse().join('-'));
    }

    if (strb instanceof Date) {
      dataFinal = strb;
    } else if(strb !== null) {
      dataFinal = new Date(strb.split('-').reverse().join('-'));;
    }

    if (!dataInicial) {
      this.compararDataFinal = false;
      return false;
    } else if (dataInicial > dataFinal) {
      this.compararDataFinal = true;
      return this.compararDataFinal;
    }
  }

  comparaDataFinal() {
    let now = new Date();
    if (!this.form.get('dataFinal').value) {
      this.compararDataFinalAtual = false;
      return false;
    } else if (this.form.get('dataFinal').value > now) {
      this.compararDataFinalAtual = true;
      return this.compararDataFinalAtual;
    }
  }

  comparaDataInicial() {
    let now = new Date();
    if (!this.form.get('dataInicial').value) {
      this.compararDataInicial = false;
      return false;
    } else if (this.form.get('dataInicial').value > now) {
      this.compararDataInicial = true;
      return this.compararDataInicial;
    }
  }

  excelExport() {
    let dataInicial = this.setDateValid(this.form.value['dataInicial']);
    let dataFinal = this.setDateValid(this.form.value['dataFinal']);

    let queryParams = {
      empresas: this.form.value['empresas'],
      depositos: this.form.value['depositos'],
      nivelEstoque: this.form.value['nivelEstoque'],
      tipoMaterial: this.form.value['tipoMaterial'],
      situacao: this.form.value['situacao'],
      linha: this.form.value['linha'],
      subLinha: this.form.value['subLinha'],
      classe: this.form.value['classe'],
      material: this.form.value['material'],
      paramData: this.form.value['paramData'],
      dataInicial: dataInicial,
      dataFinal: dataFinal,
      tipoVisualizacao: this.form.value['tipoVisualizacao'],
      infAdicionais: this.form.value['infAdicionais'],
      qtItensPagina: "",
      pagina: "",
      idUsuario: this.idUsuario,
      relatorioExcel: 1
    }
    
    this.getAnaliseComprasExcel(queryParams);
  }

  setColorBorder(i) {
    let border:string;
    
    if( i == 'RED') {
      border = 'border-danger';
    }
    if( i == 'YELLOW') {
      border = 'border-warning';
    }
    if( i == 'GREEN') {
      border = 'border-success';
    }
    if( i == 'BLUE') {
      border = 'border-primary';
    }
    if( i == 'GREY') {
      border = 'border-secondary';
    }

    return border;
  }

  /* Ordenação via API*/
  sort(key) {
  
    if(this.key != key) {
      this.reverse = true;
    } else if( this.key == key ) {
      this.reverse = !this.reverse;
    }

    this.key = key;
    
    if (this.reverse == false) {
      this.form.get('orderType').setValue("ASC");
    } else if (this.reverse == true) {
      this.form.get('orderType').setValue("DESC");
    }

    this.form.get('orderBy').setValue(this.key);
    this.onFilter(this.currentPage);
  }
  /* Ordenação via API*/

  /* Paginação Tabela Principal*/
  onPageChanged(event: PageChangedEvent): void {
    if (this.currentPage != event.page ) {
      this.currentPage = event.page;
      this.onFilter(this.currentPage);
    }
  }
  /* Paginação */
}