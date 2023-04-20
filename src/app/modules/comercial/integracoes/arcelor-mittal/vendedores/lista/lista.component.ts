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
import { ComercialIntegracoesArcelorMittalVendedoresService } from '../vendedores.service';
import { ComercialService } from '../../../../comercial.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { DetailPanelService } from 'src/app/shared/templates/detail-panel/detal-panel.service';

// Interfaces
import { JsonResponse } from 'src/app/models/json-response';
import { IVendedor } from '../models/vendedor';
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';

@Component({
  selector: 'comercial-cadastros-materiais-cross-sell-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class ComercialIntegracoesArcelorMittalVendedoresListaComponent
  implements OnInit
{
  @ViewChild('scrollToFilter', {}) scrollToFilter: ElementRef;

  loaderNavbar = false;

  breadCrumbTree: Array<Breadcrumb> = [];

  subtitles: Array<Subtitles> = [
    {
      id: 1,
      text: 'Associado',
      color: 'green',
    },
    {
      id: 2,
      text: 'Não Associado',
      color: 'red',
    },
  ];

  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
  };

  tableConfigVendedores: Partial<CustomTableConfig> = {
    hover: false,
  };

  activatedRouteSubscription: Subscription;

  showDetailPanelSubscription: Subscription;
  showDetailPanel = false;
  detailPanelTitle: string;

  form: FormGroup;
  orderBy = 'idArcelorMittal';
  orderType = 'ASC';

  maxSize = 10;
  itemsPerPage = 300;
  currentPage = 1;
  totalItems = 0;

  dados: Array<IVendedor> = [];
  dadosPagination: Array<IVendedor> = [];
  dadosLoaded = false;
  dadosEmpty = false;

  vendedorSelecionado: IVendedor;
  vendedores: Array<any> = [];
  escritorios: Array<any> = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private vendedoresService: ComercialIntegracoesArcelorMittalVendedoresService,
    private comercialService: ComercialService,
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
    this.titleService.setTitle('Vendedores');
    this.getEscritorios();
    this.onDetailPanelEmitter();
    this.setVendedorSelecionado();
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
          descricao: 'Integração com Arcelor Mittal',
          routerLink: `/comercial/integracoes/arcelor-mittal/${params['idSubModulo']}`,
        },
        {
          descricao: 'Vendedores',
        },
      ];
    });
  }

  getEscritorios(): void {
    this.loaderNavbar = true;
    this.comercialService
      .getEscritorios()
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == 200) {
            this.escritorios = response['result'];
            this.escritorios.unshift({
              id: 0,
              nome: 'EXIBIR TODOS',
            });
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

  setFormFilter(): void {
    const formValue: any = this.checkRouterParams();

    this.form = this.formBuilder.group({
      vendManetoni: [formValue.vendManetoni],
      codVendArcelor: [formValue.codVendArcelor],
      escritorio: [formValue.escritorio],
      orderBy: [formValue.orderBy],
      orderType: [formValue.orderType],
      pagina: [formValue.pagina],
      registros: [formValue.registros, Validators.required],
    });

    this.checkOrder();
  }

  checkRouterParams(): Object {
    let formValue = {
      vendManetoni: null,
      codVendArcelor: null,
      escritorio: 0,
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

  setVendedorSelecionado(): void {
    this.vendedorSelecionado = {
      idArcelorMittal: null,
      nomeArcelorMittal: null,
      idManetoni: null,
      nomeManetoni: null,
      associado: null,
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

    if (this.form.value.vendManetoni) {
      params.vendManetoni = this.form.value.vendManetoni;
    }

    if (this.form.value.codVendArcelor) {
      params.codVendArcelor = this.form.value.codVendArcelor;
    }

    if (this.form.value.escritorio) {
      params.escritorio = this.form.value.escritorio;
    }

    params.orderBy = this.form.value.orderBy;
    params.orderType = this.form.value.orderType;
    params.registros = this.form.value.registros;

    return params;
  }

  search(params: any): void {
    this.loaderNavbar = true;
    this.detailPanelService.hide();
    this.dados = [];
    this.dadosPagination = [];
    this.dadosLoaded = false;
    this.dadosEmpty = false;

    this.vendedoresService
      .getLista(params)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
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

  classStatusBorder(vendedor: IVendedor): string {
    let borderClass: string;

    if (vendedor.associado === 1) {
      borderClass = 'border-success';
    } else if (vendedor.associado === 0) {
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

  onDetails(vendedor: IVendedor): void {
    this.loaderNavbar = true;
    this.detailPanelService.show();
    this.detailPanelTitle = `Associação (${vendedor.nomeArcelorMittal})`;
    this.vendedorSelecionado = vendedor;

    if (vendedor.idManetoni != null) {
      this.setVendedorSelecionado;
      this.vendedores[0] = this.vendedorSelecionado;

      setTimeout(() => {
        this.loaderNavbar = false;
        this.detailPanelService.loadedFinished(false);
      }, 700);
    } else {
      setTimeout(() => {
        this.loaderNavbar = false;
        this.detailPanelService.loadedFinished(true);
      }, 700);
    }
  }

  onEdit(vendedor: IVendedor): void {
    this.router.navigate(['../editar', vendedor.nomeArcelorMittal], {
      relativeTo: this.activatedRoute,
    });
  }

  /* onActivate(index: number, crossSell: ICrossSell): void {
    this.confirmActivate()
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) =>
          result ? this.activateGrupo(index, crossSell) : EMPTY
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
          this.dadosPagination[index].codSituacao = 2;
        }
      );
  } */

  /* confirmActivate(): any {
    return this.confirmModalService.showConfirm(
      null,
      null,
      'Deseja realmente prosseguir com a ativação do registro?',
      'Cancelar',
      'Confirmar'
    );
  }

  activateGrupo(index: number, crossSell: ICrossSell): Observable<any> {
    this.loaderNavbar = true;
    this.dadosPagination[index].codSituacao = 1;

    return this.materiaisCrossSellService.ac(
      crossSell.codSimilaridade
    );
  } */

  /* onInactivate(index: number, crossSell: ICrossSell): void {
    this.confirmInactive()
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) =>
          result ? this.inactivateGrupo(index, similaridade) : EMPTY
        ),
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe(
        (success: any) => {
          this.pnotifyService.success();
          this.refreshMainData(similaridade);
        },
        (error: any) => {
          this.pnotifyService.error();
          this.dadosPagination[index].codSituacao = 1;
        }
      );
  } */

  /* confirmInactive(): any {
    return this.confirmModalService.showConfirm(
      'inactivate',
      'Confirmar inativação',
      'Deseja realmente prosseguir com a inativação do registro?',
      'Cancelar',
      'Confirmar'
    );
  } */

  /* inactivateGrupo(index: number, similaridade: ISimilaridade): Observable<any> {
    this.loaderNavbar = true;
    this.dadosPagination[index].codSituacao = 0;

    return this.materiaisSimilaridadeService.inactivateGrupo(
      similaridade.codSimilaridade
    );
  } */

  /* refreshMainData(similaridade: ICrossSell): void {
    for (let i = 0; i < this.dados.length; i++) {
      if (similaridade.codSimilaridade === this.dados[i].codSimilaridade) {
        this.dados[i].codSituacao = similaridade.codSituacao;
        return;
      }
    }
  } */
}
