import { EstadosService } from 'src/app/shared/services/requests/estados.service';
import { ComercialCadastrosMateriaisGrupoService } from './../../../cadastros/materiais/grupos/grupos.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';

import { Subscription, EMPTY, Observable } from 'rxjs';
import { finalize, take, switchMap } from 'rxjs/operators';
import { Location } from '@angular/common';

// ngx-bootstrap
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { ptBrLocale } from 'ngx-bootstrap/locale';
defineLocale('pt-br', ptBrLocale);

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialGestaoTabelaPrecosService } from '../tabela-precos.service';
import { DateService } from './../../../../../shared/services/core/date.service';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { DetailPanelService } from 'src/app/shared/templates/detail-panel/detal-panel.service';

//Interfaces
import { JsonResponse } from 'src/app/models/json-response';

@Component({
  selector: 'comercial-gestao-tabela-preco-visao-comercial',
  templateUrl: './visao-comercial.component.html',
  styleUrls: ['./visao-comercial.component.scss'],
})
export class ComercialGestaoTabelaPrecoVisaoComercialComponent
  implements OnInit
{
  dadosEmpty = true;
  boolimpar = false;
  dadosLoaded = false;
  loading = true;
  loadingNavBar = false;
  showDetailPanel = false;

  materiais = [];
  dados = [];
  dadosDetalhes = [];

  codigoSelecionado: number = 0;
  materialSelecionado: string = '';

  breadCrumbTree: Array<Breadcrumb> = [];

  form: FormGroup;
  orderBy = 'nomeMaterial';
  orderType = 'ASC';

  bsConfig: Partial<BsDatepickerConfig>;
  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
  };

  linhas: Array<any> = [];
  tabelas: Array<any> = [];

  maxSize = 10;
  itemsPerPage = 300;
  currentPage = 1;
  totalItems = 0;
  begin: number = 0;
  end: number = 10;
  $showDetailPanelSubscription: Subscription;
  $activatedRouteSubscription: Subscription;

  appTitle = 'Tabela de Preços - Visão Comercial';

  constructor(
    private service: ComercialGestaoTabelaPrecosService,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private localeService: BsLocaleService,
    private dateService: DateService,
    private router: Router,
    private routerService: RouterService,
    private materiaisGrupoService: ComercialCadastrosMateriaisGrupoService,
    private pnotifyService: PNotifyService,
    private location: Location,
    private detailPanelService: DetailPanelService
  ) {
    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );
  }

  ngOnInit(): void {
    this.onBuildForm();
    this.onActiveRoute();
    this.onDetailPanelEmitter();
    this.setBreadCrumb();
    this.getTabelas();
    this.getLinhas();
    setTimeout(() => {
      this.loading = false;
    }, 1500);
  }

  ngOnDestroy(): void {
    this.$showDetailPanelSubscription.unsubscribe();
    this.$activatedRouteSubscription.unsubscribe();
  }

  onBuildForm() {
    this.form = this.formBuilder.group({
      tabela: [0],
      codMaterial: [null],
      nomeMaterial: [null],
      codLinha: [0],
      orderBy: [null],
      orderType: [null],
      pagina: [null],
      registros: [25, Validators.required],
      timestamp: [new Date().getTime()],
    });
  }

  setBreadCrumb() {
    this.activatedRoute.params.subscribe((params: any) => {
      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/comercial/',
        },
        {
          descricao: 'Gestão',
          routerLink: `/comercial/gestao/${params.idSubModulo}`,
        },
        {
          descricao: this.appTitle,
        },
      ];
    });
  }

  onDetailPanelEmitter(): void {
    this.$showDetailPanelSubscription =
      this.detailPanelService.config.subscribe((event: any) => {
        this.showDetailPanel = event.showing;
        if (!this.showDetailPanel) {
          this.codigoSelecionado = 0;
          this.materialSelecionado = '';
        }
      });
  }

  onActiveRoute() {
    this.$activatedRouteSubscription =
      this.activatedRoute.queryParams.subscribe((queryParams: any) => {
        if (Object.keys(queryParams).length > 0) {
          let _response = this.routerService.getBase64UrlParams(queryParams);
          console.log(_response);
          this.getMateriais(_response);
          this.form.patchValue(_response);
        }
      });
  }

  getTabelas(): void {
    this.service
      .getTabelas()
      .pipe(finalize(() => {}))
      .subscribe((response: JsonResponse) => {
        if (response.hasOwnProperty('success') && response.success === true) {
          this.tabelas = response.data;
          this.tabelas.unshift({
            codPreco: 0,
            nomePreco: 'EXIBIR TODOS',
          });
        } else {
          this.pnotifyService.error();
          this.location.back();
        }
      });
  }

  getLinhas(): void {
    this.materiaisGrupoService
      .getFilterValues()
      .pipe(finalize(() => {}))
      .subscribe((response: any) => {
        if (response[0].responseCode === 200) {
          this.linhas = response[0].result;
          this.linhas.unshift({
            id: 0,
            descricao: 'EXIBIR TODOS',
          });
        } else {
          this.pnotifyService.error();
          this.location.back();
        }
      });
  }

  getMateriais(codMaterial: any) {
    this.detailPanelService.hide();
    if (!this.loading) this.loadingNavBar = true;

    this.dadosLoaded = false;

    this.service
      .getMateriais(codMaterial)
      .pipe(
        finalize(() => {
          this.boolimpar = false;
          this.loading = false;
          this.loadingNavBar = false;
          this.dadosLoaded = true;
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.hasOwnProperty('success') && response.success === true) {
            this.dados = response.data;
            this.dadosEmpty = false;
          } else if (
            response.hasOwnProperty('success') &&
            response.success === false &&
            response.hasOwnProperty('mensagem') &&
            response.mensagem !== null
          ) {
            this.dados = [];
            this.dadosEmpty = true;
            this.pnotifyService.error(response.mensagem);
          } else {
            this.dados = [];
            this.dadosEmpty = true;
            this.pnotifyService.notice('Nenhuma informação encontrada');
          }
        },
        error: (error: any) => {
          this.dados = [];
          this.dadosEmpty = true;
          if (error.error.hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
      });
  }

  getMateriaisDetalhes(item: any) {
    this.detailPanelService.show();
    this.loadingNavBar = true;
    this.codigoSelecionado = 0;
    this.codigoSelecionado = item.codMaterial;
    this.materialSelecionado = '';
    this.materialSelecionado = item.nomeMaterial;

    let params: any = {};

    params.codMaterial = this.codigoSelecionado;
    params.codTabela = this.form.value.tabela;

    if (!this.loading) this.loadingNavBar = true;

    this.service
      .getMateriaisDetalhes(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.hasOwnProperty('success') && response.success === true) {
            this.dadosDetalhes = response.data;
            this.detailPanelService.loadedFinished(false);
          } else if (
            response.hasOwnProperty('success') &&
            response.success === false &&
            response.hasOwnProperty('mensagem') &&
            response.mensagem !== null
          ) {
            this.dadosDetalhes = [];
            this.detailPanelService.loadedFinished(true);
            this.pnotifyService.error(response.mensagem);
          } else {
            this.dadosDetalhes = [];
            this.detailPanelService.loadedFinished(true);
            this.pnotifyService.notice('Nenhuma informação encontrada');
          }
        },
        error: (error: any) => {
          this.dadosDetalhes = [];
          this.detailPanelService.loadedFinished(true);
          if (error.error.hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
      });
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

    // if (_obj?.material) {
    //   (Number.isNaN(parseInt(_obj?.material))) ?
    //     _params['nomeMaterial'] = _obj.material :
    //     _params['codMaterial'] = _obj.material
    // }

    // if (_obj?.grupo) {
    //   (Number.isNaN(parseInt(_obj?.grupo))) ?
    //     _params['nomeGrupo'] = _obj.grupo :
    //     _params['codGrupo'] = _obj.grupo;
    // }

    if (_obj?.tabela) {
      Number.isNaN(parseInt(_obj?.tabela))
        ? (_params['nomePreco'] = _obj.tabela)
        : (_params['codPreco'] = _obj.tabela);
    }

    _params['orderBy'] = this.orderBy;
    _params['orderType'] = this.orderType;
    return _params;
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
    this.itemsPerPage = this.form.value.registros;
    this.currentPage = 1;
    this.form.get('timestamp').setValue(new Date().getTime());
    this.router.navigate([], {
      queryParams: this.routerService.setBase64UrlParams(this.getParams()),
      relativeTo: this.activatedRoute,
    });
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

  classStatusBorder(item): string {
    let borderClass: string;

    if (item.codSituacao === 2) {
      borderClass = 'border-danger';
    } else if (item.codSituacao === 1) {
      borderClass = 'border-success';
    }

    return borderClass;
  }

  onLimpar() {
    this.onBuildForm();
    this.boolimpar = true;
    this.dados = [];
  }

  onPageChanged(event: PageChangedEvent): void {
    this.begin = (event.page - 1) * event.itemsPerPage;
    this.end = event.page * event.itemsPerPage;
  }
}
