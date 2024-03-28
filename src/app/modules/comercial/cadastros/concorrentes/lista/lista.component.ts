import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription, EMPTY, Observable } from 'rxjs';
import { take, switchMap, finalize } from 'rxjs/operators';

// ngx-bootstrap
import { PageChangedEvent } from 'ngx-bootstrap/pagination';

// Services
import { ComercialCadastrosConcorrenteService } from '../concorrentes.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { DetailPanelService } from 'src/app/shared/templates/detail-panel/detal-panel.service';

// Interfaces
import { Concorrente } from './../models/concorrente';
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';


@Component({
  selector: 'comercial-cadastros-concorrente-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class ComercialCadastrosConcorrenteListaComponent implements OnInit {
  @ViewChild('scrollToFilter', {}) scrollToFilter: ElementRef;

  loaderNavbar: boolean;

  breadCrumbTree: Array<Breadcrumb> = [];

  activatedRouteSubscription: Subscription;

  showDetailPanelSubscription: Subscription;
  showDetailPanel = false;

  form: FormGroup;
  orderBy = 'nomeConcorrente';
  orderType = 'ASC';

  showAdvancedFilter = true;

  maxSize = 10;
  itemsPerPage = 300;
  currentPage = 1;
  totalItems: number;

  dados: Array<Concorrente> = [];
  dadosPagination: Array<Concorrente> = [];
  dadosLoaded = false;
  dadosEmpty = false;

  concorrenteSelecionado: Concorrente;
  alteracoes: Array<any> = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private concorrenteService: ComercialCadastrosConcorrenteService,
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
    this.titleService.setTitle('Concorrentes');
    this.onDetailPanelEmitter();
    this.setConcorrenteSelecionado();
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
          descricao: 'Concorrentes',
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
      codConcorrenteTid: [formValue.codConcorrenteTid],
      nomeConcorrente: [formValue.nomeConcorrente],
      nomeMarcaAco: [formValue.nomeMarcaAco],
      orderBy: [formValue.orderBy],
      orderType: [formValue.orderType],
      pagina: [formValue.pagina],
      registros: [formValue.registros, Validators.required],
    });

    this.checkOrder();
  }

  checkRouterParams(): Object {
    let formValue = {
      codConcorrenteTid: null,
      nomeConcorrente: null,
      nomeMarcaAco: null,
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
    this.detailPanelService.hide();
    this.itemsPerPage = this.form.value.registros;
    this.currentPage = 1;
    this.setRouterParams(this.verificaParams());
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

    if (this.form.value.codConcorrenteTid) {
      params.codConcorrenteTid = this.form.value.codConcorrenteTid;
    }

    if (this.form.value.nomeConcorrente) {
      params.nomeConcorrente = this.form.value.nomeConcorrente;
    }

    if (this.form.value.nomeMarcaAco) {
      params.nomeMarcaAco = this.form.value.nomeMarcaAco;
    }

    if (this.form.value.nomeMarcaAco) {
      params.nomeMarcaAco = this.form.value.nomeMarcaAco;
    }

    params.orderBy = this.form.value.orderBy;
    params.orderType = this.form.value.orderType;

    return params;
  }

  onAdvancedFilter(): void {
    this.showAdvancedFilter = !this.showAdvancedFilter;
  }

  onInput(field: string): void {
    if (field === 'codConcorrenteTid') {
      if (this.form.value.codConcorrenteTid.length > 0) {
        this.form.controls.nomeConcorrente.setValue(null);
        this.form.controls.nomeConcorrente.disable();
        this.form.controls.nomeMarcaAco.setValue(null);
        this.form.controls.nomeMarcaAco.disable();
      } else {
        this.form.controls.nomeConcorrente.enable();
        this.form.controls.nomeMarcaAco.enable();
      }
    } else if (field === 'nomeConcorrente' || field === 'nomeMarcaAco') {
      if (
        (field === 'nomeConcorrente' &&
          this.form.value.nomeConcorrente.length > 0) ||
        (field === 'nomeMarcaAco' && this.form.value.nomeMarcaAco.length > 0)
      ) {
        this.form.controls.codConcorrenteTid.setValue(null);
        this.form.controls.codConcorrenteTid.disable();
      } else {
        this.form.controls.codConcorrenteTid.enable();
      }
    }
  }

  search(params: any): void {
    this.loaderNavbar = true;
    this.dados = [];
    this.dadosPagination = [];
    this.dadosLoaded = false;
    this.dadosEmpty = false;

    this.concorrenteService
      .getListaConcorrentes(params)
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
            //console.log(this.dados)
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

  onPageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.dadosPagination = this.dados.slice(startItem, endItem);

    this.scrollToFilter.nativeElement.scrollIntoView({
      behavior: 'instant',
    });
  }

  viewRegister(concorrente: Concorrente): void {
    this.router.navigate(['../editar', concorrente.codConcorrenteTid], {
      relativeTo: this.activatedRoute,
    });
  }

  setConcorrenteSelecionado(){
    this.concorrenteSelecionado = {
      codConcorrente: null,
      codConcorrenteTid: null,
      nomeConcorrente: null,
      nomeMarcaAco: null,
      codSituacao: null,
      codUsuarioCadastro: null,
      nomeUsuarioCadastro: null,
      dataCadastro: null,
    }
  }

  onDetails(concorrente: Concorrente): void {
    if(concorrente.codConcorrente != null){
    this.loaderNavbar = true;
    this.detailPanelService.show();
    this.setConcorrenteSelecionado();
    this.concorrenteSelecionado = concorrente;
    this.alteracoes = [];

    this.concorrenteService
      .getAlteracoes(concorrente.codConcorrente)
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

            for (let i = 0; i < this.alteracoes.length; i++) {
              if (this.alteracoes[i].nomeCampo == "Situação") {
                if (this.alteracoes[i].de == 1){
                  this.alteracoes[i].de = "Ativo"
                } else if (this.alteracoes[i].de == 0){
                  this.alteracoes[i].de = "Inativo"
                }

                if (this.alteracoes[i].para == 1){
                  this.alteracoes[i].para = "Ativo"
                } else if (this.alteracoes[i].para == 0){
                  this.alteracoes[i].para = "Inativo"
                }
              }
            }

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
    } else {
      this.detailPanelService.show();
      this.alteracoes = [];
      this.detailPanelService.loadedFinished(true);
    }
  }

  onActivate(index: number, concorrente: Concorrente): void {
    this.confirmActivate()
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) =>
          result ? this.activateConcorrente(index, concorrente) : EMPTY
        ),
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe(
        (success: any) => {
          this.pnotifyService.success();
          this.refreshMainData(concorrente);
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

  activateConcorrente(index: number, concorrente: Concorrente): Observable<any> {
    this.loaderNavbar = true;
    this.dadosPagination[index].codSituacao = 1;

    return this.concorrenteService.activateConcorrente(concorrente.codConcorrenteTid);
  }

  onInactivate(index: number, concorrente: Concorrente): void {
    this.confirmInactive()
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) =>
          result ? this.inactivateConcorrente(index, concorrente) : EMPTY
        ),
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe(
        (success: any) => {
          this.pnotifyService.success();
          this.refreshMainData(concorrente);
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

  inactivateConcorrente(index: number, concorrente: Concorrente): Observable<any> {
    this.loaderNavbar = true;

    this.dadosPagination[index].codSituacao = 0;

    return this.concorrenteService.inactivateConcorrente(concorrente.codConcorrenteTid);
  }

  refreshMainData(concorrente: Concorrente): void {
    for (let i = 0; i < this.dados.length; i++) {
      if (concorrente.codConcorrenteTid === this.dados[i].codConcorrenteTid) {
        this.dados[i].codSituacao = concorrente.codSituacao;
        return;
      }
    }
  }

}
