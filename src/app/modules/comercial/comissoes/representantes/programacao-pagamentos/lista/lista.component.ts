import { ComercialComissoesGestaoComissionamentosService } from './../../gestao-comissionamentos/gestao-comissionamentos.service';
import { Subtitles } from './../../../../../../shared/modules/subtitles/subtitles';
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
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

// ngx-bootstrap
import { defineLocale } from 'ngx-bootstrap/chronos';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ptBrLocale } from 'ngx-bootstrap/locale';

defineLocale('pt-br', ptBrLocale);

// Services
import { AtividadesService } from './../../../../../../shared/services/requests/atividades.service';
import { ConfirmModalService } from './../../../../../../shared/modules/confirm-modal/confirm-modal.service';
import { PNotifyService } from './../../../../../../shared/services/core/pnotify.service';
import { ComercialComissoesRepresentantesProgramacaoPagamentosService } from './../programacao-pagamentos.service';
import { DetailPanelService } from './../../../../../../shared/templates/detail-panel/detal-panel.service';
import { DateService } from './../../../../../../shared/services/core/date.service';
import { ComercialCadastrosEscritorioService } from './../../../../cadastros/escritorios/escritorios.service';
import { ComercialService } from './../../../../comercial.service';

// Interfaces
import { CustomTableConfig } from './../../../../../../shared/templates/custom-table/models/config';
import { Breadcrumb } from './../../../../../../shared/modules/breadcrumb/breadcrumb';
import { dadosBancarios, representantes } from './../models/representantes';
import { JsonResponse } from './../../../../../../models/json-response';

@Component({
  selector: 'comercial-representantes-programacao-pagamentos-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class ComercialComissoesRepresentantesProgramacaoPagamentosListaComponent
  implements OnInit
{
  @ViewChild('scrollToFilter', {}) scrollToFilter: ElementRef;

  loaderNavbar = false;
  loaderFullScreen = true;

  breadCrumbTree: Array<Breadcrumb>;

  subtitles: Array<Subtitles> = [
    {
      id: 1,
      text: 'Aguardando Programação de Pagamento',
      color: 'gray',
    },
    {
      id: 0,
      text: 'Aguardando Pagamento',
      color: 'blue',
    },
    {
      id: 2,
      text: 'Pagamento Realizado',
      color: 'green',
    },
  ];

  showDetailPanelSubscription: Subscription;
  showDetailPanel = false;
  detailPanelTitle: string;
  nomeRepresentante: string;

  dados: any[] = [];
  representantes: any[] = [];
  representantesDetail: any[] = [];
  representanteSelecionado: any[] = [];
  escritorios: any[] = [];
  situacao: any[] = [];

  codigo: number;

  dadosLoaded = false;
  dadosEmpty = false;
  programado = false;

  bsValue = new Date();
  bsRangeValue: Date[];
  maxDate = new Date();
  minDate = new Date();

  modalRef: BsModalRef;

  grupoSelecionado: any;

  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
  };

  tableConfigMateriais: Partial<CustomTableConfig> = {
    hover: false,
  };

  activatedRouteSubscription: Subscription;

  form: FormGroup;
  formDate: FormGroup;

  bsConfig: Partial<BsDatepickerConfig>;

  maxSize = 10;
  itemsPerPage = 300;
  currentPage = 1;
  totalItems = 0;

  constructor(
    private formBuilder: FormBuilder,
    private activateRoute: ActivatedRoute,
    private localeService: BsLocaleService,
    private dateService: DateService,
    private router: Router,
    private detailPanelService: DetailPanelService,
    private pnotifyService: PNotifyService,
    private programacaoPagamentosService: ComercialComissoesRepresentantesProgramacaoPagamentosService,
    private atividadesService: AtividadesService,
    private bsModalService: BsModalService,
    private confirmModalService: ConfirmModalService,
    private modalService: BsModalService,
    private comercialService: ComercialService,
    private escritoriosService: ComercialCadastrosEscritorioService,
    private gestaoComissionamentosService: ComercialComissoesGestaoComissionamentosService
  ) {
    this.localeService.use('pt-br');
  }

  ngOnInit(): void {
    this.setFormFilter();
    // this.getRegistros();
    this.setBreadCrumb();
    this.registrarAcesso();
    this.onDetailPanelEmitter();
    this.getEscritorios();
    this.getSituacao();
    this.getRepresentantes();
  }

  setBreadCrumb(): void {
    this.activateRoute.params.subscribe((params: any) => {
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
      ];
    });
  }

  // form
  setFormFilter(): void {
    const formValue: any = this.checkRouterParams();

    this.form = this.formBuilder.group({
      // dtInicioVigencia: [this.dateService.getFirstDayMonth()],
      // dtFimVigencia: [this.dateService.getLastDayMonth()],
      // codEscritorio: [formValue.codEscritorio],
      codRepresentante: [formValue.codRepresentante],
      codStatus: [formValue.codStatus],
      registros: [formValue.registros],
    });

    // this.checkOrder();
  }

  // formDate
  setFormDate(item): void {
    this.nomeRepresentante = item.nomeRepresentante;
    this.codigo = item.codRepresentante;
    this.formDate = this.formBuilder.group({
      codComissaoRepresentante: [item.codComissaoRepresentante],
      dataProgramacao: '',
      dataPagamento: new Date(),
    });
  }

  onSubmitProgramacao() {
    if (this.formDate.valid) {
      // validação salvar
    }

    this.programacaoPagamentosService
      .postProgramacaoPagamento(this.formDate.getRawValue())
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
          this.nomeRepresentante = '';
        })
      )
      .subscribe((response: any) => {
        if (response.hasOwnProperty('success') && response.success === true) {
          this.onFilter();

          this.pnotifyService.success();
        }
      });
  }

  onSubmitPagamento(item?) {
    this.confirmModalService
      .showConfirm(
        null,
        'Baixa de Pagamento',
        `Você está prestes a dar baixa no pagamento do representante ${item.nomeRepresentante}. Deseja continuar mesmo assim?`,
        'Cancelar',
        'Confirmar'
      )
      .subscribe((response: boolean) =>
        response ? this.onPostPagamento() : null
      );
  }

  onPostPagamento() {
    this.programacaoPagamentosService
      .postPagamento(this.formDate.getRawValue())
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe((response: any) => {
        if (response.success === true) {
          this.pnotifyService.success('Baixa efetuada com sucesso');
          this.onFilter();
        } else {
          this.pnotifyService.error(response.mensagem);
        }
      });
  }

  registrarAcesso() {
    this.atividadesService.registrarAcesso().subscribe();
  }

  navigateCadastroRepresentantes(item?) {
    // ${item.codRepresentante}
    this.router.navigate([`/comercial/cadastros/99/representantes/editar/839`], {
      relativeTo: this.activateRoute
    });
  }

  classStatusBorder(item: any): string {
    let borderClass: string;

    if (item.codSituacao === 7) {
      borderClass = 'border-secondary';
    } else if (item.codSituacao === 8) {
      borderClass = 'border-primary';
    } else if (item.codSituacao === 9) {
      borderClass = 'border-success';
    }

    return borderClass;
  }

  checkRouterParams(): Object {
    let formValue = {
      codRepresentante: 0,
      // dtInicioVigencia: [this.dateService.getFirstDayMonth()],
      // dtFimVigencia: [this.dateService.getLastDayMonth()],
      // codEscritorio: 0,
      codStatus: 0,
      registros: this.itemsPerPage,
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

  getEscritorios() {
    this.escritoriosService
      .getListaEscritorios({ tipo: 'faturamento' })
      .subscribe({
        next: (response: any) => {
          if (response.success === true) {
            this.escritorios = response.data;

            this.escritorios.unshift({
              codEscritorio: 0,
              nomeEscritorio: 'EXIBIR TODOS',
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

  getRepresentantes() {
    this.gestaoComissionamentosService
      .getRepresentantes(0)
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.success === true) {
            this.representantes = response.data;

            this.representantes.unshift({
              codRepresentante: 0,
              nomeRepresentante: 'EXIBIR TODOS',
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

  getSituacao() {
    this.programacaoPagamentosService.getSituacao().subscribe(
      (response: any) => {
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
      (error: any) => {
        this.pnotifyService.error();
      }
    );
  }

  closeModal(modalRef: TemplateRef<any>) {
    this.modalRef.hide();
  }

  // Pesquisa
  onFilter(): void {
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

    this.programacaoPagamentosService
      .getListaProgramacao(params)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
          this.dadosLoaded = true;
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.hasOwnProperty('success') && response.success === true) {
            this.dados = response.data;
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

  // Verifica Parâmetros
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

    if (this.form.value.dtInicioVigencia) {
      params.dtInicioVigencia = this.form.value.dtInicioVigencia;
    }

    if (this.form.value.dtFimVigencia) {
      params.dtFimVigencia = this.form.value.dtFimVigencia;
    }

    if (this.form.value.codStatus) {
      params.codStatus = this.form.value.codStatus;
    }

    params.pagina = this.form.value.pagina;
    params.registros = this.form.value.registros;
    params.orderBy = this.form.value.orderBy;
    params.orderType = this.form.value.orderType;

    return params;
  }

  //Detail Panel

  onDetails(item): void {
    this.detailPanelService.show();
    this.detailPanelTitle = `Dados Bancários`;
    this.setDadosBancarios();
    this.grupoSelecionado = item;
    this.representantesDetail = [];
    this.loaderNavbar = true;
    this.codigo = item.codRepresentante;

    this.programacaoPagamentosService
      .getAssociacoesDetails(item.codRepresentanteTid)
      .pipe(
        finalize(() => {
          setTimeout(() => {
            this.loaderNavbar = false;
            this.detailPanelService.loadedFinished(false);
          }, 500);
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.hasOwnProperty('success') && response.success === true) {
            this.representantesDetail = response.data;
            // this.totalItems = this.dados[0]['total'];
          } else {
            this.pnotifyService.error();
          }
        },
        error: (error: any) => {
          if (error.error.hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
      });
  }

  setDadosBancarios(): void {
    this.grupoSelecionado = {
      codProgramacao: null,
      bancoRepresentante: null,
      tipoConta: null,
      agencia: null,
      titular: null,
      contaCorrente: null,
    };
  }

  onDetailPanelEmitter(): void {
    this.showDetailPanelSubscription = this.detailPanelService.config.subscribe(
      (event: any) => {
        this.showDetailPanel = event.showing;
      }
    );
  }

  // Get e EditarLista
  getRegistros() {
    this.loaderNavbar = true;
    this.detailPanelService.hide();
    this.dadosLoaded = false;
    this.dadosEmpty = false;

    this.programacaoPagamentosService
      .getListaProgramacao()
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
          this.dadosLoaded = true;
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.hasOwnProperty('success') && response.success === true) {
            this.dados = response.data;

            this.totalItems = this.dados[0]['total'];
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

  onEdit(item: any): void {
    this.router.navigate(['../editar', item.codPreco], {
      relativeTo: this.activateRoute,
    });
  }

  // Outros
  onPageChanged(event: PageChangedEvent) {
    if (this.form.value.pagina != event.page) {
      this.detailPanelService.hide();
      // this.setGrupoSelecionado();
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

  //modal
  openModal(template: TemplateRef<any>, index) {
    this.modalRef = this.bsModalService.show(template, index);
  }

  // Tratamento de erros
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
}
