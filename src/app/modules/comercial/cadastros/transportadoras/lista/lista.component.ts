import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription, EMPTY, Observable } from 'rxjs';
import { take, switchMap, finalize } from 'rxjs/operators';

// ngx-bootstrap
import { PageChangedEvent } from 'ngx-bootstrap/pagination';

// Services
import { ComercialCadastrosTransportadoraService } from '../transportadoras.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';

// Interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { Transportadora } from '../models/transportadora';
import { JsonResponse } from 'src/app/models/json-response';

@Component({
  selector: 'comercial-cadastros-transportadora-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss']
})
export class ComercialCadastrosTransportadoraListaComponent implements OnInit {
  @ViewChild('scrollToFilter', {}) scrollToFilter: ElementRef;

  loaderFullScreen = true;
  loaderNavbar: boolean;

  breadCrumbTree: Array<Breadcrumb> = [];

  activatedRouteSubscription: Subscription;

  searchSubmitted = false;

  form: FormGroup;
  pesquisa: string;
  orderBy = 'codTransportadora';
  orderType = 'desc';

  showAdvancedFilter = true;

  maxSize = 10;
  itemsPerPage = 300;
  currentPage = 1;
  totalItems: number;

  dados: Array<Transportadora> = [];
  dadosPagination: Array<Transportadora> = [];
  dadosLoaded = false;
  dadosEmpty = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private transportadoraService: ComercialCadastrosTransportadoraService,
    private pnotifyService: PNotifyService,
    private atividadesService: AtividadesService,
    private titleService: TitleService,
    private confirmModalService: ConfirmModalService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.loaderFullScreen = false;
    }, 1000);

    this.registrarAcesso();
    this.setBreadCrumb();
    this.setFormFilter();
    this.titleService.setTitle('Transportadoras');
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
          descricao: 'Transportadoras'
        }
      ];
    });
  }

  setFormFilter(): void {
    const formValue: any = this.checkRouterParams();

    this.form = this.formBuilder.group({
      codigo: [formValue.codigo],
      nome: [formValue.nome],
      pagina: [formValue.pagina],
      registros: [formValue.registros, Validators.required]
    });
  }

  checkRouterParams(): Object {
    let formValue = {
      codigo: null,
      nome: null,
      pagina: 1,
      registros: this.itemsPerPage
    };

    this.activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (queryParams: any) => {
        if (Object.keys(queryParams).length > 0) {
          let params = atob(queryParams['q']);
          params = JSON.parse(params);
          this.setSubmittedSearch();
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

  setOrderBy(column: string): void {
    if (this.orderBy === column) {
      if (this.orderType == 'desc') {
        this.orderType = 'asc';
      } else if (this.orderType == 'asc') {
        this.orderType = 'desc';
      }
    } else {
      this.orderBy = column;
      this.orderType = 'asc';
    }
    this.onFilter();
  }

  onFilter(): void {
    this.itemsPerPage = this.form.value.registros;
    this.currentPage = 1;
    this.setRouterParams(this.verificaParams());
  }

  setSubmittedSearch(): void {
    this.searchSubmitted = true;
  }

  setRouterParams(params: any): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { q: btoa(JSON.stringify(params)) }
    });
    this.setSubmittedSearch();
    this.search(params);
  }

  verificaParams(): Object {
    let params: any = {};

    if (this.form.value.codigo) {
      params.codigo = this.form.value.codigo;
    }

    if (this.form.value.nome) {
      params.nome = this.form.value.nome;
    }

    params.orderBy = this.orderBy;
    params.orderType = this.orderType;

    return params;
  }

  onAdvancedFilter(): void {
    this.showAdvancedFilter = !this.showAdvancedFilter;
  }

  onInput(field: string): void {
    if (field === 'codigo') {
      if (this.form.value.codigo.length > 0) {
        this.form.controls.nome.setValue(null);
        this.form.controls.nome.disable();
      } else {
        this.form.controls.nome.enable();
      }
    } else if (field === 'nome') {
      if (this.form.value.nome.length > 0) {
        this.form.controls.codigo.setValue(null);
        this.form.controls.codigo.disable();
      } else {
        this.form.controls.codigo.enable();
      }
    }
  }

  search(params: any): void {
    this.loaderNavbar = true;
    this.dados = [];
    this.dadosPagination = [];

    this.transportadoraService
      .getListaTransportadoras(params)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.hasOwnProperty('success') && response.success === true) {
            this.dados = response['data'];
            this.dadosPagination = this.dados.slice(0, this.itemsPerPage);
            this.totalItems = this.dados.length;
            this.dadosLoaded = true;
          } else if (
            response.hasOwnProperty('success') &&
            response.success === false
          ) {
            this.pnotifyService.error(response.mensagem);
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

  onPageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.dadosPagination = this.dados.slice(startItem, endItem);
    this.form.controls.pagina.setValue(event.page);

    this.scrollToFilter.nativeElement.scrollIntoView({
      behavior: 'instant'
    });
  }

  viewRegister(transportadora: Transportadora): void {
    this.router.navigate(['../editar', transportadora.codTransportadoraTid], {
      relativeTo: this.activatedRoute
    });
  }

  onDeleteTransportadora(transportadora: any): void {
    this.confirmDelete()
      .asObservable()
      .pipe(
        take(1),
        switchMap(result =>
          result ? this.deleteTransportadora(transportadora) : EMPTY
        )
      )
      .subscribe(
        (success: any) => {
          this.pnotifyService.success();
        },
        (error: any) => {
          this.pnotifyService.error();
        }
      );
  }

  confirmDelete(): any {
    return this.confirmModalService.showConfirm(
      'delete',
      'Confirmar exclusão',
      'Deseja realmente prosseguir com a exclusão do registro?',
      'Cancelar',
      'Confirmar'
    );
  }

  deleteTransportadora(transportadora: Transportadora): Observable<any> {
    return this.transportadoraService.deleteTransportadora(transportadora);
  }
}
