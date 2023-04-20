import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
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
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { ptBrLocale } from 'ngx-bootstrap/locale';

defineLocale('pt-br', ptBrLocale);

// Services
import { AtividadesService } from './../../../../../../shared/services/requests/atividades.service';
import { ConfirmModalService } from './../../../../../../shared/modules/confirm-modal/confirm-modal.service';
import { ComercialCadastrosRepresentantesService } from './../../../../cadastros/representantes/representantes.service';
import { PNotifyService } from './../../../../../../shared/services/core/pnotify.service';
import { DetailPanelService } from './../../../../../../shared/templates/detail-panel/detal-panel.service';
import { DateService } from './../../../../../../shared/services/core/date.service';
import { ComercialComissoesGestaoComissionamentosService } from './../gestao-comissionamentos.service';

// Interfaces
import { JsonResponse } from './../../../../../../models/json-response';
import { Breadcrumb } from './../../../../../../shared/modules/breadcrumb/breadcrumb';
import { CustomTableConfig } from './../../../../../../shared/templates/custom-table/models/config';

@Component({
  selector: 'gestao-comissionamentos-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class ComercialComissoesGestaoComissionamentosListaComponent
  implements OnInit
{
  @ViewChild('scrollToFilter', {}) scrollToFilter: ElementRef;

  loaderNavbar = false;
  loaderFullScreen = true;

  breadCrumbTree: Array<Breadcrumb>;

  showDetailPanelSubscription: Subscription;
  showDetailPanel = false;
  detailPanelTitle: string;

  dados: any[] = [];
  modeloComissao: any[] = [];

  dadosLoaded = false;
  dadosEmpty = false;
  profile: any = {};
  situacao: any[] = [];

  grupoSelecionado: any;
  showPermissionDenied = false;

  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
  };

  tableConfigMateriais: Partial<CustomTableConfig> = {
    hover: false,
  };

  activatedRouteSubscription: Subscription;
  data: Array<any> = [];
  subscription: Subscription;

  form: FormGroup;
  orderBy = 'codPreco';
  orderType = 'ASC';

  bsConfig: Partial<BsDatepickerConfig>;

  maxSize = 10;
  itemsPerPage = 300;
  currentPage = 1;
  totalItems = 0;

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private localeService: BsLocaleService,
    private dateService: DateService,
    private router: Router,
    private detailPanelService: DetailPanelService,
    private pnotifyService: PNotifyService,
    private atividadesService: AtividadesService,
    private gestaoComissionamentosService: ComercialComissoesGestaoComissionamentosService
  ) {
    this.localeService.use('pt-br');
  }

  ngOnInit(): void {
    this.setFormFilter();
    this.setBreadCrumb();
    this.registrarAcesso();
    this.onDetailPanelEmitter();
    this.getPerfil();
    this.getStatus();
  }

  setBreadCrumb(): void {
    this.activatedRoute.params.subscribe((params: any) => {
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

  getFirstDayMonth(): Date {
    let date = new Date();
    return new Date(date.getFullYear(), date.getMonth() - 1);
  }

  getLastDayMonth(): Date {
    let date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1, -1);
  }

  // Formulário
  setFormFilter(): void {
    const formValue: any = this.checkRouterParams();

    this.form = this.formBuilder.group({
      dtInicio: [this.getFirstDayMonth()],
      dtFim: [this.getLastDayMonth()],
    });

    this.checkOrder();
  }

  registrarAcesso() {
    this.atividadesService.registrarAcesso().subscribe();
  }

  checkRouterParams(): Object {
    let formValue = {
      codRepresentante: null,
      codSituacao: 2,
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
    this.dadosLoaded = false;
    this.dadosEmpty = false;

    this.gestaoComissionamentosService
      .getListaComissoes(params)
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

  // Verifica Parâmetros
  setRouterParams(params: any): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
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
    // _params['orderBy'] = this.orderBy;    _params['orderType'] = this.orderType;
    return _params;
  }

  verificaParams(): Object {
    let params: any = {};

    if (this.form.value.codPreco) {
      params.codPreco = this.form.value.codPreco;
    }

    if (this.form.value.dtInicioVigencia) {
      params.dtInicioVigencia = this.form.value.dtInicioVigencia;
    }

    if (this.form.value.dtFimVigencia) {
      params.dtFimVigencia = this.form.value.dtFimVigencia;
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
    this.detailPanelTitle = `Modelo de Comissionamento`;
    this.modeloComissao = [];
    this.loaderNavbar = true;

    this.gestaoComissionamentosService
      .getModelo(item.codGestao)
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

  onDetailPanelEmitter(): void {
    this.showDetailPanelSubscription = this.detailPanelService.config.subscribe(
      (event: any) => {
        this.showDetailPanel = event.showing;
      }
    );
  }

  classStatusBorder(grupo: any): string {
    let borderClass: string;

    if (grupo.codSituacao === 2) {
      borderClass = 'border-danger';
    } else if (grupo.codSituacao === 1) {
      borderClass = 'border-success';
    }

    return borderClass;
  }

  // Get perfil
  getPerfil() {
    this.gestaoComissionamentosService
      .getPermissoesAcesso()
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.success === true) {
            this.profile = response.data;
            if (this.profile.analistaMarketing === true) {
              this.analistaDisabled();
            } else if (this.profile.gerenteMarketing === true) {
              this.gerenteDisabled();
            } else if (this.profile.gerenteEscritorio === true) {
              this.escritorioDisabled();
            } else if (this.profile.gerenteFiscal === true) {
              this.fiscalDisabled();
            } else if (this.profile.diretorComercial === true) {
              this.diretorDisabled();
            }
          }
        },
        error: (error: any) => {
          this.showPermissionDenied = true;
        }
      });
  }

  analistaDisabled() {
    // this.form.get("codStatus").setValue(2);
    // // this.form.get("codStatus").disable();
  }

  escritorioDisabled() {
    // this.form.get("codStatus").setValue(1);
    // // this.form.get("codStatus").disable();
  }

  gerenteDisabled() {
    // this.form.get("codStatus").setValue(3);
    // // this.form.get("codStatus").disable();
  }

  fiscalDisabled() {
    // this.form.get("codStatus").setValue(4);
    // // this.form.get("codStatus").disable();
  }

  diretorDisabled() {
    // this.form.get("codStatus").setValue(5);
    // // this.form.get("codStatus").disable();
  }

  // programaçãoDisabled() {
  //   this.form.get("codStatus").setValue(6);
  //   // this.form.get("codStatus").disable();
  // }

  // // Get e EditarLista
  //   getRegistros() {
  //     this.loaderNavbar = true;
  //     this.detailPanelService.hide();
  //     this.dadosLoaded = false;
  //     this.dadosEmpty = false;

  //     this.gestaoComissionamentosService
  //       .getComissionamentos()
  //       .pipe(
  //         finalize(() => {
  //           this.loaderNavbar = false;
  //           this.dadosLoaded = true;
  //         })
  //       )
  //       .subscribe(dados => {this.dados = dados; }

  //       );

  //   }

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

  onEdit(item: any): void {
    this.router.navigate(['../editar', item.idAnoMes], {
      relativeTo: this.activatedRoute,
    });
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
      if (grupo.codTabela === this.dados[i].codTabela) {
        this.dados[i].codSituacao = grupo.codSituacao;
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
