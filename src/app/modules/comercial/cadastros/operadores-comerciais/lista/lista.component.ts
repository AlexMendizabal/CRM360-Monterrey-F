import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl
} from '@angular/forms';
import { Subscription, EMPTY, Observable, forkJoin } from 'rxjs';
import { take, switchMap, finalize } from 'rxjs/operators';

// ngx-bootstrap
import { PageChangedEvent } from 'ngx-bootstrap/pagination';

// Services
import { ComercialCadastrosOperadorComercialService } from '../operadores-comerciais.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { ComercialCadastrosTipoOperadorService } from '../../tipo-operadores/tipo-operadores.service';
import { ComercialCadastrosEquipeVendaService } from '../../equipe-venda/equipe-venda.service';
import { EscritoriosService } from 'src/app/shared/services/requests/escritorios.service';

// Interfaces
import { OperadorComercial } from '../models/operador-comercial';
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';
import { TipoOperador } from '../../tipo-operadores/models/tipo-operador';
import { EquipeVenda } from '../../equipe-venda/models/equipe-venda';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';

@Component({
  selector: 'comercial-cadastros-operador-comercial-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss']
})
export class ComercialCadastrosOperadorComercialListaComponent
  implements OnInit {
  @ViewChild('scrollToFilter', {}) scrollToFilter: ElementRef;

  loaderNavbar = false;
  loaderFullScreen = true;

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

  form: FormGroup;
  orderBy = 'nomeOperador';
  orderType = 'ASC';

  tipoOperadores: Array<TipoOperador> = [];
  equipesVenda: Array<EquipeVenda> = [];
  escritorios: Array<any> = [];

  maxSize = 10;
  itemsPerPage = 300;
  currentPage = 1;
  totalItems = 0;

  dados: Array<OperadorComercial> = [];
  dadosPagination: Array<OperadorComercial> = [];
  dadosLoaded = false;
  dadosEmpty = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private location: Location,
    private formBuilder: FormBuilder,
    private operadorComercialService: ComercialCadastrosOperadorComercialService,
    private pnotifyService: PNotifyService,
    private atividadesService: AtividadesService,
    private titleService: TitleService,
    private confirmModalService: ConfirmModalService,
    private tipoOperadorService: ComercialCadastrosTipoOperadorService,
    private equipeVendaService: ComercialCadastrosEquipeVendaService,
    private escritorioService: EscritoriosService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit(): void {
    this.registrarAcesso();
    this.setBreadCrumb();
    this.getFormFields();
    this.setFormFilter();
    this.titleService.setTitle('Operadores comerciais');
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
          descricao: 'Operadores comerciais'
        }
      ];
    });
  }

  getFormFields(): void {
    this.loadDependencies()
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (
            response[0].hasOwnProperty('success') &&
            response[0].success === true
          ) {
            this.tipoOperadores = response[0].data;

            this.tipoOperadores.unshift({
              codTipoOperador: 0,
              tipo: 'EXIBIR TODOS',
              codSituacao: null,
              situacao: null,
              nomeUsuario: null,
              dataCadastro: null
            });
          } else {
            this.pnotifyService.error();
            this.location.back();
          }

          if (
            response[1].hasOwnProperty('success') &&
            response[1].success === true
          ) {
            this.equipesVenda = response[1].data;

            this.equipesVenda.unshift({
              codEquipeVenda: 0,
              dsEquipeVenda: 'EXIBIR TODOS',
              codCarteira: null,
              codSituacao: null,
              situacao: null,
              codUsuario: null,
              nomeUsuario: null,
              dataCadastro: null,
              codReferenteErp: null
            });
          } else {
            this.pnotifyService.error();
            this.location.back();
          }

          if (response[2].responseCode === 200) {
            this.escritorios = response[2].result;

            this.escritorios.unshift({
              codEscritorio: 0,
              nomeEscritorio: 'EXIBIR TODOS'
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

  loadDependencies(): Observable<any> {
    const tipoOperadores = this.tipoOperadorService.getListaTipoOperador({
      codSituacao: 1
    });
    const equipesVenda = this.equipeVendaService.getListaEquipesVenda({
      codSituacao: 1
    });
    const escritorios = this.escritorioService.getEscritorios();

    return forkJoin([tipoOperadores, equipesVenda, escritorios]);
  }

  setFormFilter(): void {
    const formValue: any = this.checkRouterParams();

    this.form = this.formBuilder.group({
      cpfCnpj: [formValue.cpfCnpj],
      rgIe: [formValue.rgIe],
      nomeOperador: [formValue.nomeOperador],
      codTipoOperador: [formValue.codTipoOperador],
      codEquipe: [formValue.codEquipe],
      codEscritorio: [formValue.codEscritorio],
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
      cpfCnpj: null,
      rgIe: null,
      nomeOperador: null,
      codTipoOperador: 0,
      codEquipe: 0,
      codEscritorio: 0,
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

    if (this.form.value.cpfCnpj) {
      params.cpfCnpj = this.form.value.cpfCnpj;
    }

    if (this.form.value.rgIe) {
      params.rgIe = this.form.value.rgIe;
    }

    if (this.form.value.nomeOperador) {
      params.nomeOperador = this.form.value.nomeOperador;
    }

    if (this.form.value.codTipoOperador) {
      params.codTipoOperador = this.form.value.codTipoOperador;
    }

    if (this.form.value.codEquipe) {
      params.codEquipe = this.form.value.codEquipe;
    }

    if (this.form.value.codEscritorio) {
      params.codEscritorio = this.form.value.codEscritorio;
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
    this.totalItems = 0;

    this.operadorComercialService
      .getListaOperadoresComerciais(params)
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

  classStatusBorder(operadorComercial: OperadorComercial): string {
    let borderClass: string;

    if (operadorComercial.codSituacao === 1) {
      borderClass = 'border-success';
    } else if (operadorComercial.codSituacao === 2) {
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

  onEdit(operadorComercial: OperadorComercial): void {
    this.router.navigate(['../editar', operadorComercial.codOperador], {
      relativeTo: this.activatedRoute
    });
  }

  onActivate(index: number, operadorComercial: OperadorComercial): void {
    this.confirmActivate()
      .asObservable()
      .pipe(
        take(1),
        switchMap(result =>
          result
            ? this.activateOperadorComercial(index, operadorComercial)
            : EMPTY
        ),
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe(
        (success: any) => {
          this.pnotifyService.success();
          this.refreshMainData(operadorComercial);
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

  activateOperadorComercial(
    index: number,
    operadorComercial: OperadorComercial
  ): Observable<any> {
    this.loaderNavbar = true;
    this.dadosPagination[index].codSituacao = 1;

    return this.operadorComercialService.activateOperadorComercial(
      operadorComercial.codOperador
    );
  }

  onInactivate(index: number, operadorComercial: OperadorComercial): void {
    this.confirmInactive()
      .asObservable()
      .pipe(
        take(1),
        switchMap(result =>
          result
            ? this.inactivateOperadorComercial(index, operadorComercial)
            : EMPTY
        ),
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe(
        (success: any) => {
          this.pnotifyService.success();
          this.refreshMainData(operadorComercial);
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

  inactivateOperadorComercial(
    index: number,
    operadorComercial: OperadorComercial
  ): Observable<any> {
    this.loaderNavbar = true;
    this.dadosPagination[index].codSituacao = 2;

    return this.operadorComercialService.inactivateOperadorComercial(
      operadorComercial.codOperador
    );
  }

  refreshMainData(operadorComercial: OperadorComercial): void {
    for (let i = 0; i < this.dados.length; i++) {
      if (operadorComercial.codOperador === this.dados[i].codOperador) {
        this.dados[i].codSituacao = operadorComercial.codSituacao;
        return;
      }
    }
  }
}
