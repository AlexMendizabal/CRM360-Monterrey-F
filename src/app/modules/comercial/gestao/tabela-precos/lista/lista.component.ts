import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  TemplateRef,
  OnDestroy,
  Input,
  EventEmitter,
  Output,
} from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';

import { Subscription, EMPTY, Observable, of } from 'rxjs';
import { finalize, take, switchMap } from 'rxjs/operators';

// ngx-bootstrap
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { ptBrLocale } from 'ngx-bootstrap/locale';
defineLocale('pt-br', ptBrLocale);

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { DetailPanelService } from 'src/app/shared/templates/detail-panel/detal-panel.service';
import { ComercialGestaoTabelaPrecosService } from '../tabela-precos.service';
import { DateService } from './../../../../../shared/services/core/date.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { ConfirmModalService } from './../../../../../shared/modules/confirm-modal/confirm-modal.service';

// Interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { JsonResponse } from 'src/app/models/json-response';
import { descricaoTabela, assocTabela } from './../models/tabela-precos';
import { RouterService } from 'src/app/shared/services/core/router.service';

@Component({
  selector: 'comercial-tabela-precos-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class ComercialGestaoTabelaPrecosListaComponent
  implements OnInit, OnDestroy
{
  @ViewChild('scrollToFilter', {}) scrollToFilter: ElementRef;
  
  modalRef: BsModalRef;

  codMaterial: number;

  loaderNavbar = false;
  loaderFullScreen = true;

  breadCrumbTree: Array<Breadcrumb> = [];

  showDetailPanelSubscription: Subscription;
  showDetailPanel = false;
  detailPanelTitle: string;

  dados: descricaoTabela[] = [];
  otherDados: any[] = [];
  otherDados2: any[] = [];
  dadosPagination: Array<any> = [];

  dadosLoaded = false;
  dadosEmpty = false;
  detalhes: any;
  detalhePreco: any;
  detalhePrecoUf: any;

  tabelaPreco = {};

  grupoSelecionado: assocTabela;

  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
  };

  tableConfigMateriais: Partial<CustomTableConfig> = {
    hover: false,
  };

  activatedRouteSubscription: Subscription;

  form: FormGroup;
  orderBy = 'codPreco';
  orderType = 'ASC';

  bsConfig: Partial<BsDatepickerConfig>;

  maxSize = 10;
  itemsPerPage = 300;
  currentPage = 1;
  totalItems = 0;

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private activateRoute: ActivatedRoute,
    private localeService: BsLocaleService,
    private dateService: DateService,
    private router: Router,
    private detailPanelService: DetailPanelService,
    private pnotifyService: PNotifyService,
    private tabelaPrecosService: ComercialGestaoTabelaPrecosService,
    private confirmModalService: ConfirmModalService,
    private atividadesService: AtividadesService,
    private modalService: BsModalService,
    private routerService: RouterService
  ) {
    this.localeService.use('pt-br');
  }

  ngOnInit(): void {
        
    this.setFormFilter();
    this.setBreadCrumb();
    this.registrarAcesso();
    this.onDetailPanelEmitter();
    this.setGrupoSelecionado();
    this.onActiveRoute();
  }

  ngOnDestroy(): void {
    this.activatedRouteSubscription.unsubscribe();
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
          routerLink: `/comercial/gestao/${params['idSubModulo']}`,
        },
        {
          descricao: 'Tabela de Preços',
        },
      ];
    });
  }

  onActiveRoute() {
    this.activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (response) => {
        let _response = this.routerService.getBase64UrlParams(response);

        if (Object.keys(_response).length > 0) this.form.patchValue(_response);

        this.search(this.getParams());
      }
    );
  }

  // Formulário
  setFormFilter(): void {
    this.form = this.formBuilder.group({
      codMaterial: null,
      descTabela: [null],
      dataInicialVigencia: '',
      dataFinalVigencia: '',
      codSituacao: [1],
      orderBy: [null],
      orderType: [null],
      pagina: [null],
      registros: [this.itemsPerPage],
      timestamp: [new Date().getTime()],
    });
  }

  registrarAcesso() {
    this.atividadesService.registrarAcesso().subscribe();
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
    this.form.get('timestamp').setValue(new Date().getTime());

    this.router.navigate([], {
      queryParams: this.routerService.setBase64UrlParams(this.getParams()),
      relativeTo: this.activatedRoute,
    });
    this.itemsPerPage = this.form.value.registros;
    this.currentPage = 1;
  }

  // setRouterParams(params: any): void {
  //   this.router.navigate([], {
  //     relativeTo: this.activatedRoute,
  //     queryParams: { q: btoa(JSON.stringify(params)) },
  //   });
  //   this.search(params);
  // }

  // verificaParams(): Object {
  //   let params: any = {};

  //   if (this.form.value.descTabela) {
  //     params.descTabela = this.form.value.descTabela;
  //   }

  //   if (this.form.value.dataInicialVigencia) {
  //     params.dataInicialVigencia = this.form.value.dataInicialVigencia;
  //   }

  //   if (this.form.value.dataFinalVigencia) {
  //     params.dataFinalVigencia = this.form.value.dataFinalVigencia;
  //   }

  //   if (this.form.value.codSituacao) {
  //     params.codSituacao = this.form.value.codSituacao;
  //   }

  //   params.pagina = this.form.value.pagina;
  //   params.registros = this.form.value.registros;
  //   params.orderBy = this.form.value.orderBy;
  //   params.orderType = this.form.value.orderType;

  //   return params;
  // }

  search(params: any): void {
    if (!this.loaderFullScreen) this.loaderNavbar = true;

    this.detailPanelService.hide();
    this.dados = [];
    this.dadosLoaded = false;
    this.dadosEmpty = false;
    this.tabelaPrecosService
      .getListaPrecos(params)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
          this.loaderFullScreen = false;
          this.dadosLoaded = true;
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.hasOwnProperty('success') && response.success === true) {
            this.dados = response.data;  
            this.dadosPagination = this.dados.slice(0, this.itemsPerPage);
            this.totalItems = this.dados.length;           
            this.dadosLoaded = true;
            // if(this.form.value.codMaterial){
            //   let hasData = this.dados.find((cod) => {
            //      return cod.codPreco == this.form.value.codMaterial;
            //   })
            //   if(!hasData){
            //     this.dadosEmpty = true;
            //   }
            // }
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

  onCheckPreco() {   
            let dados = {
              info: null,
              precos: null
            }
            let precos;
            this.dados.forEach(element => {
              this.tabelaPrecosService.getDetalhes(element.codPreco)
              .pipe(
                finalize(() => {               
                    this.loaderNavbar = false;
                    this.detailPanelService.loadedFinished(false); 
                })
              )
              .subscribe({
              next: (response: any) => {
                response.data.assocGrupos.forEach(element2 => {
                      this.otherDados.forEach(element3 => {
                          if(element2.codGrupo == element3.codGrupo){
                            precos = element2.precos;                            
                            dados.info = element3;
                            dados.precos = precos;
                            this.otherDados2.push({
                              'info': dados.info,
                              'precos': dados.precos
                            }); 
                          }
                      }); 
                });       
              }
          });
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
    _params['orderBy'] = this.orderBy;
    _params['orderType'] = this.orderType;
    _params['dataFinalVigencia'] = '';
    return _params;
  }

  // Detail Panel
  onDetails(item) {
    this.detalhes = item;
    this.detailPanelService.show();
    this.detailPanelTitle = `Materiais associados `;
    this.setGrupoSelecionado();
    // this.grupoSelecionado = grupo;
    this.loaderNavbar = true;
    this.otherDados = [];

    const params = {
      codGrupo: item.codGrupo,
    };

    this.tabelaPrecosService
      .getDetailPanel(params)
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.hasOwnProperty('success') && response.success === true) {
            this.otherDados = response.data;
            this.otherDados2 = []; 
            this.onCheckPreco();
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

    this.loaderNavbar = true;
    this.detailPanelService.loadedFinished(false);
  }

  setGrupoSelecionado(): void {
    this.grupoSelecionado = {
      codGrupo: null,
      nomeGrupo: null,
      precos: [],
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
  onActivate(index: number, grupo: descricaoTabela): void {
    this.confirmActivate()
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) =>
          result ? this.activateGrupo(index, grupo) : EMPTY
        ),
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe(
        (success: any) => {
          this.pnotifyService.success();
          this.refreshMainData(grupo);
        },
        (error: any) => {
          this.pnotifyService.error();
          this.dados[index].codSituacao = 1;
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

  activateGrupo(index: number, grupo: any): Observable<any> {
    this.loaderNavbar = true;
    this.dados[index].codSituacao = 1;
    return this.tabelaPrecosService.activateGrupo(grupo.codPreco);
  }

  inactivateGrupo(index: number, grupo: any): Observable<any> {
    this.loaderNavbar = true;
    this.dados[index].codSituacao = 2;
    return this.tabelaPrecosService.inactivateGrupo(grupo.codPreco);
  }

  onInactivate(index: number, grupo: descricaoTabela): void {
    this.confirmInactive()
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) =>
          result ? this.inactivateGrupo(index, grupo) : EMPTY
        ),
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe(
        (success: any) => {
          this.pnotifyService.success();
          this.refreshMainData(grupo);
        },
        (error: any) => {
          this.pnotifyService.error();
          this.dados[index].codSituacao = 1;
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

  classStatusBorder(grupo: descricaoTabela): string {
    let borderClass: string;

    if (grupo.codSituacao === 2) {
      borderClass = 'border-danger';
    } else if (grupo.codSituacao === 1) {
      borderClass = 'border-success';
    }

    return borderClass;
  }

  onEdit(item: any): void {
    this.router.navigate(['../editar', item.codPreco], {
      relativeTo: this.activateRoute,
    });
  }

  onCsv(item: any): void {
    this.router.navigate(['../importar-csv', item.codPreco], {
      relativeTo: this.activateRoute,
    });
  }

  onClone(item: any, template): void {
    this.tabelaPreco = item;
    item.clone = true;
    this.openModal(template);
  }

  // Outros
  // onPageChanged(event: PageChangedEvent) {
  //   if (this.form.value.pagina != event.page) {
  //     this.detailPanelService.hide();
  //     this.setGrupoSelecionado();
  //     this.form.value.pagina = event.page;
  //     this.onFilter();

  //     this.scrollToFilter.nativeElement.scrollIntoView({
  //       behavior: 'instant',
  //     });
  //   }
  // }

  onPageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.dadosPagination = this.dados.slice(startItem, endItem);

    // this.scrollToFilter.nativeElement.scrollIntoView({
    //   behavior: 'instant',
    // });
  }

  refreshMainData(grupo: descricaoTabela): void {
    for (let i = 0; i < this.dados.length; i++) {
      if (grupo.codPreco === this.dados[i].codPreco) {
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

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      animated: false,
      ignoreBackdropClick: true,
    });
  }
}
