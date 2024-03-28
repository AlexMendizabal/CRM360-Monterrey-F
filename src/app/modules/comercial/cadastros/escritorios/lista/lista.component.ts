import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
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
import { ComercialCadastrosEscritorioService } from '../escritorios.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { DetailPanelService } from 'src/app/shared/templates/detail-panel/detal-panel.service';
import { ComercialService } from '../../../comercial.service';

// Interfaces
import { Escritorio } from '../models/escritorio';
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';

@Component({
  selector: 'comercial-cadastros-escritorio-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss']
})
export class ComercialCadastrosEscritorioListaComponent
  implements OnInit, OnDestroy {
  @ViewChild('scrollToFilter', {}) scrollToFilter: ElementRef;

  loaderNavbar = false;
  loaderFullScreen = true;

  breadCrumbTree: Array<Breadcrumb> = [];

  subtitles: Array<Subtitles> = [
    {
      id: 1,
      text: 'Activo',
      color: 'green'
    },
    {
      id: 2,
      text: 'Inactivo',
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
  orderBy = 'nomeEscritorio';
  orderType = 'ASC';

  empresas: Array<any> = [];

  maxSize = 10;
  itemsPerPage = 300;
  currentPage = 1;
  totalItems = 0;

  dados: Array<Escritorio> = [];
  dadosPagination: Array<Escritorio> = [];
  dadosLoaded = false;
  dadosEmpty = false;

  escritorioSelecionado: Escritorio;
  alteracoes: Array<any> = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private location: Location,
    private formBuilder: FormBuilder,
    private escritorioService: ComercialCadastrosEscritorioService,
    private pnotifyService: PNotifyService,
    private atividadesService: AtividadesService,
    private titleService: TitleService,
    private confirmModalService: ConfirmModalService,
    private detailPanelService: DetailPanelService,
    private comercialService: ComercialService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit(): void {
    this.registrarAcesso();
    this.setBreadCrumb();
    this.getFormFields();
    this.setFormFilter();
    this.titleService.setTitle('ALMACENES');
    this.onDetailPanelEmitter();
    this.setEscritorioSelecionado();
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
          descricao: 'Registros',
          routerLink: `/comercial/cadastros/${params['idSubModulo']}`
        },
        {
          descricao: 'Almacenes'
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

  getFormFields(): void {
    this.comercialService
      .getEmpresas(null)
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.responseCode === 200) {
            this.empresas = response.result;

            this.empresas.unshift({
              idEmpresa: 0,
              nomeEmpresa: 'EXIBIR TODOS'
            });
          } else {
            this.pnotifyService.error();
            this.location.back();
          }
        },
        error: (error: any) => {
          this.pnotifyService.error();
          this.location.back();
        }
      });
  }

  setFormFilter(): void {
    const formValue: any = this.checkRouterParams();

    this.form = this.formBuilder.group({
      nomeEscritorio: [formValue.nomeEscritorio],
      codEmpresa: [formValue.codEmpresa],
      codReferenteErp: [formValue.codReferenteErp],
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
      nomeEscritorio: null,
      codEmpresa: 0,
      codSituacao: 0,
      codReferenteErp: null,
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

  setEscritorioSelecionado(): void {
    this.escritorioSelecionado = {
      codEscritorio: -1,
      nomeEscritorio: null,
      codEmpresa: null,
      nomeEmpresa: null,
      codSituacao: null,
      situacao: null,
      codUsuario: null,
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

    if (this.form.value.nomeEscritorio) {
      params.nomeEscritorio = this.form.value.nomeEscritorio;
    }

    if (this.form.value.codEmpresa) {
      params.codEmpresa = this.form.value.codEmpresa;
    }

    if (this.form.value.codSituacao) {
      params.codSituacao = this.form.value.codSituacao;
    }
    if (this.form.value.codReferenteErp) {
      params.codReferenteErp = this.form.value.codReferenteErp;
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

    this.escritorioService
      .getListaEscritorios(params)
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

  classStatusBorder(escritorio: Escritorio): string {
    let borderClass: string;

    if (escritorio.codSituacao === 1) {
      borderClass = 'border-success';
    } else if (escritorio.codSituacao === 2 || 0) {
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

  onDetails(escritorio: Escritorio): void {
    this.loaderNavbar = true;
    this.detailPanelService.show();
    this.detailPanelTitle = `HISTÓRICO DE ALTERAÇÕES / ${escritorio.nomeEscritorio.toUpperCase()}`;
    this.setEscritorioSelecionado();
    this.escritorioSelecionado = escritorio;
    this.alteracoes = [];

    this.escritorioService
      .getAlteracoes(escritorio.codEscritorio)
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

  onEdit(escritorio: Escritorio): void {
    this.router.navigate(['../editar', escritorio.codEscritorio], {
      relativeTo: this.activatedRoute
    });
  }

  onActivate(index: number, escritorio: Escritorio): void {
    this.confirmActivate()
      .asObservable()
      .pipe(
        take(1),
        switchMap(result =>
          result ? this.activateEscritorio(index, escritorio) : EMPTY
        ),
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe(
        (success: any) => {
          this.pnotifyService.success();
          this.refreshMainData(escritorio);
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

  activateEscritorio(index: number, escritorio: Escritorio): Observable<any> {
    this.loaderNavbar = true;
    this.dadosPagination[index].codSituacao = 1;

    return this.escritorioService.activateEscritorio(escritorio.codEscritorio);
  }

  onInactivate(index: number, escritorio: Escritorio): void {
    this.confirmInactive()
      .asObservable()
      .pipe(
        take(1),
        switchMap(result =>
          result ? this.inactivateEscritorio(index, escritorio) : EMPTY
        ), 
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe(
        (success: any) => {
          this.pnotifyService.success();
          this.refreshMainData(escritorio);
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

  inactivateEscritorio(index: number, escritorio: Escritorio): Observable<any> {
    this.loaderNavbar = true;
    this.dadosPagination[index].codSituacao = 2;

    return this.escritorioService.inactivateEscritorio(
      escritorio.codEscritorio
    );
  }

  refreshMainData(escritorio: Escritorio): void {
    for (let i = 0; i < this.dados.length; i++) {
      if (escritorio.codEscritorio === this.dados[i].codEscritorio) {
        this.dados[i].codSituacao = escritorio.codSituacao;
        return;
      }
    }
  }
}
