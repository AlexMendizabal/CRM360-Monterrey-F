import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
  FormArray,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Location } from '@angular/common';

// ngx-bootstrap
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ptBrLocale } from 'ngx-bootstrap/locale';

defineLocale('pt-br', ptBrLocale);

// Services
import { AtividadesService } from './../../../../../../shared/services/requests/atividades.service';
import { ConfirmModalService } from './../../../../../../shared/modules/confirm-modal/confirm-modal.service';
import { PNotifyService } from './../../../../../../shared/services/core/pnotify.service';
import { DetailPanelService } from './../../../../../../shared/templates/detail-panel/detal-panel.service';
import { DateService } from './../../../../../../shared/services/core/date.service';
import { AuthService } from './../../../../../../shared/services/core/auth.service';
import { ComercialGestaoAssociacoesCoordenadoresEscritoriosService } from './../../../../gestao/associacoes/coordenadores-escritorios/coordenadores-escritorios.service';
import { ComercialComissoesGestaoComissionamentosService } from './../gestao-comissionamentos.service';

// Interfaces
import { Breadcrumb } from './../../../../../../shared/modules/breadcrumb/breadcrumb';
import { JsonResponse } from './../../../../../../models/json-response';
import { CustomTableConfig } from './../../../../../../shared/templates/custom-table/models/config';

@Component({
  selector: 'comercial-representantes-programacao-pagamentos-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss'],
})
export class ComercialComissoesGestaoComissionamentosFormularioComponent
  implements OnInit
{
  @ViewChild('scrollToFilter', {}) scrollToFilter: ElementRef;

  private user = this.authService.getCurrentUser();

  loaderNavbar = false;
  loaderFullScreen = true;

  tableConfig: Partial<CustomTableConfig> = {
    border: false,
    hover: true,
  };

  breadCrumbTree: Array<Breadcrumb>;

  form: FormGroup;
  formValores: FormGroup;
  formReprovar: FormGroup;
  formInputs: FormGroup;

  formData: Array<FormData> = [];

  dados: any[] = [];
  dadosComissao: any[] = [];
  dadosDetalhes: any[] = [];
  dadosDetalhesUnidades: any[] = [];
  dadosHistorico: any[] = [];
  dadosData: any[] = [];
  representantes: any[] = [];
  escritorios: any[] = [];
  situacao: any[] = [];
  profile: any = {};
  arrayAnexos: any[] = [];
  valorParcial: any[] = [];
  valorParcialDescontos: any[] = [];
  valorParcialAjuda: any[] = [];
  filteredRepresentantes: any[] = [];
  dadosIndex: any[] = [];

  appTitle: string;
  action: string;
  dataInicial: string;
  dataFinal: string;
  mesRef: string;
  codGestao: string;
  nomeAnexo: string = 'vazio';

  valorTotal: number;
  valorTotalDescontos: number;
  valorTotalAjuda: number;
  indexAnexos: number;
  codComissaoRepresentante: number;
  status: number;
  notasEnviadas: number;

  valorBaseDBA: number = 0;
  percentualDBA: number = 0;
  valorBaseACO: number = 0;
  percentualACO: number = 0;

  initialValue = true;
  showPermissionDenied = false;
  saved: boolean = false;
  salvar = false;
  visualizar: boolean = false;
  anexar: boolean = true;
  notasEscritorio: boolean = true;
  notasRepresentante: boolean = true;
  enviarDiretor: boolean = false;
  showAnexos: boolean = false;
  submittingForm: boolean = false;
  edit: boolean = true;
  dadosLoaded: boolean = false;
  dadosEmpty: boolean = false;
  dadosEmptyUnidades: boolean = false;
  dadosEmptyHistorico: boolean = false;
  readonly: boolean = true;

  modalRef: BsModalRef;
  modalRefDetails: BsModalRef;

  activatedRouteSubscription: Subscription;

  maxSize = 10;
  itemsPerPage = 300;
  currentPage = 1;
  totalItems = 0;

  data: Array<any> = [];
  subscription: Subscription;

  meses = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  constructor(
    private formBuilder: FormBuilder,
    private activateRoute: ActivatedRoute,
    private localeService: BsLocaleService,
    private dateService: DateService,
    private router: Router,
    private detailPanelService: DetailPanelService,
    private pnotifyService: PNotifyService,
    private gestaoComissionamentosService: ComercialComissoesGestaoComissionamentosService,
    private atividadesService: AtividadesService,
    private bsModalService: BsModalService,
    private confirmModalService: ConfirmModalService,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private gestaoAssociacoesService: ComercialGestaoAssociacoesCoordenadoresEscritoriosService
  ) {
    this.localeService.use('pt-br');
  }

  ngOnInit(): void {
    this.setFormFilter();
    this.setBreadCrumb();
    this.setFormValores();
    this.setFormInputs();
    this.setFormReprovar();
    this.registrarAcesso();
    this.getPerfil();
    this.getCreate();
    this.getStatus();
    this.getEscritorios();
  }

  setBreadCrumb(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.id) {
        this.appTitle = 'Editar Comissionamento';
        this.action = 'update';
        this.edit = true;
        this.submittingForm = true;
      } else {
        this.appTitle = 'Novo Comissionamento';
        this.action = 'create';
        this.edit = false;
      }

      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/comercial/',
        },
        {
          descricao: 'Comissões',
          routerLink: `/comercial/comissoes/${params['idSubModulo']}`,
        },
        {
          descricao: 'Representantes',
          routerLink: `/comercial/comissoes/${params['idSubModulo']}/representantes`,
        },
        {
          descricao: 'Lista',
          routerLink: `/comercial/comissoes/${params['idSubModulo']}/representantes/gestao-comissionamentos/lista`,
        },
      ];
    });
  }

  // formPesquisa e envio de dados para salvar
  setFormFilter(): void {
    const resolver = this.activatedRoute.snapshot.data.detalhes;
    const detalhes = resolver.data;

    this.form = this.formBuilder.group({
      dtInicioVigencia:
        detalhes.dataInicial != ''
          ? detalhes[0].dataInicial
          : [this.dateService.getFirstDayMonth()],
      dtFimVigencia:
        detalhes.dataFinal != ''
          ? detalhes[0].dataFinal
          : [this.dateService.getLastDayMonth()],
      mesReferente: '',
      idAnoMes: detalhes.idAnoMes == undefined ? detalhes[0].idAnoMes : '',
      codEscritorio: [0],
      codRepresentante: [0],
      codStatus: [0],
    });
  }

  checkRouterParams(): Object {
    let formValue = {
      dtInicioVigencia: [this.dateService.getFirstDayMonth()],
      dtFimVigencia: [this.dateService.getLastDayMonth()],
      codGestao: 0,
      codEscritorio: 0,
      codRepresentante: 0,
      codStatus: 0,
    };

    this.activatedRouteSubscription = this.activateRoute.queryParams.subscribe(
      (queryParams: any) => {
        if (Object.keys(queryParams).length > 0) {
          let params = atob(queryParams['q']);
          params = JSON.parse(params);
          this.search(params);

          Object.keys(formValue).forEach((formKey) => {
            Object.keys(params).forEach((paramKey) => {
              if (
                formKey == paramKey &&
                formValue[formKey] != params[paramKey]
              ) {
                if (!isNaN(Number(params[paramKey]))) {
                  formValue[formKey] = Number(params[paramKey]);
                } else {
                  formValue[formKey] = params[paramKey];
                }
              }
            });
          });
        }
      }
    );
    this.activatedRouteSubscription.unsubscribe();

    return formValue;
  }

  onVerify(dados) {
    // Cálculo Unidades
    for (let i = 0; i < dados.info.length; i++) {
      if (dados.info[i].valorBase > 0 && dados.info[i].valorComissao == 0) {
        this.pnotifyService.notice(
          'Efetue o cálculo das unidades obrigatórias.'
        );
        return;
      }
    }

    // Cálculo ROS
    for (let i = 0; i < dados.info.length; i++) {
      if (dados.info[i].nrRo > 0 && dados.info[i].valorDesconto == 0) {
        this.pnotifyService.notice('Efetue o cálculo da(s) RO(s).');
        return;
      }
    }

    // Cálculo Totais
    for (let i = 0; i < dados.info.length; i++) {
      if (dados.valorTotalComissao == null || dados.valorTotalComissao == 0) {
        this.pnotifyService.notice('Efetue o cálculo do valor total.');
        return;
      }
    }
  }

  // Cálculo do total de descontos
  onCalcDescontos(dados) {
    this.valorParcialDescontos = [];
    this.valorTotalDescontos = 0;

    for (let i = 0; i < dados.info.length; i++) {
      if (!dados.info[i].valorDesconto) return;
      this.valorParcialDescontos.push(parseFloat(dados.info[i].valorDesconto));
      var valorParcialValoresDescontos =
        this.valorParcialDescontos.filter(Boolean);

      if (dados.info[0].valorDesconto) {
        this.valorTotalDescontos = valorParcialValoresDescontos.reduce(
          (total, currentElement) => (total += currentElement)
        );
      } else {
        dados.info[0].valorDesconto = 0;
        if (dados.info[i].valorDesconto == 0) {
        } else {
          this.valorTotalDescontos = valorParcialValoresDescontos.reduce(
            (total, currentElement) => (total += currentElement)
          );
        }
      }
    }

    dados.valorTotalDescontos = this.valorTotalDescontos;
  }

  // Cálculo do total de valor da ajuda
  onCalcAjuda(dados) {
    this.valorParcialAjuda = [];
    this.valorTotalAjuda = 0;

    for (let i = 0; i < dados.info.length; i++) {
      if (!dados.info[i].valorAjudaCusto) return;
      this.valorParcialAjuda.push(parseFloat(dados.info[i].valorAjudaCusto));
      var valorParcialValoresAjuda = this.valorParcialAjuda.filter(Boolean);

      if (dados.info[0].valorAjudaCusto) {
        this.valorTotalAjuda = valorParcialValoresAjuda.reduce(
          (total, currentElement) => (total += currentElement)
        );
      } else {
        dados.info[0].valorAjudaCusto = 0;
        if (dados.info[i].valorAjudaCusto == 0) {
        } else {
          this.valorTotalAjuda = valorParcialValoresAjuda.reduce(
            (total, currentElement) => (total += currentElement)
          );
        }
      }
    }
    dados.valorTotalAjuda = this.valorTotalAjuda;
  }

  // Adiciona dados ao array de dados
  onAddData(dados) {
    this.onCalcDescontos(dados);
    this.onCalcAjuda(dados);
    dados.dataInicial = this.form.value.dtInicioVigencia;
    dados.dataFinal = this.form.value.dtFimVigencia;
  }

  // Grava os dados do array
  onSubmit(dados): void {
    this.onVerify(dados);
    this.onAddData(dados);
    this.saved = false;

    if (this.action === 'update') {
      if (dados.info.length > 0) {
        this.loaderNavbar = true;
        this.submittingForm = true;

        this.gestaoComissionamentosService
          .updateComissao(dados, this.action)
          .pipe(
            finalize(() => {
              this.loaderNavbar = false;
              this.submittingForm = false;
            })
          )
          .subscribe({
            next: (response: any) => {
              if (
                response.hasOwnProperty('success') &&
                response.success === true
              ) {
                this.saved = true;
                dados.salvo = 'true';
                this.pnotifyService.success(response.mensagem);
              } else if (
                response.hasOwnProperty('success') &&
                response.success === false
              ) {
                this.pnotifyService.error(response.mensagem);
              } else {
                this.pnotifyService.error();
              }
            },
            error: (error: any) => {
              this.pnotifyService.error();
            }
          });
      } else {
        this.pnotifyService.notice('Adicione um Comissionamento.');
      }
    } else {
      if (dados.info.length > 0) {
        this.loaderNavbar = true;
        this.submittingForm = true;

        this.gestaoComissionamentosService
          .saveComissao(dados, this.action)
          .pipe(
            finalize(() => {
              this.loaderNavbar = false;
              this.submittingForm = false;
            })
          )
          .subscribe({
            next: (response: any) => {
              if (
                response.hasOwnProperty('success') &&
                response.success === true
              ) {
                this.saved = true;
                dados.salvo = 'true';

                this.pnotifyService.success(response.mensagem);
              } else if (
                response.hasOwnProperty('success') &&
                response.success === false
              ) {
                this.pnotifyService.error(response.mensagem);
              } else {
                this.pnotifyService.error();
              }
            },
            error: (error: any) => {
              this.pnotifyService.error();
            }
          });
      } else {
        this.pnotifyService.notice('Adicione um Comissionamento.');
      }
    }
  }

  // formInputs dos cálculos
  setFormInputs(): void {
    this.formInputs = this.formBuilder.group({
      nomeRepresentante: '',
      codRepresentante: '',
      unidade: [0, Validators.required],
      valorBaseInput: [''],
      valorBaseDBA: [''],
      valorBaseACO: [''],
      descontos: 0,
      valorAjudaCusto: 0,
      percentual: [''],
      unidadeInput: [''],
      descontosInput: 0,
      valorAjudaCustoInput: 0,

      anexos: this.formBuilder.array([]),
    });
  }

  // formReprovar da reprovação da comissão
  setFormReprovar(dados?): void {
    this.formReprovar = this.formBuilder.group({
      codComissaoRepresentante: '',
      descMotivo: '',
    });
  }

  // formValores para envio de valores do Gerente Fiscal
  setFormValores(dados?): void {
    this.formValores = this.formBuilder.group({
      codComissaoRepresentante: dados ? [dados.codComissaoRepresentante] : '',
      valorLiquido: 0,
      valorImposto: 0,
    });
  }

  onSubmitValores(dados) {
    if (
      this.formValores.value.valorLiquido +
        this.formValores.value.valorImposto ===
      dados.valorTotalComissao
    ) {
      var formValores = {
        codComissaoRepresentante: dados.codComissaoRepresentante,
        valorLiquido: this.formValores.value.valorLiquido.toFixed(2),
        valorImposto: this.formValores.value.valorImposto.toFixed(2),
      };

      this.gestaoComissionamentosService
        .postValores(formValores)
        .pipe(
          finalize(() => {
            this.loaderNavbar = false;
            this.dadosLoaded = true;
            dados.valoresEnviados = 'true';
          })
        )
        .subscribe({
          next: (response: JsonResponse) => {
            if (response.success === true) {
              this.dados = response.data;
              this.pnotifyService.success('Valores cadastrados com sucesso');
              dados.valoresEnviados = 'true';
            } else if (
              response.hasOwnProperty('success') &&
              response.success === false
            ) {
            } else {
              this.pnotifyService.error();
            }
          },
          error: (error: any) => {
            if (error.error.hasOwnProperty('mensagem')) {
              this.pnotifyService.error(error.error.mensagem);
            } else {
              this.pnotifyService.error('Erro ao cadastrar valores');
            }
          }
        });
    } else {
      this.pnotifyService.notice(
        'O total do valor líquido + valor dos impostos não são iguais o valor total da comissão.'
      );
    }
  }

  // Essa função checa se as datas são de meses diferentes
  checkValidatorsData(): boolean {
    let validation = true;

    var dtInicialContrato = this.form.value.dtInicioVigencia.getMonth();
    var dtFinalContrato = this.form.value.dtFimVigencia.getMonth();

    if (dtInicialContrato != dtFinalContrato) {
      validation = false;
      return;
    }
    return validation;
  }

  // Chamada de dados para Adição ou Edição
  getCreate(item?, dados?) {

    if (this.action === 'update') {
      const resolver = this.activatedRoute.snapshot.data.detalhes;

      if (resolver.success === true) {
        const detalhes = resolver.data;
        this.dadosData = resolver.data;

        this.dataInicial = this.dadosData[0].dataInicial;
        this.dataFinal = this.dadosData[0].dataFinal;
        this.mesRef = this.dadosData[0].periodo;
        this.form.get('mesReferente').setValue(this.dadosData[0].periodo);
      }
    }
  }

  getDados(params?) {
    this.dadosEmpty = false;
    this.gestaoComissionamentosService
      .getFormComissoes(params)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.success === true) {
            this.dadosComissao = response.data;
          } else {
            this.pnotifyService.error();
            this.dadosEmpty = true;
          }
        },
        error: (error: any) => {
          if (error['error'].hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
      });
  }

  // Lógica de Cálculos e exclusão de dados
  onDelete(dados, indice, item, index) {
    dados.info.splice(index, 1);

    this.valorParcial = [];

    for (let i = 0; i < dados.info.length; i++) {
      this.valorParcial.push(parseFloat(dados.info[i].valorComissao));
      var valorParcial2 = this.valorParcial.filter(Boolean);
      this.valorTotal = valorParcial2.reduce(
        (total, currentElement) => (total += currentElement)
      );
    }
    dados.valorTotalComissao = this.valorTotal;
  }

  // Pega o array retornado da pesquisa e cria unidades
  onCreateUnidades(item) {
    this.formInputs.value.valorBaseInput = item.valorBase;

    if (this.formInputs.get('percentual').touched) {
      item.percentualComissao = this.formInputs.value.percentual;
      item.valorAjudaCusto = 0;

      const percentual = item.percentualComissao / 100;
      const total = item.valorBase * percentual;
      item.valorComissao = Number(total.toFixed(2));
    } else {
      item.valorAjudaCusto = 0;

      const percentual = item.percentualComissao / 100;
      const total = item.valorBase * percentual;
      item.valorComissao = Number(total.toFixed(2));
    }
  }

  // Pega o array retornado da pesquisa e cria DBA
  onCreateDBA(item) {
    item.percentualComissao = 0;
    item.valorBase = 0;

    if (
      this.formInputs.value.valorBaseDBA == null ||
      this.formInputs.value.valorBaseDBA == undefined
    ) {
      // this.pnotifyService.notice('Favor preencher os dados corretamente.');
      this.formInputs.get('valorBase').setValue(0);
    }

    if (
      this.formInputs.value.valorBaseDBA == 0 ||
      this.formInputs.value.percentual == 0
    ) {
      this.pnotifyService.notice(
        'Não é possível cálcular um DBA com valor zerado.'
      );
      return;
    } else {
      item.valorBase = this.formInputs.value.valorBaseDBA;

      item.percentualComissao = this.formInputs.value.percentual;

      // this.valorBaseDBA = item.valorBase;
      // this.percentualDBA = item.percentualComissao;

      item.valorAjudaCusto = 0;

      const percentual = item.percentualComissao / 100;
      const total = item.valorBase * percentual;
      item.valorComissao = total.toFixed(2);
    }
  }

  // Pega o array retornado da pesquisa e cria PLANA AÇO
  onCreatePlanaAco(item) {
    item.percentualComissao = 0;
    item.valorBase = 0;

    if (
      this.formInputs.value.valorBaseACO == null ||
      this.formInputs.value.valorBaseACO == undefined
    ) {
      // this.pnotifyService.notice('Favor preencher os dados corretamente.');
      this.formInputs.get('valorBase').setValue(0);
    }

    if (
      this.formInputs.value.valorBaseACO == 0 ||
      this.formInputs.value.percentual == 0
    ) {
      this.pnotifyService.notice(
        'Não é possível cálcular um PLANA AÇO com valor zerado.'
      );
      return;
    } else {
      item.valorBase = this.formInputs.value.valorBaseACO;

      item.percentualComissao = this.formInputs.value.percentual;

      // this.valorBaseACO = item.valorBase;
      // this.percentualACO = item.percentualComissao;

      item.valorAjudaCusto = 0;

      const percentual = item.percentualComissao / 100;
      const total = item.valorBase * percentual;
      item.valorComissao = total.toFixed(2);
    }
  }

  // Pega o array retornado da pesquisa e cria ROS
  onCreateRo(item) {
    if (item.valorDesconto == 0 && this.formInputs.value.descontos == 0) {
      this.pnotifyService.notice('Favor adicionar um valor para o cálculo!');
      return;
    }

    item.valorAjudaCusto = 0;
    item.valorDesconto = this.formInputs.value.descontos;
    const valorComissao = 0;
    item.valorComissao = valorComissao - item.valorDesconto;
  }

  // Pega o array retornado da pesquisa e cria campo para DESCONTOS
  onCreateDescontos(item) {
    item.valorBase = 0;
    item.percentualComissao = 0;
    item.valorDesconto = this.formInputs.value.descontos;
    item.valorAjudaCusto = 0;

    const valorComissao = 0;
    item.valorComissao = valorComissao - this.formInputs.value.descontos;
  }

  // Pega o array retornado da pesquisa e cria campo para AJUDA DE CUSTO
  onCreateAjudaCusto(item) {
    item.valorBase = 0;
    item.percentualComissao = 0;
    item.valorDesconto = 0;
    item.valorAjudaCusto = this.formInputs.value.valorAjudaCusto;

    const valorComissao = 0;
    item.valorComissao = valorComissao + this.formInputs.value.valorAjudaCusto;
  }

  // Usa o formInputs para adicionar um novo array de DESCONTOS no array principal retornado
  onCreateAddDescontos(item, dados) {
    item.valorBase = 0;
    item.percentualComissao = 0;
    item.valorDesconto = this.formInputs.value.descontos;
    item.valorAjudaCusto = 0;

    const valorComissao = 0;
    item.valorComissao = valorComissao - this.formInputs.value.descontosInput;

    const valores = {
      codGestao: dados.info[0].codGestao,
      codRepresentante: dados.codRepresentante,
      unidade: this.formInputs.value.unidadeInput,
      codTipoPagamento: dados.info[0].codTipoPagamento,
      nrRo: null,
      valorBase: 0,
      valorDesconto: this.formInputs.value.descontosInput,
      percentualComissao: 0,
      valorAjudaCusto: 0,
      valorComissao: item.valorComissao.toFixed(2),
    };

    dados.info.push(valores);
  }

  // Usa o formInputs para adicionar um novo array de AJUDA DE CUSTO no array principal retornado
  onCreateAddAjudaCusto(item, dados) {
    item.valorBase = 0;
    item.percentualComissao = 0;
    item.valorDesconto = 0;
    item.valorAjudaCusto = this.formInputs.value.valorAjudaCusto;

    const valorComissao = 0;
    item.valorComissao =
      valorComissao + this.formInputs.value.valorAjudaCustoInput;

    const valores = {
      codGestao: dados.info[0].codGestao,
      codRepresentante: dados.codRepresentante,
      unidade: this.formInputs.value.unidadeInput,
      codTipoPagamento: dados.info[0].codTipoPagamento,
      nrRo: null,
      valorBase: 0,
      valorDesconto: 0,
      percentualComissao: 0,
      valorAjudaCusto: this.formInputs.value.valorAjudaCustoInput,
      valorComissao: item.valorComissao.toFixed(2),
    };

    dados.info.push(valores);
  }

  onUpdateUnidades(item) {
    this.formInputs.value.valorBaseInput = item.valorBase;
    item.percentualComissao = this.formInputs.value.percentual;

    const percentual = item.percentualComissao / 100;
    const total = item.valorBase * percentual;
    item.valorComissao = total.toFixed(2);
  }

  onUpdateDBA(item) {}

  onUpdatePlanaAco(item) {}

  onUpdateRo(item) {
    item.valorDesconto = this.formInputs.value.descontos;
    const valorComissao = 0;
    item.valorComissao = valorComissao - item.valorDesconto;
    item.valorAjudaCusto = 0;
  }

  onUpdateDescontos(item) {
    item.valorDesconto = this.formInputs.value.descontos;

    const valorComissao = 0;
    item.valorComissao = valorComissao - item.valorDesconto;
  }

  onUpdateAjudaCusto(item) {
    item.valorAjudaCusto = this.formInputs.value.valorAjudaCusto;

    const valorComissao = 0;
    item.valorComissao = valorComissao + item.valorAjudaCusto;
  }

  onUpdateAddDescontos(item, dados) {
    item.valorBase = 0;
    item.valorPercentual = 0;
    item.valorDesconto = this.formInputs.value.descontos;
    item.valorAjudaCusto = 0;

    const valorComissao = 0;
    item.valorComissao = valorComissao - this.formInputs.value.descontosInput;

    const valores = {
      codRepresentante: dados.codRepresentante,
      unidade: this.formInputs.value.unidadeInput,
      codTipoPagamento: dados.info[0].codTipoPagamento,
      valorBase: 0,
      valorDesconto: this.formInputs.value.descontosInput,
      valorPercentual: 0,
      valorAjudaCusto: 0,
      valorComissao: item.valorComissao.toFixed(2),
    };

    dados.info.push(valores);
  }

  onUpdateAddAjudaCusto(item, dados) {
    item.valorBase = 0;
    item.valorPercentual = 0;
    item.valorDesconto = 0;
    item.valorAjudaCusto = this.formInputs.value.valorAjudaCusto;

    const valorComissao = 0;
    item.valorComissao =
      valorComissao + this.formInputs.value.valorAjudaCustoInput;

    const valores = {
      codRepresentante: dados.codRepresentante,
      unidade: this.formInputs.value.unidadeInput,
      codTipoPagamento: dados.info[0].codTipoPagamento,
      valorBase: 0,
      valorDesconto: 0,
      valorPercentual: 0,
      valorAjudaCusto: this.formInputs.value.valorAjudaCustoInput,
      valorComissao: item.valorComissao.toFixed(2),
    };

    dados.info.push(valores);
  }

  getConta(indice, dados, i, item) {
    this.valorParcial = [];

    if (this.action === 'create') {
      if (item.codRepresentante) {
        // essa tratativa foi comentada porque no momento do desenvolvimento os valores já vem cálculados,
        // mas caso isso mude ainda em desenvolvimento pode utilizar esse código, caso aprovado pela área,
        // pode deletar essa parte do código

        // if ((this.formInputs.value.percentual > 0 || item.percentualComissao > 0) && item.nrRo == null &&
        // (item.unidade != 'DBA' || item.unidade != 'PLANA AÇO') &&
        //   this.formInputs.value.unidadeInput == '' && this.formInputs.value.descontos == 0 &&
        //   this.formInputs.value.valorAjudaCusto == 0) {

        //     this.onCreateUnidades(item);

        //   } else

        if (item.unidade === 'DBA') {
          this.onCreateDBA(item);
        } else if (item.unidade === 'PLANA AÇO') {
          this.onCreatePlanaAco(item);
        } else if (item.nrRo > 0) {
          this.onCreateRo(item);
        } else if (item.valorDesconto > 0 && item.unidade != 'RO') {
          this.onCreateDescontos(item);
        } else if (
          item.valorAjudaCusto > 0 &&
          dados.info[0].valorComissao > 0
        ) {
          this.onCreateAjudaCusto(item);
        }
      } else {
        // Esse if verifica se tanto os inputs de desconto e valorAjuda estão preenchidos ao mesmo tempo
        // algo proibido, tendo em conta que pode enviar apenas um dado desses por vez
        if (
          this.formInputs.value.descontosInput > 0 &&
          this.formInputs.value.valorAjudaCustoInput > 0
        ) {
          this.pnotifyService.notice(
            'Preencha apenas os Descontos ou o valor da Ajuda de custos.'
          );
          this.formInputsFieldReset();
          return;

          // Esse else if verifica se tanto os inputs de desconto e valorAjuda não estão preenchidos
        } else if (
          (this.formInputs.value.descontosInput == 0 &&
            this.formInputs.value.valorAjudaCustoInput == 0) ||
          (this.formInputs.value.unidadeInput == '' &&
            this.formInputs.value.valorBaseInput > 0 &&
            item.nrRo == 0)
        ) {
          this.pnotifyService.notice('Preencha os campos antes de calcular.');
          this.formInputsFieldReset();
          return;
        } else if (
          (this.formInputs.value.descontosInput > 0 ||
            this.formInputs.value.valorAjudaCustoInput > 0) &&
            this.formInputs.value.unidadeInput == ''
        ) {
          this.pnotifyService.notice('Preencha o nome da ocorrência antes de calcular.');
          return;
        } else if (
          this.formInputs.value.descontosInput > 0 &&
          dados.info[0].valorComissao > 0
        ) {
          this.onCreateAddDescontos(item, dados);
        } else if (
          this.formInputs.value.valorAjudaCustoInput > 0 &&
          dados.info[0].valorComissao > 0
        ) {
          this.onCreateAddAjudaCusto(item, dados);
        }

        // Essa parte do código foi comentada para testar se não vai ocorrer erros, pode ser deletada caso não ocorra

        // else if (dados.info[0].valorComissao == 0 || dados.info[0].valorComissao == null) {
        //   this.formInputsFieldReset();
        //   this.pnotifyService.notice('Favor efetuar os cálculos das unidades primeiro.');
        // }
      }
    } else {
      if (item.codRepresentante) {
        if (
          item.percentualComissao > 0 &&
          item.nrRo == 0 &&
          this.formInputs.value.unidadeInput == ''
        ) {
          this.onUpdateUnidades(item);
        } else if (item.nrRo > 0 || item.unidade === 'ROs') {
          this.onUpdateRo(item);
        } else if (item.valorDesconto > 0) {
          this.onUpdateDescontos(item);
        } else if (item.valorAjudaCusto > 0) {
          this.onUpdateAjudaCusto(item);
        }
      } else {
        if (
          this.formInputs.value.descontosInput > 0 &&
          this.formInputs.value.valorAjudaCustoInput > 0
        ) {
          this.pnotifyService.notice(
            'Preencha apenas os Descontos ou o valor da Ajuda de custos.'
          );
          this.formInputsFieldReset();
          return;
        } else if (
          (this.formInputs.value.descontosInput == 0 &&
            this.formInputs.value.valorAjudaCustoInput == 0) ||
          this.formInputs.value.unidadeInput == ''
        ) {
          this.pnotifyService.notice('Preencha os campos antes de calcular.');
          this.formInputsFieldReset();
          return;
        } else if (this.formInputs.value.descontosInput > 0) {
          this.onUpdateAddDescontos(item, dados);
        } else if (
          this.formInputs.value.valorAjudaCustoInput > 0 &&
          dados.info[0].valorComissao > 0
        ) {
          this.onUpdateAddAjudaCusto(item, dados);
        }
      }
    }

    this.onCalcTotalComissao(dados);

    this.formInputsFieldReset();
    this.formInputs.get('percentual').markAsUntouched();
    // this.formInputs.get('valorBase').markAsUntouched();
  }

  onCalcTotalComissao(dados) {
    for (let i = 0; i < dados.info.length; i++) {
      this.valorParcial.push(parseFloat(dados.info[i].valorComissao));
      var valorParcialValores = this.valorParcial.filter(Boolean);

      if (dados.info[0].valorComissao) {
        this.valorTotal = valorParcialValores.reduce(
          (total, currentElement) => (total += currentElement)
        );
      } else {
        dados.info[0].valorComissao = 0;
        if (dados.info[i].valorComissao == 0) {
        } else {
          this.valorTotal = valorParcialValores.reduce(
            (total, currentElement) => (total += currentElement)
          );
        }
      }
    }
    dados.valorTotalComissao = this.valorTotal;
  }

  formInputsFieldReset() {
    this.formInputs.get('unidadeInput').setValue('');
    this.formInputs.get('descontosInput').setValue('');
    this.formInputs.get('valorAjudaCustoInput').setValue('');
  }

  formDbaAcoReset() {
    this.formInputs.patchValue({
      valorBaseDBA: 0,
      valorBaseACO: 0,
      percentual: 0,
    });
  }

  // Lógica de Anexos
  getAnexos(codComissao) {
    this.loaderNavbar = true;
    this.showAnexos = false;
    this.gestaoComissionamentosService
      .getAnexos(codComissao)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.success === true) {
            this.setAnexos(response.data);
            this.showAnexos = true;
          } else if (
            response.success === false &&
            response.hasOwnProperty('mensagem')
          ) {
            // this.pnotifyService.error(response.mensagem);
          } else {
            this.pnotifyService.error();
          }
        },
        error: (error: any) => {
          if (error['error'].hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
      });
  }

  setAnexos(anexos: any): void {
    if (anexos.length > 0) {
      for (let i = 0; i < anexos.length; i++) {
        this.onAddAnexos(anexos[i], true);
      }
    }
  }

  get anexos(): FormArray {
    return this.formInputs.get('anexos') as FormArray;
  }

  onAddAnexos(anexo: any, manipulateForm?: boolean): void {
    if (this.checkAnexoExists(anexo) === false) {
      this.anexos.push(
        this.formBuilder.group({
          codAnexo: [anexo.codAnexo],
          nomeAnexo: [anexo.nomeAnexo],
          linkAnexo: [anexo.linkAnexo],
        })
      );

      if (manipulateForm) {
        this.formInputs.markAsTouched();
        this.formInputs.markAsDirty();
      }
    }
  }

  onAnexar() {
    this.anexar = !this.anexar;
  }

  appendFile(files: FileList, index, dados) {
    if (this.formData.length > 0) {
      return;
    }
    if (files.length === 0) return;
    const fd = new FormData();
    fd.append('file', files[0]);
    this.formData.push(fd);

     this.arrayAnexos.push({
      nomeAnexo: files[0]['name'],
      codComissaoRepresentante: this.codComissaoRepresentante,
    });

    dados = this.dadosIndex;
    dados.anexos = this.arrayAnexos;

    if (this.showAnexos === false) {
      this.showAnexos = true;
    }
  }

  validAnexos() {
    if (this.formData.length > 0) {
      this.pnotifyService.notice("Favor enviar anexos pendentes!");
      return;
    }
  }

  getIndexAnexos(dados, index) {
    this.indexAnexos = index;
    this.codComissaoRepresentante = dados.codComissaoRepresentante;
    this.dadosIndex = dados;
  }

  checkAnexoExists(anexo: any): boolean {
    return this.formInputs.value.anexos.some((el: any) => {
      return el.codAnexo === anexo.codAnexo;
    });
  }

  onDeleteAnexo(codAnexo: number, index: number, dados): void {
    this.confirmDelete().subscribe((r: boolean) => {
      if (dados.anexos[0].codAnexo) {
        this.loaderNavbar = true;
        this.gestaoComissionamentosService
          .deleteAnexo(dados.anexos[0].codAnexo)
          .pipe(
            finalize(() => {
              this.loaderNavbar = false;
            })
          )
          .subscribe({
            next: (response: JsonResponse) => {
              if (
                response.hasOwnProperty('success') &&
                response.success === true
              ) {
                r ? this.deleteDocumento(index, dados) : null;
                this.pnotifyService.success(response.mensagem);
              } else if (
                response.hasOwnProperty('success') &&
                response.success === false &&
                response.hasOwnProperty('mensagem')
              ) {
                this.pnotifyService.error(response.mensagem);
              } else {
                this.pnotifyService.error();
              }
            },
            error: (error: any) => {
              if (error['error'].hasOwnProperty('mensagem')) {
                this.pnotifyService.error(error.error.mensagem);
              } else {
                this.pnotifyService.error();
              }
            }
          });
      } else {
        r ? this.deleteDocumento(index, dados) : null;
        this.formData.splice(index, 1);
      }
    });
  }

  confirmDelete(): any {
    return this.confirmModalService.showConfirm(
      'delete',
      'Confirmar exclusão',
      'Deseja realmente prosseguir com a exclusão do registro?',
      'Cancelar',
      'Confirmar'
    );
  }

  onPostAnexos(codComissaoRepresentante: number, dados, indexComissao): void {
    if (this.formData.length === 0) {
      /* this.pnotifyService.notice('Erro'); */
      return;
    }
    this.formData.forEach((element, index) => {
        this.gestaoComissionamentosService
        .postAnexos(element, codComissaoRepresentante)
        .subscribe({
          next: (response: any) => {
            if (response.success === true) {
              this.pnotifyService.success(response.mensagem);
              dados.anexoEnviado = 'true';
              dados.codSituacao = 3;
            } else if (
              response.hasOwnProperty('success') &&
              response.success === false
            ) {
              this.pnotifyService.error(response.mensagem);
            } else {
              this.pnotifyService.error();
            }
          },
          error: (error: any) => {
            this.pnotifyService.error();
          },
          complete: () => {
            this.arrayAnexos = [];
            this.dadosIndex = [];
            this.formData = [];
            dados.anexos = [];

            setTimeout(() => {
              this.checkRouterParams();
            }, 1000);

          }
        });
    });
  }

  deleteDocumento(index: number, dados) {
    dados.anexos.splice(index, 1);
    this.nomeAnexo = 'vazio';
    // dados.anexos.removeAt(index);
    this.form.markAsTouched();
    this.form.markAsDirty();
  }

  registrarAcesso() {
    this.atividadesService.registrarAcesso().subscribe();
  }

  // Get de dados para ngSelect
  getStatus() {
    this.gestaoComissionamentosService.getSituacao().subscribe({
      next: (response: any) => {
        if (response.success === true) {
          this.situacao = response.data;

          this.situacao.unshift({
            codSituacao: 0,
            nomeSituacao: 'EXIBIR TODOS',
          });
        } else {
          this.pnotifyService.error();
        }
      },
      error: (error: any) => {
        this.pnotifyService.error();
      }
    });
  }

  getEscritorios() {
    this.gestaoComissionamentosService
      .getEscritorios()
      .pipe(
        finalize(() => {

        })
      )
      .subscribe((response: any) => {
        if (response.success === true) {
          this.escritorios = response.data;

          this.escritorios.unshift({
            idEscritorio: 0,
            nomeEscritorio: 'EXIBIR TODOS',
          });

          setTimeout(() => {
            const escritorios = this.form.controls['codEscritorio'].value;
            this.getRepresentantes(escritorios);
          }, 2000);

        } else {
          this.pnotifyService.error();
          this.location.back();
        }
      });
  }

  getRepresentantes(codEscritorio) {
    this.gestaoComissionamentosService
      .getRepresentantes(codEscritorio)
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe((response: any) => {
        if (response.success === true) {
          this.representantes = response.data;

          this.representantes.unshift({
            codRepresentante: 0,
            nomeRepresentante: 'EXIBIR TODOS',
          });

        } else {
          this.pnotifyService.error();
          this.location.back();
        }
      });
  }

  onChangeEscritorio(codEscritorio: number) {
    const representantes = this.representantes.filter(representante => {
      return representante.codTidEscritorio == codEscritorio;
    })
    this.filteredRepresentantes = representantes;

    this.filteredRepresentantes.unshift({
      codRepresentante: 0,
      nomeRepresentante: 'TODOS',
    });
  }

  openDetails(dados) {
    this.loaderNavbar = true;
    this.gestaoComissionamentosService
      .getDetalhesRepresentante(dados)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.success === true) {
            this.dadosDetalhes = response.data;
          } else {
            this.pnotifyService.error();
          }
        },
        error: (error: any) => {
          this.pnotifyService.error();
        }
      });
  }

  openDetailsUnidadess(item) {
    this.dadosDetalhesUnidades = [];
    this.loaderFullScreen = true;
    this.dadosEmptyUnidades = false;

    if (item.unidade === 'RO') {
      var codRo = 1;
    } else {
      var codRo = 0;
    }

    const params = {
      codGestao: item.codGestao,
      codRepresentante: item.codRepresentante,
      codUnidade: item.codUnidade,
      codRo: codRo,
      codTipoPagamento: item.codTipoPagamento,
    };
    this.gestaoComissionamentosService
      .getDetalhesUnidades(params)
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.success === true) {
            this.dadosDetalhesUnidades = response.data;
            this.dadosEmptyUnidades = false;
          } else {
            this.pnotifyService.error();
            this.loaderFullScreen = false;
            this.dadosEmptyUnidades = true;
          }
        },
        error: (error: any) => {
          this.pnotifyService.error();
        }
      });
  }

  // Pesquisa
  onFilter(): void {
    if (this.action == 'create') {
      if (!this.checkValidatorsData()) {
        this.pnotifyService.notice(
          'A data inicial e final não podem ser de meses diferentes!'
        );
        return;
      }
    }

    if (this.form.valid) {
      this.itemsPerPage = this.form.value.registros;
      this.currentPage = 1;
      this.setRouterParams(this.getParams());
    }
  }

  search(params: any): void {
    this.loaderNavbar = true;
    this.detailPanelService.hide();
    this.dados = [];
    this.dadosLoaded = false;
    this.dadosEmpty = false;

    this.formDbaAcoReset();

    if (this.action === 'create') {
      this.getDados(params);
    } else {
      this.gestaoComissionamentosService
        .getListaEdicaoComissoes(params)
        .pipe(
          finalize(() => {
            this.loaderNavbar = false;
            this.dadosLoaded = true;
          })
        )
        .subscribe({
          next: (response: JsonResponse) => {
            if (response.success === true) {
              this.dadosEmpty = false;
              this.dadosComissao = response.data;
            } else if (
              response.hasOwnProperty('success') &&
              response.success === false
            ) {
              this.dadosEmpty = true;
            } else {
              this.pnotifyService.error();
              this.dadosEmpty = true;
            }
          },
          error: (error: any) => {
            this.dadosEmpty = true;

            if (error.error.hasOwnProperty('mensagem')) {
              this.pnotifyService.error(error.error.mensagem);
            } else {
              this.pnotifyService.error();
            }
          }
        });
    }
  }

  // Verificar Parâmetros
  setRouterParams(params: any): void {
    this.router.navigate([], {
      relativeTo: this.activateRoute,
      queryParams: { q: btoa(JSON.stringify(params)) },
    });
    this.search(params);
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

  verificaParams(): Object {
    let params: any = {};

    if (this.form.value.codRepresentante) {
      params.codRepresentante = this.form.value.codRepresentante;
    }

    if (this.form.value.codEscritorio) {
      params.codEscritorio = this.form.value.codEscritorio;
    }

    if (this.form.value.dtInicioVigencia) {
      params.dtInicioVigencia = this.form.value.dtInicioVigencia;
    }

    if (this.form.value.dtFimVigencia) {
      params.dtInicioVigencia = this.form.value.dtFimVigencia;
    }

    if (this.form.value.codStatus) {
      params.codStatus = this.form.value.codStatus;
    }

    return params;
  }

  // inputFileChange(event) {
  //   if (event.target.files && event.target.files[0]) {
  //     const file = event.target.files[0];

  //     const formData = new FormData();
  //     formData.append('file', file);
  //   }
  // }

  navegarAnexo(anexo) {
    this.router
      .navigate([], {
        relativeTo: this.activatedRoute,
      })
      .then((result) => {
        window.open(`${anexo.urlAnexo}`, '_blank');
      });
  }

  // Lógicas de perfil
  getPerfil() {
    this.visualizar = false;
    this.gestaoComissionamentosService
      .getPermissoesAcesso()
      .pipe(
        finalize(() => {
          // this.loaderFullScreen = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.success === true) {
            this.profile = response.data;
            if (
              this.profile.analistaMarketing === true &&
              (this.profile.gerenteMarketing === false ||
                this.profile.gerenteEscritorio === false ||
                this.profile.gerenteFiscal === false ||
                this.profile.diretorComercial === false)
            ) {
              this.analistaDisabled();
              if (this.action === 'create') {
                this.visualizar = false;
              } else {
                this.visualizar = true; // caso precise de edição, tirar essa Unidade
              }
            } else if (this.profile.gerenteMarketing === true) {
              this.gerenteDisabled();
              this.visualizar = true;
            } else if (this.profile.gerenteEscritorio === true) {
              const id = this.profile.info[0].escritorio;
              this.escritorioDisabled(id);
              this.visualizar = true;
            } else if (this.profile.gerenteFiscal === true) {
              this.fiscalDisabled();
              this.visualizar = true;
            } else if (this.profile.diretorComercial === true) {
              this.diretorDisabled();
              this.visualizar = true;
            }
          }
        },
        error: (error: any) => {
          this.showPermissionDenied = true;
        }
      });
  }

  analistaDisabled() {
    // SE FOR PASSAR STATUS, TIRAR OS DISABLES
    if (this.action === 'update') {
      this.form.get('codStatus').setValue(3);
      this.status = this.form.value.codStatus;
      // this.form.get("codStatus").disable();
    }
  }

  escritorioDisabled(idEscritorio) {
    this.form.get('dtInicioVigencia').disable();
    // SE FOR PASSAR DATAS, TIRAR OS DISABLES
    this.form.get('dtFimVigencia').disable();
    this.form.get('codEscritorio').setValue(idEscritorio);
    this.form.get('codStatus').setValue('1, 2');
    this.readonly = false;
  }

  gerenteDisabled() {
    this.form.get('dtInicioVigencia').disable();
    this.form.get('dtFimVigencia').disable();
    this.form.get('codStatus').setValue(4);
    this.readonly = false;
  }

  fiscalDisabled() {
    // SE FOR PASSAR DATAS, TIRAR OS DISABLES
    this.form.get('dtInicioVigencia').disable();
    this.form.get('dtFimVigencia').disable();
    this.form.get('codStatus').setValue(5);
    this.readonly = false;
  }

  diretorDisabled() {
    this.form.get('dtInicioVigencia').disable();
    this.form.get('dtFimVigencia').disable();
    this.form.get('codStatus').setValue(6);
    this.readonly = false;
  }

  // Histórico de Exclusão
  onHistoricoExclusao(dados) {
    this.dadosHistorico = [];
    this.loaderFullScreen = true;
    this.dadosEmptyHistorico = false;

    this.gestaoComissionamentosService
      .getHistorico(dados[0].codComissaoRepresentante)
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.success === true) {
            this.dadosHistorico = response.data;
            this.dadosEmptyHistorico = false;
          } else if (
            response.hasOwnProperty('success') &&
            response.success === false
          ) {
            this.dadosEmptyHistorico = true;
          } else {
            this.pnotifyService.error();
          }
        },
        error: (error: any) => {
          this.dadosEmptyHistorico = true;

          if (error.error.hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
      });
  }

  // Lógicas de aprovação
  onAprovarAnalista(dados) {
    dados.clicado = true;
    this.gestaoComissionamentosService
      .postAprovar(dados)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
          this.dadosLoaded = true;
          dados.clicado = false;
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.success === true) {
            this.pnotifyService.success('Comissão aprovada com sucesso!');
            dados.analista = 'true';
          } else if (
            response.hasOwnProperty('success') &&
            response.success === false
          ) {
            this.dadosEmpty = true;
          } else {
            this.pnotifyService.error();
            this.dadosEmpty = true;
          }
        },
        error: (error: any) => {
          this.dadosEmpty = true;

          if (error.error.hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
      });
  }

  onReprovarAnalista(dados) {
    dados.clicado = true;

    var formReprovar = {
      codComissaoRepresentante: dados.codComissaoRepresentante,
      descMotivo: this.formReprovar.value.descMotivo,
    };

    if (this.formReprovar.value.descMotivo == '') {
      this.pnotifyService.notice('Motivo da reprovação é obrigatório!');
      return;
    }

    this.gestaoComissionamentosService
      .postReprovar(formReprovar)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
          this.dadosLoaded = true;
          dados.clicado = false;
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.success === true) {
            this.pnotifyService.success('Comissão reprovada com sucesso!');
            dados.analista = 'false';
          } else if (
            response.hasOwnProperty('success') &&
            response.success === false
          ) {
            this.dadosEmpty = true;
          } else {
            this.pnotifyService.error();
            this.dadosEmpty = true;
          }
        },
        error: (error: any) => {
          this.dadosEmpty = true;

          if (error.error.hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
      });
  }

  onAprovarEscritorio(dados) {
    dados.clicado = true;
    this.gestaoComissionamentosService
      .postAprovar(dados)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
          this.dadosLoaded = true;
          dados.clicado = false;
          dados.notasSolicitadas = 'true';
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.success === true) {
            this.pnotifyService.success('Comissão aprovada com sucesso!');
            dados.analista = 'true';
          } else if (
            response.hasOwnProperty('success') &&
            response.success === false
          ) {
            this.dadosEmpty = true;
          } else {
            this.pnotifyService.error();
            this.dadosEmpty = true;
          }
        },
        error: (error: any) => {
          this.dadosEmpty = true;

          if (error.error.hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
      });
  }

  onAprovarGerente(dados) {
    dados.clicado = true;

    this.gestaoComissionamentosService
      .postAprovar(dados)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
          this.dadosLoaded = true;
          dados.clicado = false;
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.success === true) {
            dados.gerente = 'true';
            this.pnotifyService.success('Comissão aprovada com sucesso!');
          } else if (
            response.hasOwnProperty('success') &&
            response.success === false
          ) {
            this.dadosEmpty = true;
          } else {
            this.pnotifyService.error();
            this.dadosEmpty = true;
          }
        },
        error: (error: any) => {
          this.dadosEmpty = true;

          if (error.error.hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
      });
  }

  onReprovarGerente(dados) {
    dados.clicado = true;

    var formReprovar = {
      codComissaoRepresentante: dados.codComissaoRepresentante,
      descMotivo: this.formReprovar.value.descMotivo,
    };

    if (this.formReprovar.value.descMotivo == '') {
      this.pnotifyService.notice('Motivo da reprovação é obrigatório!');
      return;
    }

    this.gestaoComissionamentosService
      .postReprovar(formReprovar)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
          this.dadosLoaded = true;
          dados.clicado = false;
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.success === true) {
            dados.gerente = 'false';
            this.pnotifyService.success('Comissão reprovada com sucesso!');
          } else if (
            response.hasOwnProperty('success') &&
            response.success === false
          ) {
            this.dadosEmpty = true;
          } else {
            this.pnotifyService.error();
            this.dadosEmpty = true;
          }
        },
        error: (error: any) => {
          this.dadosEmpty = true;

          if (error.error.hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
      });
  }

  onAprovarDiretor(dados) {
    dados.clicado = true;

    this.gestaoComissionamentosService
      .postAprovar(dados)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
          this.dadosLoaded = true;
          dados.clicado = false;
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.success === true) {
            dados.diretor = 'true';
            this.pnotifyService.success('Comissão aprovada com sucesso!');
          } else if (
            response.hasOwnProperty('success') &&
            response.success === false
          ) {
            this.dadosEmpty = true;
          } else {
            this.pnotifyService.error();
            this.dadosEmpty = true;
          }
        },
        error: (error: any) => {
          this.dadosEmpty = true;

          if (error.error.hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
      });
  }

  onReprovarDiretor(dados) {
    dados.clicado = true;

    var formReprovar = {
      codComissaoRepresentante: dados.codComissaoRepresentante,
      descMotivo: this.formReprovar.value.descMotivo,
    };

    if (this.formReprovar.value.descMotivo == '') {
      this.pnotifyService.notice('Motivo da reprovação é obrigatório!');
      return;
    }

    this.gestaoComissionamentosService
      .postReprovar(formReprovar)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
          this.dadosLoaded = true;
          dados.clicado = false;
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.success === true) {
            dados.diretor = 'false';
            this.pnotifyService.success('Comissão reprovada com sucesso!');
          } else if (
            response.hasOwnProperty('success') &&
            response.success === false
          ) {
            this.dadosEmpty = true;
          } else {
            this.pnotifyService.error();
            this.dadosEmpty = true;
          }
        },
        error: (error: any) => {
          this.dadosEmpty = true;

          if (error.error.hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
      });
  }

  onNotasEscritorio() {
    this.notasEscritorio = !this.notasEscritorio;
  }

  onNotasRepresentante(dados) {
    this.loaderNavbar = true;
    dados.clicado = true;

    var notasRepresentante = {
      codComissaoRepresentante: dados.codComissaoRepresentante,
    };

    this.gestaoComissionamentosService
      .getSolicitaNfRepresentante(notasRepresentante)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
          this.dadosLoaded = true;
          dados.clicado = false;
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.success === true) {
            this.pnotifyService.success('Notas solicitadas com sucesso');
            dados.notasSolicitadas = 'true';
            this.onFilter();
          } else if (
            response.hasOwnProperty('success') &&
            response.success === false
          ) {
            this.dadosEmpty = true;
          } else {
            this.pnotifyService.error(
              'Erro ao solicitar notas, tente novamente.'
            );
            this.dadosEmpty = true;
          }
        },
        error: (error: any) => {
          this.dadosEmpty = true;

          if (error.error.hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error(
              'Erro ao solicitar notas, tente novamente.'
            );
          }
        }
      });
  }

  onEnviarNotas(dados, index) {
    if (dados.anexos) {
      if (dados.anexos.length == 0) {
        dados.anexos = this.arrayAnexos;
      }
    }
    this.onPostAnexos(dados.codComissaoRepresentante, dados, index);

  }

  // Outros
  onPageChanged(event: PageChangedEvent) {
    if (this.form.value.pagina != event.page) {
      this.detailPanelService.hide();
      this.form.value.pagina = event.page;
      this.onFilter();

      this.scrollToFilter.nativeElement.scrollIntoView({
        behavior: 'instant',
      });
    }
  }

  refreshMainData(grupo: any): void {
    for (let i = 0; i < this.dados.length; i++) {
      if (grupo.codRepresentantes === this.dados[i].codRepresentantes) {
        this.dados[i].codSituacao = grupo.codSituacao;
        return;
      }
    }
  }

  //modais
  openModalAnalista(analista: TemplateRef<any>) {
    this.modalRef = this.bsModalService.show(analista);
  }

  openModalGerente(gerente: TemplateRef<any>) {
    this.modalRef = this.bsModalService.show(gerente);
  }

  openModalDiretor(diretor: TemplateRef<any>) {
    this.modalRef = this.bsModalService.show(diretor);
  }

  openModalDetails(details: TemplateRef<any>) {
    this.modalRef = this.bsModalService.show(details);
  }

  openModalDetailsUnidades(detailsUnidades: TemplateRef<any>) {
    this.modalRef = this.bsModalService.show(detailsUnidades, {
      class: 'modal-xl',
    });
  }

  openModalDetailsRos(detailsRos: TemplateRef<any>) {
    this.modalRef = this.bsModalService.show(detailsRos, { class: 'modal-xl' });
  }

  openModalHistorico(historico: TemplateRef<any>) {
    this.modalRef = this.bsModalService.show(historico, { class: 'modal-xl' });
  }

  openModalValores(valores: TemplateRef<any>) {
    this.modalRef = this.bsModalService.show(valores);
  }

  openModalAjudaCustos(custos: TemplateRef<any>) {
    this.modalRef = this.bsModalService.show(custos);
  }

  closeModal(modalRef: TemplateRef<any>) {
    this.modalRef.hide();
  }

  // Tratamento de erros
  //  Erros form
  onFieldError(field: string) {
    if (this.onFieldInvalid(field)) {
      return 'is-invalid';
    }

    return '';
  }

  onFieldInvalid(field: any) {
    field = this.form.get(field);

    if (field.errors != null) {
      if (field.errors.hasOwnProperty('required') && field.touched) {
        return 'required';
      }
    }

    return '';
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

  // Erros formInputs
  onFieldErrorInputs(field: string) {
    if (this.onFieldInvalidInputs(field)) {
      return 'is-invalid';
    }

    return '';
  }

  onFieldInvalidInputs(field: any) {
    field = this.formInputs.get(field);

    if (field.errors != null) {
      if (field.errors.hasOwnProperty('required') && field.touched) {
        return 'required';
      }
    }

    return '';
  }

  onFieldRequiredInputs(field: string) {
    let required = false;
    let formControl = new FormControl();

    if (this.formInputs.controls[field].validator) {
      let validationResult =
        this.formInputs.controls[field].validator(formControl);
      required =
        validationResult !== null && validationResult.required === true;
    }

    if (required) {
      return 'is-required';
    }
  }

  // VALIDAÇÕES

  // VALIDA BARRA
  validaBarraAzul(dados) {
    let valida = false;
    if ((dados.salvo === undefined || dados.salvo === null || !dados.salvo) &&
    (dados.analista != 'true' && dados.analista != 'false') &&
    (dados.gerente != 'true' && dados.gerente != 'false') &&
    (dados.diretor != 'true' && dados.diretor != 'false') &&
    (dados.anexoEnviado != 'true' && dados.anexoEnviado != 'false') &&
    (dados.valoresEnviados != 'true' && dados.valoresEnviados != 'false')) {
        valida = true
    }
    return valida
  }

  validaBarraVerde(dados) {
    let valida = false;
    if (dados.salvo === 'true' ||
    dados.analista === 'true' ||
    dados.gerente === 'true' ||
    dados.diretor === 'true' ||
    dados.anexoEnviado === 'true' ||
    dados.valoresEnviados === 'true') {
        valida = true
    }
    return valida
  }

  validaBarraVermelha(dados) {
    let valida = false;
    if (dados.salvo === 'false' ||
    dados.analista === 'false' ||
    dados.gerente === 'false' ||
    dados.diretor === 'false') {
        valida = true
    }
    return valida
  }

  // VALIDA UNIDADE
  validaUnidade1(dados, item) {
    let valida = false;
    if ((!this.profile.analistaMarketing && item.codTipoPagamento != null && item.valorBase > 0) ||
    (this.profile.analistaMarketing && item.codTipoPagamento != null) && item.valorBase > 0) {
        valida = true
    }
    return valida
  }

  validaUnidadeRo(dados, item) {
    let valida = false;
    if ((!this.profile.analistaMarketing && item.codTipoPagamento != null) &&
    (item.valorBase == 0 && item.unidade == 'RO') ||
    (this.profile.analistaMarketing && item.codTipoPagamento != null) &&
    (item.valorBase == 0 && item.unidade == 'RO')) {
        valida = true
    }
    return valida
  }

  validaUnidade2(dados, item) {
    let valida = false;
    if ((!this.profile.analistaMarketing && item.codTipoPagamento != null) &&
    (item.valorBase == 0 && item.unidade != 'RO') ||
    (this.profile.analistaMarketing && item.codTipoPagamento != null) &&
    (item.valorBase == 0 && item.unidade != 'RO')) {
        valida = true
    }
    return valida
  }

  validaUnidadeInput(dados, item) {
    let valida = false;
    if (this.profile.analistaMarketing && item.codTipoPagamento == null) {
        valida = true
    }
    return valida
  }

  // VALOR BASE
  validaValorBase(dados, item) {
    let valida = false;
    if ((this.action == 'update' && item.codTipoPagamento != null && (item.nrRo == null || item.nrRo == 0) &&
    (item.valorAjudaCusto == 0 || item.valorAjudaCusto == undefined) && (item.valorDesconto == 0 || item.valorDesconto == undefined))
    ||
    (this.action == 'create' && item.codTipoPagamento != null && (item.nrRo == null || item.nrRo == 0) &&
    (item.valorAjudaCusto == 0 || item.valorAjudaCusto == undefined) && (item.valorDesconto == 0 || item.valorDesconto == undefined)) &&
    item.unidade != 'DBA' && item.unidade != 'PLANA AÇO') {
        valida = true
    }
    return valida
  }

  validaValorBaseVazio(dados, item) {
    let valida = false;
    if ((!this.profile.analistaMarketing && item.codTipoPagamento != null) &&
    (item.valorBase == 0 && (item.unidade != 'DBA' || item.unidade != 'PLANA AÇO')) ||
    (this.profile.analistaMarketing && item.codTipoPagamento != null) &&
    (item.valorBase == 0 && (item.unidade != 'DBA' && item.unidade != 'PLANA AÇO'))) {
        valida = true
    }
    return valida
  }

  validaValorBaseInput(dados, item) {
    let valida = false;
    if (this.action == 'create' && item.valorBase == 0 && item.valorDesconto == 0 && item.valorAjudaCusto == 0
    && (item.unidade != 'DBA' && item.unidade != 'PLANA AÇO')) {
        valida = true
    }
    return valida
  }

  validaValorBaseInputVazio(dados, item) {
    let valida = false;
    if (this.action == 'create' && ((item.unidade === 'DBA' && item.unidade === 'PLANA AÇO'))) {
        valida = true
    }
    return valida
  }

  validaValorBaseInputDba(dados, item) {
    let valida = false;
    if (this.action == 'create' && (item.unidade === 'DBA' &&
    item.unidade != 'PLANA AÇO' && this.action === 'create')) {
        valida = true
    }
    return valida
  }

  validaValorBaseInputAco(dados, item) {
    let valida = false;
    if (this.action == 'create' && (item.unidade != 'DBA' &&
    item.unidade === 'PLANA AÇO' && this.action === 'create')) {
        valida = true
    }
    return valida
  }

  // VALOR DESCONTO
  validaDesconto(dados, item) {
    let valida = false;
    if ((this.action == 'update' && item.valorDesconto < 0) ||
    (this.action == 'create' && item.valorBase == 0 &&
    (item.valorDesconto > 0 && item.unidade != 'RO'))) {
        valida = true
    }
    return valida
  }

  validaDescontoVazio(dados, item) {
    let valida = false;
    if ((!this.profile.analistaMarketing && item.valorBase > 0 && (item.unidade != 'DBA' || item.unidade != 'PLANA AÇO')) ||
    (this.profile.analistaMarketing && item.valorBase > 0) ||
   (item.valorDesconto == 0 && item.valorAjudaCusto > 0) ||
   (item.unidade === 'DBA' || item.unidade === 'PLANA AÇO')) {
        valida = true
    }
    return valida
  }

  validaDescontoInput(dados, item) {
    let valida = false;
    if (this.action == 'create' && item.valorBase == 0 && (item.valorAjudaCusto == 0 || item.valorAjudaCusto == undefined) &&
    (item.nrRo > 0 ) &&
    (item.unidade != 'DBA' && item.unidade != 'PLANA AÇO')) {
        valida = true
    }
    return valida
  }

  // VALIDA AJUDA CUSTO

  // this.action == 'create' && item.valorBase == 0 &&
  //   item.valorDesconto == 0 && (item.unidade != 'DBA' && item.unidade != 'PLANA AÇO') &&
  //   (item.nrRo == null || (item.valorAjudaCusto > 0))

  validaAjudaCusto(dados, item) {
    let valida = false;
    if (item.valorAjudaCusto > 0) {
        valida = true
    }
    return valida
  }

  validaAjudaCustoVazio(dados, item) {
    let valida = false;
    if ((!this.profile.analistaMarketing && item.valorBase > 0) ||
    (this.profile.analistaMarketing && item.valorBase > 0) ||
    (this.profile.analistaMarketing && item.nrRo > 0) ||
    ((item.valorDesconto < 0 && this.action == 'update') && item.valorAjudaCusto == 0) ||
    (item.valorDesconto > 0 && this.action == 'create') ||
    ((item.unidade === 'DBA' || item.unidade === 'PLANA AÇO') && item.valorBase == 0)) {
        valida = true
    }
    return valida
  }

  // validaAjudaCustoInput(dados, item) {
  //   let valida = false;
  //   if (
  //     (item.unidade == 'DBA' || item.unidade == 'PLANA AÇO') &&
  //     this.action == 'update') {
  //       valida = true
  //   }
  //   return valida
  // }

  validaPercentual(dados, item) {
    let valida = false;
    if (
      (item.unidade == 'DBA' || item.unidade == 'PLANA AÇO') &&
      this.action == 'update') {
        valida = true
    }
    return valida
  }

  validaPercentualVazio(dados, item) {
    let valida = false;
    if (item.valorBase > 0 && (item.unidade != 'DBA' && item.unidade != 'PLANA AÇO') ||
    (item.valorDesconto < 0 && this.action == 'update') || item.valorAjudaCusto > 0 ||
    (item.valorDesconto > 0 && this.action == 'create') ||
    item.unidade === 'RO') {
        valida = true
    }
    return valida
  }

  validaPercentualInput(dados, item) {
    let valida = false;
    if (this.action == 'create' && item.valorBase == 0 && item.valorDesconto == 0 && item.valorAjudaCusto == 0
    && (item.unidade != 'DBA' && item.unidade != 'PLANA AÇO')) {
        valida = true
    }
    return valida
  }

  validaPercentualInputVazio(dados, item) {
    let valida = false;
    if (this.action == 'create' && (item.unidade === 'DBA' || item.unidade === 'PLANA AÇO')) {
        valida = true
    }
    return valida
  }

  // VALIDA BUTTON CALCULAR
  validaButtonCalcular(dados, item) {
    let valida = false;
    if (item.unidade == 'DBA' || item.unidade == 'PLANA AÇO' || item.unidade === 'RO' ||
    (item.valorDesconto < 0 && this.action == 'update')  ) {
        valida = true
    }
    return valida
  }

  validaButtonCalcularVazio(dados, item) {
    let valida = false;
    if (((item.valorBase == 0 && item.unidade != 'RO') ||
    (item.valorBase > 0 && item.valorAjudaCusto == 0) ||
    (item.valorBase > 0 && item.valorDesconto == 0)) &&
    item.unidade != 'DBA' && item.unidade != 'PLANA AÇO' &&
    this.action === 'create') {
        valida = true
    }
    return valida
  }

  // VALIDA BUTTON DELETAR
  validaButtonDelete(dados, item) {
    let valida = false;
    if ((this.action == 'create'  && item.valorBase == 0 &&
    (item.unidade != 'DBA' && item.unidade != 'PLANA AÇO')) && item.unidade != 'RO') {
        valida = true
    }
    return valida
  }

  // VALIDA DADOS SALVO
  validaDadosSalvo(dados) {
    let valida = false;
    if (this.visualizar && dados.salvo === undefined ||
      dados.salvo === null || !dados.salvo) {
        valida = true
    }
    return valida
  }

  // removerPorId(array, id) {
  //   var result = array.filter(function(el) {
  //     return el.id == id;
  //   });

  //   for(var elemento of result){
  //     var index = array.indexOf(elemento);

  //     // this.assocValores.removeAt(index);
  //     // array.splice(index, 1);
  //   }
  // }
}
