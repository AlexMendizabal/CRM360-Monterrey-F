import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Subscription, EMPTY, Observable } from 'rxjs';
import { take, switchMap, finalize } from 'rxjs/operators';

// ngx-bootstrap
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { ptBrLocale } from 'ngx-bootstrap/locale';

defineLocale('pt-br', ptBrLocale);

// Services
import { XlsxService } from 'src/app/shared/modules/xlsx/xlsx.service';
import { TecnologiaInformacaoControleLinhaService } from '../controle-linhas.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { DetailPanelService } from 'src/app/shared/templates/detail-panel/detal-panel.service';
import { DateService } from 'src/app/shared/services/core/date.service';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';

// Interfaces
import { ControleLinha } from '../models/controle-linha';
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';

@Component({
  selector: 'tecnologia-informacao-controle-linhas-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class TecnologiaInformacaoControleLinhaListaComponent implements OnInit {
  @ViewChild('scrollToFilter', {}) scrollToFilter: ElementRef;

  loaderNavbar = false;

  breadCrumbTree = [
    {
      descricao: 'Home',
      routerLink: '/tecnologia-informacao/home',
    },
    {
      descricao: 'Controle de Linhas',
    },
  ];

  subtitles: Array<Subtitles> = [
    {
      id: 1,
      text: 'Trabalhando',
      color: 'green',
    },
    {
      id: 2,
      text: 'Demitido',
      color: 'red',
    },
    {
      id: 3,
      text: 'Outro',
      color: 'yellow',
    },
  ];

  bsConfig: Partial<BsDatepickerConfig>;

  activatedRouteSubscription: Subscription;

  showDetailPanelSubscription: Subscription;
  showDetailPanel = false;

  tableConfig: Partial<CustomTableConfig> = { subtitleBorder: true };
  form: FormGroup;
  orderBy = 'nomeUsuario';
  orderType = 'ASC';
  compararData = null;
  situacoes = [];
  loadingSituacoes = true;
  maxSize = 10;
  itemsPerPage = 25;
  currentPage = 1;
  totalItems: any = [];

  dados: Array<ControleLinha> = [];
  dadosPagination: Array<ControleLinha> = [];
  dadosLoaded = false;
  dadosEmpty = false;

  linhaSelecionado: ControleLinha;

  constructor(
    private localeService: BsLocaleService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private xlsxService: XlsxService,
    private controleLinhasService: TecnologiaInformacaoControleLinhaService,
    private pnotifyService: PNotifyService,
    private atividadesService: AtividadesService,
    private titleService: TitleService,
    private confirmModalService: ConfirmModalService,
    private detailPanelService: DetailPanelService,
    private dateService: DateService
  ) {
    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );
    this.pnotifyService.getPNotify();
  }

  ngOnInit(): void {
    this.setFormFilter();
    this.getFuncionariosSituacoes();
    this.titleService.setTitle('Controle de linhas');
    this.onDetailPanelEmitter();
    this.setLinhaSelecionado();
  }

  setFormFilter(): void {
    const formValue: any = this.checkRouterParams();

    this.form = this.formBuilder.group({
      numLinha: [formValue.numLinha],
      descricao: [formValue.descricao],
      nomeUsuario: [formValue.nomeUsuario],
      codEscritorio: [formValue.nomeUsuario],
      codEmpresa: [formValue.nomeUsuario],
      dsSituacao: [formValue.dsSituacao],
      nomeEmpresa: [formValue.nomeEmpresa],
      nomeEscritorio: [formValue.nomeEscritorio],
      codSituacao: [formValue.codSituacao],
      numContrato: [formValue.numContrato],
      dataVencimentoInicial: [formValue.dataVencimentoInicial],
      dataVencimentoFinal: [formValue.dataVencimentoFinal],
      orderBy: [formValue.orderBy],
      orderType: [formValue.orderType],
      pagina: [formValue.pagina],
      registros: [formValue.registros, Validators.required],
    });

    this.checkOrder();
  }

  checkRouterParams(): Object {
    let formValue = {
      numLinha: null,
      matricula: null,
      descricao: null,
      nomeUsuario: null,
      nomeEmpresa: null,
      codEscritorio: null,
      nomeEscritorio: null,
      codSituacao: 1,
      dsSituacao: null,
      numContrato: null,
      dataContratoInicial: null,
      dataContratoFinal: null,
      orderBy: this.orderBy,
      orderType: this.orderType,
      pagina: 1,
      registros: this.itemsPerPage,
    };

    this.activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
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
                if (formKey === 'dataVencimentoContrato') {
                  formValue[formKey] = this.dateService.convertStringToDate(
                    params[paramKey],
                    'pt-br'
                  );
                } else {
                  if (!isNaN(Number(params[paramKey]))) {
                    formValue[formKey] = Number(params[paramKey]);
                  } else {
                    formValue[formKey] = params[paramKey];
                  }
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

  onDetailPanelEmitter(): void {
    this.showDetailPanelSubscription = this.detailPanelService.config.subscribe(
      (event: any) => {
        this.showDetailPanel = event.showing;
      }
    );
  }

  checkOrder(): void {
    if (this.form.value.orderBy !== this.orderBy) {
      this.orderBy = this.form.value.orderBy;
    }

    if (this.form.value.orderType !== this.orderType) {
      this.orderType = this.form.value.orderType;
    }
  }

  setLinhaSelecionado(): void {
    this.linhaSelecionado = {
      codLinha: -1,
      matricula: null,
      numLinha: null,
      descricao: null,
      codEscritorio: null,
      nomeEscritorio: null,
      codEmpresa: null,
      nomeEmpresa: null,
      codSituacao: null,
      dsSituacao: null,
      valor: null,
      numContrato: null,
      dataVencimentoContrato: null,
      codUsuario: null,
      nomeUsuario: null,
      dataCadastro: null,
      plano: null,
      gestorFun: null,
      dados: null,
      conta: null,
      codChip: null,
      numConta: null,
      senha: null,
      status: '1',
      documento: null,
      qtDocumentos: null,
    };
  }

  onExport(): void {
    let data = new Date().toLocaleDateString().split('/'),
      dataExport = `${data[0]}${data[1]}${data[2]}`;

    let listagemExport: any = [];

    listagemExport = this.dados.concat(this.totalItems);

    this.xlsxService.exportFile(listagemExport, `ControleLinhas_${dataExport}`);
  }
  onFieldError(field: string): string {
    if (this.onFieldInvalid(field)) {
      return 'is-invalid';
    }

    return '';
  }

  onFieldInvalid(field: any): boolean {
    field = this.form.get(field);

    return field.status == 'INVALID' && field.touched;
  }

  onFieldRequired(
    abstractControl: AbstractControl,
    abstractControlField?: string
  ): string {
    if (abstractControl.validator) {
      const validator = abstractControl.validator({} as AbstractControl);
      if (validator && validator.required) {
        return 'is-required';
      }
    }

    if (abstractControlField) {
      for (const controlName in abstractControl['controls']) {
        if (abstractControl['controls'][controlName]) {
          if (
            this.onFieldRequired(abstractControl['controls'][controlName]) &&
            controlName == abstractControlField
          ) {
            return 'is-required';
          }
        }
      }
    }

    return '';
  }

  setOrderBy(column: string): void {
    if (this.orderBy === column) {
      if (this.orderType == 'DESC') {
        this.orderType = 'ASC';
      } else if (this.orderType == 'ASC') {
        this.orderType = 'DESC';
      }
    } else {
      this.orderBy = column;
      this.orderType = 'ASC';
    }

    this.form.value.orderBy = this.orderBy;
    this.form.value.orderType = this.orderType;

    this.onFilter();
  }

  comparaData() {
    if (!this.form.get('dataVencimentoFinal').value) {
      return false;
    } else if (
      this.form.get('dataVencimentoInicial').value >
      this.form.get('dataVencimentoFinal').value
    ) {
      this.compararData = true;
      return this.compararData;
    }
  }

  onFilter(): void {
    if (this.form.valid) {
      this.itemsPerPage = this.form.value.registros;
      this.currentPage = 1;
      this.setRouterParams(this.verificaParams());
    }
  }

  setRouterParams(params: any): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { q: btoa(JSON.stringify(params)) },
    });
    this.search(params);
  }

  verificaParams(): Object {
    let params: any = {};

    if (this.form.value.codSituacao) {
      params.codSituacao = this.form.value.codSituacao;
    }

    if (this.form.value.nomeUsuario) {
      params.nomeUsuario = this.form.value.nomeUsuario;
    }

    if (this.form.value.numLinha) {
      params.numLinha = this.form.value.numLinha;
    }
    if (this.form.value.descricao) {
      params.descricao = this.form.value.descricao;
    }

    if (this.form.value.numContrato) {
      params.numContrato = this.form.value.numContrato;
    }

    if (this.form.value.nomeEmpresa) {
      params.nomeEmpresa = this.form.value.nomeEmpresa;
    }
    if (this.form.value.nomeEscritorio) {
      params.nomeEscritorio = this.form.value.nomeEscritorio;
    }

    if (this.form.value.dataVencimentoInicial) {
      params.dataVencimentoInicial = this.dateService.convertToUrlDate(
        this.form.value.dataVencimentoInicial
      );
    }

    if (this.form.value.dataVencimentoFinal) {
      params.dataVencimentoFinal = this.dateService.convertToUrlDate(
        this.form.value.dataVencimentoFinal
      );
    }

    params.orderBy = this.form.value.orderBy;
    params.orderType = this.form.value.orderType;

    return params;
  }

  search(params: any): void {
    this.loaderNavbar = true;
    this.dados = [];
    this.dadosPagination = [];
    this.dadosLoaded = false;
    this.dadosEmpty = false;

    this.controleLinhasService
      .getListaLinhas(params)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
          this.dadosLoaded = true;
        })
      )
      .subscribe(
        (response: any) => {
          if (response.hasOwnProperty('success') && response.success === true) {
            this.dados = response.data;
            this.dadosPagination = this.dados.slice(0, this.itemsPerPage);
            this.totalItems = this.dados.length;
            this.dadosLoaded = true;
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
        (error: any) => {
          this.dadosEmpty = true;

          if (error.error.hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
      );
  }

  classStatusBorder(linha: ControleLinha): string {
    let borderClass: string;

    if (linha.codSituacao == 1) {
      borderClass = 'border-success';
    } else if (linha.codSituacao == 7) {
      borderClass = 'border-danger';
    } else if ((linha.codSituacao /= 7)) {
      borderClass = 'border-warning';
    }

    return borderClass;
  }

  onPageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.dadosPagination = this.dados.slice(startItem, endItem);

    this.scrollToFilter.nativeElement.scrollIntoView({
      behavior: 'instant',
    });
  }

  onDetails(linha: ControleLinha): void {
    this.loaderNavbar = true;
    this.detailPanelService.show();
    this.linhaSelecionado = linha;
    this.setLinhaSelecionado();
    this.detailPanelService.loadedFinished(false);

    setTimeout(() => {
      this.loaderNavbar = false;
    }, 500);
  }

  onEdit(linha: ControleLinha): void {
    this.router.navigate(['../editar', linha.matricula], {
      relativeTo: this.activatedRoute,
    });
  }

  onTermo(linha: ControleLinha): void {
    this.router.navigate(['../termo', linha.matricula], {
      relativeTo: this.activatedRoute,
    });
  }

  onDelete(linha: ControleLinha): void {
    this.confirmDelete()
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) =>
          result ? this.deleteLinha(linha.matricula) : EMPTY
        ),
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe(
        (success: any) => {
          this.pnotifyService.success();
          setTimeout(() => {
            this.onFilter();
          }, 500);
        },
        (error: any) => {
          console.log(error);
          this.pnotifyService.error();
        }
      );
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

  deleteLinha(matricula: number): Observable<any> {
    this.loaderNavbar = true;

    let controleLinha = {
      matricula: matricula,
      status: '0',
    };

    return this.controleLinhasService.save(controleLinha as ControleLinha);
  }

  getFuncionariosSituacoes() {
    this.controleLinhasService
      .getFuncionariosSituacoes()
      .pipe(finalize(() => (this.loadingSituacoes = false)))
      .subscribe((response) => {
        this.situacoes = response['data'];
      });
  }
}
