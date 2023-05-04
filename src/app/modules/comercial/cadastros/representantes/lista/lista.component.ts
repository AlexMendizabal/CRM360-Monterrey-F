import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Subscription, EMPTY, Observable } from 'rxjs';
import { finalize, take, switchMap } from 'rxjs/operators';

// ngx-bootstrap
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import {  PageChangedEvent } from 'ngx-bootstrap/pagination';
import { ptBrLocale } from 'ngx-bootstrap/locale';

defineLocale('pt-br', ptBrLocale);



// Services
import { PNotifyService } from './../../../../../shared/services/core/pnotify.service';
import { ConfirmModalService } from './../../../../../shared/modules/confirm-modal/confirm-modal.service';
import { AtividadesService } from './../../../../../shared/services/requests/atividades.service';
import { DetailPanelService } from './../../../../../shared/templates/detail-panel/detal-panel.service';
import { DateService } from './../../../../../shared/services/core/date.service';
import { ComercialCadastrosRepresentantesService } from './../representantes.service';

// Interfaces
import { JsonResponse } from './../../../../../models/json-response';
import { CustomTableConfig } from './../../../../../shared/templates/custom-table/models/config';
import { Breadcrumb } from './../../../../../shared/modules/breadcrumb/breadcrumb';

@Component({
  selector: 'comercial-representantes-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class ComercialCadastrosRepresentantesListaComponent implements OnInit {
  @ViewChild('scrollToFilter', {}) scrollToFilter: ElementRef;

  loaderNavbar = false;
  loaderFullScreen = true;


  breadCrumbTree: Array<Breadcrumb> = [
    {
      descricao: 'Home',
      routerLink: '/comercial/',
    },
    {
      descricao: 'Cadastros',
      routerLink: `/comercial/cadastros/99`,
    },
    {
      descricao: 'Representantes',
      routerLink: '/comercial/cadastros/99/representantes/lista',
    },
  ];

  showDetailPanelSubscription: Subscription;
  showDetailPanel = false;
  detailPanelTitle: string;

  dados: any[] = [];
  dadosPagination: Array<any> = [];
  modeloComissao: any[] = [];

  dadosLoaded = false;
  dadosEmpty = false;

  grupoSelecionado: any;

  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
  };

  tableConfigMateriais: Partial<CustomTableConfig> = {
    hover: false,
  };

  activatedRouteSubscription: Subscription;

  form: FormGroup;
  orderBy = 'NM_VEND';
  orderType = 'ASC';

  bsConfig: Partial<BsDatepickerConfig>;

  maxSize = 10;
  itemsPerPage = 300;
  currentPage = 1;
  totalItems = 0;


  constructor(private formBuilder: FormBuilder,
    private activateRoute: ActivatedRoute,
    private localeService: BsLocaleService,
    private dateService: DateService,
    private router: Router,
    private detailPanelService: DetailPanelService,
    private pnotifyService: PNotifyService,
    private cadastroRepresentantesService: ComercialCadastrosRepresentantesService,
    private confirmModalService: ConfirmModalService,
    private atividadesService: AtividadesService,
  ) {
    this.localeService.use('pt-br');
  }

  ngOnInit(): void {
    this.setFormFilter();
    // this.getRegistros();
    this.registrarAcesso();
    this.onDetailPanelEmitter();
  }


// Formulário
  setFormFilter(): void {
    const formValue: any = this.checkRouterParams();

    this.form = this.formBuilder.group({
      codRepresentante: [formValue.codRepresentante],
      nome: [formValue.nome],
      codSituacao: [formValue.codSituacao],
      emiteNota: [formValue.emiteNota],
      pagina: [formValue.pagina],
      registros: [formValue.registros, Validators.required],
    });

    // this.checkOrder();
  }

  registrarAcesso() {
    this.atividadesService.registrarAcesso().subscribe();
  }

  checkRouterParams(): Object {
    let formValue = {
      codRepresentante: null,
      nome: null,
      codSituacao: '',
      emiteNota: '',
      pagina: 1,
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

// Ordem lista
  checkOrder(): void {
    if (this.form.value.orderBy !== this.orderBy) {
      this.orderBy = this.form.value.orderBy;
    }

    if (this.form.value.orderType !== this.orderType) {
      this.orderType = this.form.value.orderType;
    }
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
    this.dadosPagination = [];
    this.dadosLoaded = false;
    this.dadosEmpty = false;
    this.totalItems = 0;

    this.cadastroRepresentantesService
      .getListaRepresentantes(params)
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
            this.dadosPagination = this.dados.slice(0, this.itemsPerPage);
            this.totalItems = this.dados.length;
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
    _params['orderBy'] = this.orderBy;    _params['orderType'] = this.orderType;
    return _params;  }

  verificaParams(): Object {
    let params: any = {};

    if (this.form.value.codRepresentante) {
      params.codRepresentante = this.form.value.codERP;
    }

    if (this.form.value.nome) {
      params.nome = this.form.value.nome;
    }

    if (this.form.value.codSituacao) {
      params.codSituacao = this.form.value.codSituacao;
    }

    params.pagina = this.form.value.pagina;
    params.registros = this.form.value.registros;
    params.orderBy = this.form.value.orderBy;
    params.orderType = this.form.value.orderType;

    return params;
  }


  // Detail Panel
  onDetails(item: any): void {
    this.detailPanelService.show();
    this.detailPanelTitle = `${item.tipoComissao}`;
    this.setDetalhesRepresentante();
    this.grupoSelecionado = item;
    this.modeloComissao = [];
    this.loaderNavbar = true;

    this.cadastroRepresentantesService
      .getTipoComissionamento()
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
            this.modeloComissao = response.data;
            this.totalItems = this.dados[0]['total'];
          }  else {
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

  setDetalhesRepresentante(): void {
    this.grupoSelecionado = {
      codVendedor: null,
      de: null,
      ate: null,
      valorComissao: null,
      valorFixo: null
    };
  }

  onDetailPanelEmitter(): void {
    this.showDetailPanelSubscription = this.detailPanelService.config.subscribe(
      (event: any) => {
        this.showDetailPanel = event.showing;
      }
    );
  }


  // Activate e Inactivate e borda Situação
  onActivate(index: number, data: any): void {
    this.confirmActivate()
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) =>
          result ? this.activateERP(index, data) : EMPTY
        ),
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe(
        (success: any) => {
          this.pnotifyService.success();
          this.refreshMainData(data);
        },
        (error: any) => {
          this.pnotifyService.error();
          this.dadosPagination[index].codSituacao = 0;
        }
      );
  }

  confirmActivate(): any {
    return this.confirmModalService.showConfirm(
      null,
      null,
      'Deseja realmente prosseguir com a ativação do registro?',
      'Cancelar',
      'Confirmar'
    );
  }

  activateERP(index: number, data: any): Observable<any> {
    this.loaderNavbar = true;
    this.dados[index].codSituacao = 1;

    return this.cadastroRepresentantesService.activateERP(data.codRepresentante);
  }

  onInactivate(index: number, data: any): void {
    this.confirmInactive()
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) =>
          result ? this.inactivateERP(index, data) : EMPTY
        ),
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe(
        (success: any) => {
          this.pnotifyService.success();
          this.refreshMainData(data);
        },
        (error: any) => {
          this.pnotifyService.error();
          this.dadosPagination[index].codSituacao = 1;
        }
      );
  }

  confirmInactive(): any {
    return this.confirmModalService.showConfirm(
      'inactivate',
      'Confirmar inativação',
      'Deseja realmente prosseguir com a inativação do registro?',
      'Cancelar',
      'Confirmar'
    );
  }

  inactivateERP(index: number, data: any): Observable<any> {
    this.loaderNavbar = true;
    this.dadosPagination[index].codSituacao = 0;

    return this.cadastroRepresentantesService.inactivateERP(data.codRepresentante);
  }

  classStatusBorder(data: any): string {
    let borderClass: string;

    if (data.codSituacao === 2) {
      borderClass = 'border-danger';
    } else if (data.codSituacao === 1) {
      borderClass = 'border-success';
    }

    return borderClass;
  }


// Get e EditarLista
  getRegistros() {
    this.loaderNavbar = true;
    this.detailPanelService.hide();
    this.dadosLoaded = false;
    this.dadosEmpty = false;

    this.cadastroRepresentantesService
      .getListaRepresentantes()
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
    this.router.navigate(['../editar', item.codRepresentante], {

      relativeTo: this.activateRoute,

    });
  }

  // Outros
  onPageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.dadosPagination = this.dados.slice(startItem, endItem);

    this.scrollToFilter.nativeElement.scrollIntoView({
      behavior: 'instant'
    });
  }

  refreshMainData(data: any): void {
    for (let i = 0; i < this.dados.length; i++) {
      if (data.codTabela === this.dados[i].codTabela) {
        this.dados[i].codSituacao = data.codSituacao;
        return;
      }
    }
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
