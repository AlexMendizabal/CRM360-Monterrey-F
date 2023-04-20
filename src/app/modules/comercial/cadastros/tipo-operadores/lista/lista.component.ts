import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl
} from '@angular/forms';
import { Subscription, EMPTY, Observable } from 'rxjs';
import { take, switchMap, finalize } from 'rxjs/operators';

// ngx-bootstrap
import { PageChangedEvent } from 'ngx-bootstrap/pagination';

// Services
import { ComercialCadastrosTipoOperadorService } from '../tipo-operadores.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { DetailPanelService } from 'src/app/shared/templates/detail-panel/detal-panel.service';

// Interfaces
import { TipoOperador } from '../models/tipo-operador';
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';

@Component({
  selector: 'comercial-cadastros-tipo-operador-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss']
})
export class ComercialCadastrosTipoOperadorListaComponent
  implements OnInit, OnDestroy {
  @ViewChild('scrollToFilter', {}) scrollToFilter: ElementRef;

  loaderNavbar = false;

  breadCrumbTree: Array<Breadcrumb> = [];

  subtitles: Array<Subtitles> = [
    {
      id: 1,
      text: 'Ativo',
      color: 'green'
    },
    {
      id: 2,
      text: 'Inativo',
      color: 'red'
    }
  ];

  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true
  };

  activatedRouteSubscription: Subscription;

  showDetailPanelSubscription: Subscription;
  showDetailPanel = false;
  detailPanelTitle: string;

  form: FormGroup;
  orderBy = 'data';
  orderType = 'ASC';

  maxSize = 10;
  itemsPerPage = 300;
  currentPage = 1;
  totalItems = 0;

  dados: Array<TipoOperador> = [];
  dadosPagination: Array<TipoOperador> = [];
  dadosLoaded = false;
  dadosEmpty = false;

  tipoOperadorSelecionado: TipoOperador;
  alteracoes: Array<any> = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private tipoOperadorService: ComercialCadastrosTipoOperadorService,
    private pnotifyService: PNotifyService,
    private atividadesService: AtividadesService,
    private titleService: TitleService,
    private confirmModalService: ConfirmModalService,
    private detailPanelService: DetailPanelService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit(): void {
    this.registrarAcesso();
    this.setBreadCrumb();
    this.setFormFilter();
    this.titleService.setTitle('Tipo de operadores');
    this.onDetailPanelEmitter();
    this.setTipoOperadorSelecionado();
  }

  ngOnDestroy(): void {
    this.showDetailPanelSubscription.unsubscribe();
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  setBreadCrumb(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/comercial/home'
        },
        {
          descricao: 'Cadastros',
          routerLink: `/comercial/cadastros/${params['idSubModulo']}`
        },
        {
          descricao: 'Tipo de operadores'
        }
      ];
    });
  }

  onDetailPanelEmitter(): void {
    this.showDetailPanelSubscription = this.detailPanelService.config.subscribe(
      (event: any) => {
        this.showDetailPanel = event.showing;
      }
    );
  }

  setFormFilter(): void {
    const formValue: any = this.checkRouterParams();

    this.form = this.formBuilder.group({
      tipo: [formValue.tipo],
      codSituacao: [formValue.codSituacao],
      orderBy: [formValue.orderBy],
      orderType: [formValue.orderType],
      pagina: [formValue.pagina],
      registros: [formValue.registros, Validators.required]
    });

    this.checkOrder();
  }

  checkRouterParams(): Object {
    let formValue = {
      tipo: null,
      codSituacao: 0,
      orderBy: this.orderBy,
      orderType: this.orderType,
      pagina: 1,
      registros: this.itemsPerPage
    };

    this.activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (queryParams: any) => {
        if (Object.keys(queryParams).length > 0) {
          let params = atob(queryParams['q']);
          params = JSON.parse(params);
          this.search(params);

          Object.keys(formValue).forEach(formKey => {
            Object.keys(params).forEach(paramKey => {
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

  checkOrder(): void {
    if (this.form.value.orderBy !== this.orderBy) {
      this.orderBy = this.form.value.orderBy;
    }

    if (this.form.value.orderType !== this.orderType) {
      this.orderType = this.form.value.orderType;
    }
  }

  setTipoOperadorSelecionado(): void {
    this.tipoOperadorSelecionado = {
      codTipoOperador: -1,
      tipo: null,
      codSituacao: null,
      situacao: null,
      nomeUsuario: null,
      dataCadastro: null
    };
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
      queryParams: { q: btoa(JSON.stringify(params)) }
    });
    this.search(params);
  }

  verificaParams(): Object {
    let params: any = {};

    if (this.form.value.tipo) {
      params.tipo = this.form.value.tipo;
    }

    if (this.form.value.codSituacao) {
      params.codSituacao = this.form.value.codSituacao;
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
    this.detailPanelService.hide();

    this.tipoOperadorService
      .getListaTipoOperador(params)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
          this.dadosLoaded = true;
        })
      )
      .subscribe({
        next:( response: any) => {
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

  classStatusBorder(tipoOperador: TipoOperador): string {
    let borderClass: string;

    if (tipoOperador.codSituacao === 1) {
      borderClass = 'border-success';
    } else if (tipoOperador.codSituacao === 2) {
      borderClass = 'border-danger';
    }

    return borderClass;
  }

  onPageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.dadosPagination = this.dados.slice(startItem, endItem);

    this.scrollToFilter.nativeElement.scrollIntoView({
      behavior: 'instant'
    });
  }

  onDetails(tipoOperador: TipoOperador): void {
    this.loaderNavbar = true;
    this.detailPanelService.show();
    this.detailPanelTitle = `HISTÓRICO DE ALTERAÇÕES / ${tipoOperador.tipo}`;
    this.setTipoOperadorSelecionado();
    this.tipoOperadorSelecionado = tipoOperador;
    this.alteracoes = [];

    this.tipoOperadorService
      .getAlteracoes(tipoOperador.codTipoOperador)
      .pipe(
        finalize(() => {
          setTimeout(() => {
            this.loaderNavbar = false;
          }, 500);
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.hasOwnProperty('success') && response.success === true) {
            // Não está vazio.
            this.detailPanelService.loadedFinished(false);
            this.alteracoes = response.data;
          } else if (
            response.hasOwnProperty('success') &&
            response.success === false
          ) {
            // Vazio.
            this.detailPanelService.loadedFinished(true);
          } else {
            // Vazio e com possível erro.
            this.pnotifyService.error();
            this.detailPanelService.loadedFinished(true);
          }
        },
        error: (error: any) => {
          // Vazio e com erro.
          this.detailPanelService.loadedFinished(true);

          if (error.error.hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
      });
  }

  onEdit(tipoOperador: TipoOperador): void {
    this.router.navigate(['../editar', tipoOperador.codTipoOperador], {
      relativeTo: this.activatedRoute
    });
  }

  onActivate(index: number, tipoOperador: TipoOperador): void {
    this.confirmActivate()
      .asObservable()
      .pipe(
        take(1),
        switchMap(result =>
          result ? this.activateTipoOperador(index, tipoOperador) : EMPTY
        ),
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe(
        (success: any) => {
          this.pnotifyService.success();
          this.refreshMainData(tipoOperador);
        },
        (error: any) => {
          this.pnotifyService.error();
          this.dadosPagination[index].codSituacao = 2;
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

  activateTipoOperador(
    index: number,
    tipoOperador: TipoOperador
  ): Observable<any> {
    this.loaderNavbar = true;
    this.dadosPagination[index].codSituacao = 1;

    return this.tipoOperadorService.activateTipoOperador(
      tipoOperador.codTipoOperador
    );
  }

  onInactivate(index: number, tipoOperador: TipoOperador): void {
    this.confirmInactive()
      .asObservable()
      .pipe(
        take(1),
        switchMap(result =>
          result ? this.inactivateTipoOperador(index, tipoOperador) : EMPTY
        ),
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe(
        (success: any) => {
          this.pnotifyService.success();
          this.refreshMainData(tipoOperador);
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

  inactivateTipoOperador(
    index: number,
    tipoOperador: TipoOperador
  ): Observable<any> {
    this.loaderNavbar = true;
    this.dadosPagination[index].codSituacao = 2;

    return this.tipoOperadorService.inactivateTipoOperador(
      tipoOperador.codTipoOperador
    );
  }

  refreshMainData(tipoOperador: TipoOperador): void {
    for (let i = 0; i < this.dados.length; i++) {
      if (tipoOperador.codTipoOperador === this.dados[i].codTipoOperador) {
        this.dados[i].codSituacao = tipoOperador.codSituacao;
        return;
      }
    }
  }
}
