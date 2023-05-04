import { Component, OnInit, TemplateRef } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl
} from '@angular/forms';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

defineLocale('pt-br', ptBrLocale);

// ngx-bootstrap
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { ptBrLocale } from 'ngx-bootstrap/locale';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

// Services
import { DateService } from 'src/app/shared/services/core/date.service';
import { ComercialRelatoriosFaturamentoDetalhadoDuqueService } from './faturamento-detalhado-duque.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';

// Interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';

@Component({
  selector: 'comercial-relatorios-faturamento-detalhado-duque',
  templateUrl: './faturamento-detalhado-duque.component.html',
  styleUrls: ['./faturamento-detalhado-duque.component.scss']
})
export class ComercialRelatoriosFaturamentoDetalhadoDuqueComponent
  implements OnInit {
  loaderNavbar = false;

  breadCrumbTree: Array<Breadcrumb> = [];

  activatedRouteSubscription: Subscription;

  form: FormGroup;
  bsConfig: Partial<BsDatepickerConfig>;

  dtPesquisa: string;
  mesAtual: string;

  listagem: any = [];
  listagemLoaded = false;
  listagemEmpty = false;

  tooltipRitmo: any = {};
  totalGeral: any = {};

  detalhesClasseEmpty = false;
  detalhesClasseLoaded = false;
  linha: number;

  detalhesTitulo: string;
  detalhesClasse: any = [];
  detalhesTotais: any = {};

  modalRef: BsModalRef;

  constructor(
    private router: Router,
    private location: Location,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private dateService: DateService,
    private modalService: BsModalService,
    private pnotifyService: PNotifyService,
    private localeService: BsLocaleService,
    private faturamentoDetalhadoDuqueService: ComercialRelatoriosFaturamentoDetalhadoDuqueService,
    private atividadesService: AtividadesService,
    private titleService: TitleService
  ) {
    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );
    this.pnotifyService.getPNotify();
  }

  ngOnInit() {
    this.registrarAcesso();
    this.setBreadCrumb();
    this.setFormFilter();
    this.titleService.setTitle('Faturamento detalhado - Duque de Caxias');
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
          descricao: 'Faturamento detalhado - Duque de Caxias'
        }
      ];
    });
  }

  setFormFilter() {
    const formValue = this.checkRouterParams();

    this.form = this.formBuilder.group({
      data: [formValue['data'], [Validators.required]]
    });
  }

  checkRouterParams(): Object {
    let formValue = {
      data: new Date()
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
                if (formKey === 'data') {
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
        } else {
          this.search({
            data: this.dateService.convertToUrlDate(new Date(formValue.data))
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
    }
  }

  verificaParams(): Object {
    let params: any = {};

    params['data'] = this.dateService.convertToUrlDate(
      new Date(this.form.value['data'])
    );

    return params;
  }

  setRouterParams(params: any): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { q: btoa(JSON.stringify(params)) }
    });
    this.search(params);
  }

  search(params: any) {
    this.loaderNavbar = true;
    this.listagemEmpty = false;
    this.listagemLoaded = false;

    this.faturamentoDetalhadoDuqueService
      .getFaturamentoDuque(params.data)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
          this.listagemLoaded = true;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] === 200) {
            if (
              response['result']['analitico'] &&
              response['result']['analitico'].length != 0
            ) {
              const dia =
                this.form.value['data'].getDate() < 10
                  ? `0${this.form.value['data'].getDate()}`
                  : this.form.value['data'].getDate();

              const mes =
                this.form.value['data'].getMonth() + 1 < 10
                  ? `0${this.form.value['data'].getMonth() + 1}`
                  : this.form.value['data'].getMonth() + 1;

              this.dtPesquisa = `${dia}/${mes}/${this.form.value[
                'data'
              ].getFullYear()}`;

              this.mesAtual = `${this.dateService.getFullMonth(
                this.form.value['data']
              )}/${this.form.value['data'].getFullYear()}`;

              this.listagem = response['result']['analitico'];
              this.tooltipRitmo = `<p class="mb-0">Dias úteis até hoje: ${response['result']['dias']['ateHoje']}.</p><p class="mb-0">Dias úteis no mês: ${response['result']['dias']['uteisMes']}.</p>`;
              this.totalGeral = response['result']['total'];
            } else {
              this.listagemEmpty = true;
            }
          } else {
            this.listagemEmpty = true;
            this.pnotifyService.notice('Erro ao carregar dados');
          }
        },
        error: (error: any) => {
          this.pnotifyService.error();
          this.location.back();
        }
      });
  }

  onExibir(linha: string) {
    if (linha === 'TOTAL LONGOS') {
      return false;
    }

    return true;
  }

  onDetalhesFilter(detalhes: TemplateRef<any>, linha: string, ordem: number) {
    this.loaderNavbar = true;
    this.detalhesClasseEmpty = false;
    this.detalhesClasseLoaded = false;
    this.linha = ordem - 1;

    const params = {
      data: this.dateService.convertToUrlDate(
        new Date(this.form.value['data'])
      ),
      ordem: ordem
    };

    this.faturamentoDetalhadoDuqueService
      .getFaturamentoDuqueDetalhes(params)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.responseCode === 200) {
            if (
              response['result']['analitico'].length != 0 &&
              response['result']['analitico']
            ) {
              this.detalhesTitulo = linha;
              this.detalhesClasse = response['result']['analitico'];
              this.detalhesTotais = response['result']['total'];
              this.detalhesClasseLoaded = true;

              setTimeout(() => {
                this.openModal(detalhes);
              }, 500);
            }
          } else {
            this.detalhesTitulo = '';
            this.detalhesClasseEmpty = true;

            this.pnotifyService.notice('Dados não localizados');
          }
        },
        error: (error: any) => {
          this.pnotifyService.error();
          this.location.back();
        }
      });
  }

  openModal(detalhes: TemplateRef<any>) {
    this.modalRef = this.modalService.show(
      detalhes,
      Object.assign({}, { class: 'modal-lg' })
    );
  }

  onModalClose() {
    this.modalRef.hide();
    this.linha = -1;
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
}
