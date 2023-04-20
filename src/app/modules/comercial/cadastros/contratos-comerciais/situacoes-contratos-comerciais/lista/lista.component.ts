import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
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

// Services
import { ComercialCadastrosContratosComerciaisSituacoesContratosComerciaisService } from '../situacoes-contratos-comerciais.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { DetailPanelService } from 'src/app/shared/templates/detail-panel/detal-panel.service';

// Interfaces
import { ISituacaoContratos } from '../models/situacoes-contratos-comerciais';
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';

@Component({
  selector: 'comercial-cadastros-contratos-situacao-contratos-comerciais-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class ComercialCadastrosContratosComerciaisSituacoesContratosComerciaisListaComponent
  implements OnInit {
  @ViewChild('scrollToFilter', {}) scrollToFilter: ElementRef;

  loaderNavbar = false;
  loaderFullScreen = true;

  breadCrumbTree: Array<Breadcrumb> = [];

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

  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
  };

  activatedRouteSubscription: Subscription;

  showDetailPanelSubscription: Subscription;
  showDetailPanel = false;

  form: FormGroup;
  orderBy = 'nomeSituacao';
  orderType = 'ASC';

  maxSize = 10;
  itemsPerPage = 300;
  currentPage = 1;
  totalItems = 0;

  dados: Array<ISituacaoContratos> = [];
  dadosPagination: Array<ISituacaoContratos> = [];
  dadosLoaded = false;
  dadosEmpty = false;

  situacaoContratoSelecionada: ISituacaoContratos;
  alteracoes: Array<any> = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private location: Location,
    private formBuilder: FormBuilder,
    private situacaoContratossService: ComercialCadastrosContratosComerciaisSituacoesContratosComerciaisService,
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
    this.titleService.setTitle('Situação dos contratos comerciais');
    this.onDetailPanelEmitter();
    this.setSituacaoContratoSelecionada();
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
          routerLink: '/comercial/home',
        },
        {
          descricao: 'Cadastros',
          routerLink: `/comercial/cadastros/${params['idSubModulo']}`,
        },
        {
          descricao: 'Situação dos contratos comerciais',
        },
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
      situacaoContrato: [formValue.situacaoContrato],
      inEditar: [formValue.inEditar],
      inAprovacao: [formValue.inAprovacao],
      inSituacao: [formValue.inSituacao],
      orderBy: [formValue.orderBy],
      orderType: [formValue.orderType],
      pagina: [formValue.pagina],
      registros: [formValue.registros, Validators.required],
    });

    this.checkOrder();
    this.loaderFullScreen = false;
  }

  checkRouterParams(): Object {
    let formValue = {
      situacaoContrato: null,
      inEditar: 0,
      inAprovacao: 0,
      inSituacao: 0,
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

  setSituacaoContratoSelecionada(): void {
    this.situacaoContratoSelecionada = {
      codSituacao: null,
      nomeSituacao: null,
      inEditar: 0,
      inAprovacao: 0,
      inSituacao: 0,
      situacao: null,
      codUsuario: null,
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
      queryParams: { q: btoa(JSON.stringify(params)) },
    });
    this.search(params);
  }

  verificaParams(): Object {
    let params: any = {};

    if (this.form.value.situacaoContrato) {
      params.situacaoContrato = this.form.value.situacaoContrato;
    }

    if (this.form.value.inEditar) {
      params.inEditar = this.form.value.inEditar;
    }

    if (this.form.value.inAprovacao) {
      params.inAprovacao = this.form.value.inAprovacao;
    }

    if (this.form.value.inSituacao) {
      params.inSituacao = this.form.value.inSituacao;
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

    this.situacaoContratossService
      .getListaSituacoesContratosComerciais(params)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
          this.dadosLoaded = true;
        })
      )
      .subscribe({
        next: (response: any) => {
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

  classStatusBorder(situacaoContrato: ISituacaoContratos): string {
    let borderClass: string;

    if (situacaoContrato.inSituacao === 1) {
      borderClass = 'border-success';
    } else if (situacaoContrato.inSituacao === 0) {
      borderClass = 'border-danger';
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

  onDetails(situacaoContrato: ISituacaoContratos): void {
    /* this.loaderNavbar = true;
    this.detailPanelService.show(); */
    this.setSituacaoContratoSelecionada();
    this.situacaoContratoSelecionada = situacaoContrato;
    /* this.alteracoes = []; */

    /* this.situacaoContratossService
      .getAlteracoes(situacaoContrato.codigo)
      .pipe(
        finalize(() => {
          setTimeout(() => {
            this.loaderNavbar = false;
          }, 500);
        })
      )
      .subscribe(
        (response: any) => {
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
        (error: any) => {
          // Vazio e com erro.
          this.detailPanelService.loadedFinished(true);

          if (error.error.hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
      ); */
  }

  onEdit(situacaoContrato: ISituacaoContratos): void {
    this.router.navigate(['../editar', situacaoContrato.codSituacao], {
      relativeTo: this.activatedRoute,
    });
  }

  onActivate(index: number, situacaoContrato: ISituacaoContratos): void {
    this.confirmActivate()
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) =>
          result ? this.activateSituacaoContrato(index, situacaoContrato) : EMPTY
        ),
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe(
        (success: any) => {
          this.pnotifyService.success();
          this.refreshMainData(situacaoContrato);
        },
        (error: any) => {
          this.pnotifyService.error();
          this.dadosPagination[index].inSituacao = 0;
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

  activateSituacaoContrato(
    index: number,
    situacaoContrato: ISituacaoContratos
  ): Observable<any> {
    this.loaderNavbar = true;
    this.dadosPagination[index].inSituacao = 1;

    return this.situacaoContratossService.activateSituacaoContratoComercial(
      situacaoContrato.codSituacao
    );
  }

  onInactivate(index: number, situacaoContrato: ISituacaoContratos): void {
    this.confirmInactive()
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) =>
          result
            ? this.inactivateSituacaoContrato(index, situacaoContrato)
            : EMPTY
        ),
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe(
        (success: any) => {
          this.pnotifyService.success();
          this.refreshMainData(situacaoContrato);
        },
        (error: any) => {
          this.pnotifyService.error();
          this.dadosPagination[index].inSituacao = 1;
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

  inactivateSituacaoContrato(
    index: number,
    situacaoContrato: ISituacaoContratos
  ): Observable<any> {
    this.loaderNavbar = true;

    this.dadosPagination[index].inSituacao = 0;

    return this.situacaoContratossService.inactivateSituacaoContratoComercial(
      situacaoContrato.codSituacao
    );
  }

  refreshMainData(situacaoContrato: ISituacaoContratos): void {
    for (let i = 0; i < this.dados.length; i++) {
      if (situacaoContrato.codSituacao === this.dados[i].codSituacao) {
        this.dados[i].inSituacao = situacaoContrato.inSituacao;
        return;
      }
    }
  }
}
