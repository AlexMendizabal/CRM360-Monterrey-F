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

// Services
import { ComercialCadastrosMateriaisCrossSellService } from '../cross-sell.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { DetailPanelService } from 'src/app/shared/templates/detail-panel/detal-panel.service';

// Interfaces
import { JsonResponse } from 'src/app/models/json-response';
import { ICrossSell, IMateriaisCrossSell } from '../models/cross-sell';
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';

@Component({
  selector: 'comercial-cadastros-materiais-cross-sell-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class ComercialCadastrosMateriaisCrossSellListaComponent
  implements OnInit {
  @ViewChild('scrollToFilter', {}) scrollToFilter: ElementRef;

  loaderNavbar = false;

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

  tableConfigMateriais: Partial<CustomTableConfig> = {
    hover: false,
  };

  activatedRouteSubscription: Subscription;

  showDetailPanelSubscription: Subscription;
  showDetailPanel = false;
  detailPanelTitle: string;

  form: FormGroup;
  orderBy = 'nomeMaterial';
  orderType = 'ASC';

  maxSize = 10;
  itemsPerPage = 300;
  currentPage = 1;
  totalItems = 0;

  dados: Array<ICrossSell> = [];
  dadosLoaded = false;
  dadosEmpty = false;

  crossSellSelecionada: ICrossSell;
  materiais: Array<IMateriaisCrossSell> = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private materiaisCrossSellService: ComercialCadastrosMateriaisCrossSellService,
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
    this.titleService.setTitle('Materiales Complementarios');
    this.onDetailPanelEmitter();
    this.setCrossSellSelecionada();
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
          descricao: 'Registros',
          routerLink: `/comercial/cadastros/${params.idSubModulo}`,
        },
        {
          descricao: 'Materiales complementarios',
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
      material: [formValue.material],
      codSituacao: [formValue.codSituacao],
      orderBy: [formValue.orderBy],
      orderType: [formValue.orderType],
      pagina: [formValue.pagina],
      registros: [formValue.registros, Validators.required],
    });

    this.checkOrder();
  }

  checkRouterParams(): Object {
    let formValue = {
      material: null,
      codSituacao: '',
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

  setCrossSellSelecionada(): void {
    this.crossSellSelecionada = {
      codCrossSell: null,
      codMaterial: null,
      nomeMaterial: null,
      codUsuario: null,
      nomeUsuario: null,
      materiais: [],
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

    return field.status == 'INVÁLIDA' && field.touched;
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

    if (this.form.value.material) {
      params.material = this.form.value.material;
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

  search(params: any): void {
    this.loaderNavbar = true;
    this.detailPanelService.hide();
    this.dados = [];
    this.dadosLoaded = false;
    this.dadosEmpty = false;

    this.materiaisCrossSellService
      .getListaCrossSell(params)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
          this.dadosLoaded = true;
        })
      )
      .subscribe(
        (response: JsonResponse) => {
          if (response.hasOwnProperty('success') && response.success === true) {
            this.dados = response.data;
            this.totalItems = this.dados[0].total;
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

  classStatusBorder(crossSell: ICrossSell): string {
    let borderClass: string;

    if (crossSell.codSituacao === 0) {
      borderClass = 'border-danger';
    } else if (crossSell.codSituacao === 1) {
      borderClass = 'border-success';
    }

    return borderClass;
  }

  onPageChanged(event: PageChangedEvent): void {
    if (this.form.value.pagina != event.page) {
      this.detailPanelService.hide();
      this.form.value.pagina = event.page;
      this.onFilter();

      this.scrollToFilter.nativeElement.scrollIntoView({
        behavior: 'instant',
      });
    }
  }

  onDetails(crossSell: ICrossSell): void {
    this.loaderNavbar = true;
    this.detailPanelService.show();
    this.detailPanelTitle = `Asociaciones (${crossSell.nomeMaterial})`;
    this.setCrossSellSelecionada();
    this.crossSellSelecionada = crossSell;
    this.materiais = [];

    this.materiaisCrossSellService
      .getAssociacoesMateriais(crossSell.codCrossSell)
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
            this.materiais = response.data;
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
      );
  }

  onEdit(crossSell: ICrossSell): void {
    this.router.navigate(['../editar', crossSell.codCrossSell], {
      relativeTo: this.activatedRoute,
    });
  }

  onActivate(index: number, crossSell: ICrossSell): void {
    this.confirmActivate()
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) =>
          result ? this.activateCrossSell(index, crossSell) : EMPTY
        ),
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe(
        (success: any) => {
          this.pnotifyService.success();
          this.refreshMainData(crossSell);
        },
        (error: any) => {
          this.pnotifyService.error();
          this.dados[index].codSituacao = 0;
        }
      );
  }

  confirmActivate(): any {
    return this.confirmModalService.showConfirm(
      null,
      null,
      '¿Realmente desea continuar con la activación del registro?',
      'Cancelar',
      'Confirmar'
    );
  }

  activateCrossSell(index: number, crossSell: ICrossSell): Observable<any> {
    this.loaderNavbar = true;
    this.dados[index].codSituacao = 1;

    return this.materiaisCrossSellService.activateCrossSell(
      crossSell.codCrossSell
    );
  }

  onInactivate(index: number, crossSell: ICrossSell): void {
    this.confirmInactive()
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) =>
          result ? this.inactivateCrossSell(index, crossSell) : EMPTY
        ),
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe(
        (success: any) => {
          this.pnotifyService.success();
          this.refreshMainData(crossSell);
        },
        (error: any) => {
          this.pnotifyService.error();
          this.dados[index].codSituacao = 1;
        }
      );
  }

  confirmInactive(): any {
    return this.confirmModalService.showConfirm(
      'inactivar',
      'Confirmar inactivación',
      '¿Realmente desea continuar con la desactivación del registro?',
      'Cancelar',
      'Confirmar'
    );
  }

  inactivateCrossSell(index: number, crossSell: ICrossSell): Observable<any> {
    this.loaderNavbar = true;
    this.dados[index].codSituacao = 0;

    return this.materiaisCrossSellService.inactivateCrossSell(
      crossSell.codCrossSell
    );
  }

  refreshMainData(crossSell: ICrossSell): void {
    for (let i = 0; i < this.dados.length; i++) {
      if (crossSell.codCrossSell === this.dados[i].codCrossSell) {
        this.dados[i].codSituacao = crossSell.codSituacao;
        return;
      }
    }
  }
}
