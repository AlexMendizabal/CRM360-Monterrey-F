import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';

defineLocale('pt-br', ptBrLocale);

// ngx-bootstrap
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { ptBrLocale } from 'ngx-bootstrap/locale';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';

// Services
import { ComercialRelatoriosFaturamentoDetalhadoService } from './faturamento-detalhado.service';
import { XlsxService } from 'src/app/shared/modules/xlsx/xlsx.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { AuthService } from 'src/app/shared/services/core/auth.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { DateService } from 'src/app/shared/services/core/date.service';

// Interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';

@Component({
  selector: 'comercial-relatorios-faturamento-detalhado',
  templateUrl: './faturamento-detalhado.component.html',
  styleUrls: ['./faturamento-detalhado.component.scss']
})
export class ComercialRelatoriosFaturamentoDetalhadoComponent
  implements OnInit {
  loaderNavbar = false;
  loaderFullScreen = true;

  adminProfile = false;
  idVendedor: number;

  activatedRouteSubscription: Subscription;

  form: FormGroup;
  bsConfig: Partial<BsDatepickerConfig>;

  breadCrumbTree: Array<Breadcrumb> = [];

  itensLoaded = false;
  itensEmpty = true;

  itens: any = [];
  itensReturned: any = [];
  vendedores: any = [];
  escritorios: any = [];

  exibeClasse = false;
  exibeProduto = false;
  exibeLinha = false;
  exibeComparativo = false;
  comparativoTotal: any = [];

  anoPassado: number;
  anoCorrente: number;

  exibeVendedores = false;
  exibeEscritorios = false;
  exibeClientes = false;

  maxSize = 10;
  itemsPerPage = 25;
  currentPage = 1;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private location: Location,
    private formBuilder: FormBuilder,
    private pnotifyService: PNotifyService,
    private localeService: BsLocaleService,
    private faturamentoDetalhadoService: ComercialRelatoriosFaturamentoDetalhadoService,
    private xlsxService: XlsxService,
    private atividadesService: AtividadesService,
    private authService: AuthService,
    private titleService: TitleService,
    private dateService: DateService
  ) {
    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );
    this.pnotifyService.getPNotify();
    this.idVendedor = this.authService.getCurrentUser()['info']['idVendedor'];
  }

  ngOnInit() {
    this.registrarAcesso();
    this.setBreadCrumb();
    this.getPerfil();
    this.setFormFilter();
    this.titleService.setTitle('Faturamento detalhado');
  }

  registrarAcesso() {
    this.atividadesService.registrarAcesso().subscribe();
  }

  setBreadCrumb() {
    this.activatedRoute.params.subscribe((params: any) => {
      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/comercial/home'
        },
        {
          descricao: 'Relatórios',
          routerLink: `/comercial/relatorios/${params['idSubModulo']}`
        },
        {
          descricao: 'Faturamento detalhado'
        }
      ];
    });
  }

  getPerfil() {
    this.faturamentoDetalhadoService
      .getPerfil()
      .pipe(
        finalize(() => {
          if (this.adminProfile) {
            this.getFilterValues();
            this.onChangeFiltrarPor();
          } else {
            this.loaderFullScreen = false;
          }
          this.montaFiltros();
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] === 200) {
            if (
              response['result']['coordenador'] ||
              response['result']['gestor']
            ) {
              this.adminProfile = true;
            }
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

  getFilterValues() {
    this.faturamentoDetalhadoService
      .getFiltros()
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response[0]['responseCode'] === 200) {
            this.escritorios = response[0]['result'];
          }

          if (response[1]['responseCode'] === 200) {
            this.vendedores = response[1]['result'];
          }
        },
        error: (error: any) => {
          this.pnotifyService.error();
          this.location.back();
        }
      });
  }

  setFormFilter() {
    const formValue = this.checkRouterParams();

    this.form = this.formBuilder.group({
      visao: [formValue['visao'], [Validators.required]],
      filtro: [formValue['filtro'], [Validators.required]],
      inicioData: [formValue['inicioData'], [Validators.required]],
      terminoData: [formValue['terminoData'], [Validators.required]],
      exibirComparativo: [formValue['exibirComparativo']],
      vendedor: [formValue['vendedor']],
      escritorio: [formValue['escritorio']],
      cliente: [formValue['cliente']]
    });
  }

  checkRouterParams(): Object {
    let formValue = {
      visao: 1,
      filtro: 0,
      inicioData: this.dateService.getFirstDayMonth(),
      terminoData: new Date(),
      exibirComparativo: 0,
      vendedor: null,
      escritorio: null,
      cliente: null
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
                if (formKey === 'inicioData' || formKey === 'terminoData') {
                  formValue[formKey] = this.dateService.convertStringToDate(
                    params[paramKey],
                    'pt-br'
                  );
                } else {
                  if (!isNaN(Number(params[paramKey]))) {
                    formValue[formKey] = Number(params[paramKey]);
                  } else {
                    formValue[formKey] = params[paramKey];
                  }
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

  onFilter() {
    if (this.form.valid) {
      this.setRouterParams(this.verificaParams());
      this.currentPage = 1;
    }
  }

  search(params: any) {
    this.loaderNavbar = true;
    this.itensLoaded = false;
    this.itensEmpty = true;
    this.itens = [];
    this.itensReturned = [];

    this.faturamentoDetalhadoService
      .getFaturamentoDetalhado(params)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
          this.itensLoaded = true;
          this.visaoRelatorio(params['visao']);
          this.verificaComparativo(params['exibirComparativo']);
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] === 200) {
            if (
              response['result']['analitico'].length != 0 &&
              response['result']['analitico']
            ) {
              let d = new Date();

              this.anoCorrente = d.getFullYear();
              this.anoPassado = this.anoCorrente - 1;

              this.itens = response['result']['analitico'];
              this.itensReturned = this.itens.slice(0, this.itemsPerPage);
              this.comparativoTotal = response['result']['total'];
              this.itensEmpty = false;
            }
          } else if (response['responseCode'] === 204) {
            this.pnotifyService.notice('Nenhuma informação encontrada');
          }
        },
        error: (error: any) => {
          this.pnotifyService.error();
          this.location.back();
        }
      });
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

    params['visao'] = this.form.value['visao'];
    params['exibirComparativo'] = this.form.value['exibirComparativo'];
    params['inicioData'] = this.dateService.convertToUrlDate(
      new Date(this.form.value['inicioData'])
    );
    params['terminoData'] = this.dateService.convertToUrlDate(
      new Date(this.form.value['terminoData'])
    );
    params['filtro'] = this.form.value['filtro'];

    if (this.form.value['escritorio']) {
      params['escritorio'] = this.form.value['escritorio'];
    }

    if (this.form.value['vendedor']) {
      params['vendedor'] = this.form.value['vendedor'];
    }

    if (this.form.value['cliente']) {
      params['cliente'] = this.form.value['cliente'];
    }

    return params;
  }

  montaFiltros() {
    if (this.adminProfile == false) {
      this.form.controls['filtro'].setValue(2);
      this.form.controls['vendedor'].setValue(this.idVendedor);
    }
  }

  onChangeFiltrarPor(): void {
    if (this.form.value['filtro'] == 1) {
      this.exibeEscritorios = true;
      this.form.controls['escritorio'].setValidators([Validators.required]);
    } else {
      this.exibeEscritorios = false;
      this.form.controls['escritorio'].clearValidators();
    }
    this.form.controls['escritorio'].updateValueAndValidity();

    if (this.form.value['filtro'] == 2) {
      this.exibeVendedores = true;
      this.form.controls['vendedor'].setValidators([Validators.required]);
    } else {
      this.exibeVendedores = false;
      this.form.controls['vendedor'].clearValidators();
    }
    this.form.controls['vendedor'].updateValueAndValidity();

    if (this.form.value['filtro'] == 3) {
      this.exibeClientes = true;
      this.form.controls['cliente'].setValidators([Validators.required]);
    } else {
      this.exibeClientes = false;
      this.form.controls['cliente'].clearValidators();
    }
    this.form.controls['cliente'].updateValueAndValidity();
  }

  onExport(): void {
    let data = new Date().toLocaleDateString().split('/'),
      dataExport = `${data[0]}${data[1]}${data[2]}`;

    let listagemExport: any = [];

    listagemExport = this.itens.concat(this.comparativoTotal);

    this.xlsxService.exportFile(
      listagemExport,
      `FaturamentoDetalhado_${dataExport}`
    );
  }

  verificaComparativo(comparativo: any): void {
    this.exibeComparativo = comparativo == 1 ? true : false;
  }

  verificaData(inicio: Date, termino: Date): Array<any> {
    let dtInicio: string, dtTermino: string;

    dtInicio = `${inicio.getFullYear()}-${inicio.getMonth() +
      1}-${inicio.getDate()}`;

    dtTermino = `${termino.getFullYear()}-${termino.getMonth() +
      1}-${termino.getDate()}`;

    return [dtInicio, dtTermino];
  }

  visaoRelatorio(visao: number): void {
    this.exibeLinha = visao == 1 ? true : false;
    this.exibeClasse = visao == 2 ? true : false;
    this.exibeProduto = visao == 3 ? true : false;
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

  onFieldRequired(field: string): string {
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

  classComparativo(value: number): string {
    let textClass = '';

    if (value > 0) {
      textClass = 'text-success';
    } else if (value < 0) {
      textClass = 'text-danger';
    }

    return textClass;
  }

  onPageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.itensReturned = this.itens.slice(startItem, endItem);
  }
}
