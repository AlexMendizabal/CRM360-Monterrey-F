import { Component, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import {
  FormBuilder,
  Validators,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { finalize } from 'rxjs/operators';

// ngx-bootstrap
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { ptBrLocale } from 'ngx-bootstrap/locale';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

defineLocale('pt-br', ptBrLocale);

// Services
import { DateService } from 'src/app/shared/services/core/date.service';
import { ComercialRelatoriosPosicaoDiariaService } from './posicao-diaria.service';
import { Subscription } from 'rxjs';
import { XlsxService } from 'src/app/shared/modules/xlsx/xlsx.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';

// Interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { JsonResponse } from 'src/app/models/json-response';

@Component({
  selector: 'comercial-relatorios-posicao-diaria',
  templateUrl: './posicao-diaria.component.html',
  styleUrls: ['./posicao-diaria.component.scss'],
})
export class ComercialRelatoriosPosicaoDiariaComponent implements OnInit {
  loaderNavbar = false;
  loaderFullScreen = true;

  breadCrumbTree: Array<Breadcrumb> = [];

  tableConfig: Partial<CustomTableConfig> = {
    hover: false,
    small: false,
  };

  activatedRouteSubscription: Subscription;

  form: FormGroup;
  bsConfig: Partial<BsDatepickerConfig>;

  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  matriculaUser = this.currentUser.info.matricula;

  dtPesquisa: string;
  mesAtual: string;
  adminProfile = false;
  acessoDBAs = false;

  listagem: any = [];
  listagemLoaded = false;
  listagemEmpty = false;
  tooltipRitmo: any = {};
  totalGeral: any = {};

  listagemDBA: any = [];
  totaisDBA: any = [];
  listagemDBALoaded: boolean;
  listagemDBAEmpty: boolean;

  detalhesClasseEmpty = false;
  detalhesClasseLoaded = false;
  linha: number;

  detalhesTitulo: string;
  detalhesClasse: any = [];
  detalhesTotais: any = {};

  listagemExport: any = [];

  formEdit: any = {
    toneladaEditado: [0, 0, 0, 0, 0, 0, 0, 0],
    valorEditado: [0, 0, 0, 0, 0, 0, 0, 0],
    toneladaMeta: [0, 0, 0, 0, 0, 0, 0, 0],
    valorMeta: [0, 0, 0, 0, 0, 0, 0, 0],
  };

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
    private xlsxService: XlsxService,
    private posicaoDiariaService: ComercialRelatoriosPosicaoDiariaService,
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
    this.getPerfil();
    this.titleService.setTitle('Posição diária');
  }

  registrarAcesso() {
    this.atividadesService.registrarAcesso().subscribe();
  }

  setBreadCrumb() {
    this.activatedRoute.params.subscribe((params: any) => {
      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/comercial/home',
        },
        {
          descricao: 'Relatórios',
          routerLink: `/comercial/relatorios/${params.idSubModulo}`,
        },
        {
          descricao: 'Posição diária',
        },
      ];
    });
  }

  getPerfil() {
    this.posicaoDiariaService
      .getPerfis()
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
          this.setFormFilter();
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.success === true) {
            this.adminProfile = response.data.acessoAdmin;
            this.acessoDBAs = response.data.acessoDBAs;
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

  setFormFilter() {
    const formValue: any = this.checkRouterParams();

    this.form = this.formBuilder.group({
      data: [formValue.data, [Validators.required]],
    });
  }

  checkRouterParams(): Object {
    let formValue = {
      data: new Date(),
    };

    this.activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (queryParams: any) => {
        if (Object.keys(queryParams).length > 0) {
          let params = atob(queryParams.q);
          params = JSON.parse(params);

          this.search(params);
          this.onLoadRitmoDBA(params);

          Object.keys(formValue).forEach((formKey) => {
            Object.keys(params).forEach((paramKey) => {
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
          const params = {
            data: this.dateService.convertToUrlDate(new Date(formValue.data)),
          };

          this.search(params);
          this.onLoadRitmoDBA(params);
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

    params.data = this.dateService.convertToUrlDate(
      new Date(this.form.value.data)
    );

    return params;
  }

  setRouterParams(params: any): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { q: btoa(JSON.stringify(params)) },
    });
    this.search(params);
    this.onLoadRitmoDBA(params);
  }

  search(params: any) {
    this.loaderNavbar = true;
    this.listagemEmpty = false;
    this.listagemLoaded = false;

    this.posicaoDiariaService
      .getListaManetoni(params.data)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
          this.listagemLoaded = true;
          this.setDateFormValues();
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.success === true) {
            if (response.data.analitico && response.data.analitico.length > 0) {
              this.listagem = response.data.analitico;
              this.listagemExport = response.data;

              this.formEdit = {
                toneladaEditado: [],
                valorEditado: [],
                toneladaMeta: [],
                valorMeta: [],
              };

              for (let i = 0; i < this.listagem.length; i++) {
                if (this.listagem[i].linha != 'TOTAL LONGOS') {
                  this.formEdit.toneladaEditado[i] = this.listagem[i][
                    'toneladaEditado'
                  ];
                  this.formEdit.valorEditado[i] = this.listagem[i][
                    'valorEditado'
                  ];
                  this.formEdit.toneladaMeta[i] = this.listagem[i][
                    'toneladaMeta'
                  ];
                  this.formEdit.valorMeta[i] = this.listagem[i].valorMeta;
                }
              }

              this.tooltipRitmo = `Dias úteis até hoje: ${response.data.dias.ateHoje}. Dias úteis no mês: ${response.data.dias.uteisMes}`;
              this.tooltipRitmo = `<p class="mb-0">Dias úteis até hoje: ${response.data.dias.ateHoje}.</p><p class="mb-0">Dias úteis no mês: ${response.data.dias.uteisMes}.</p>`;
              this.totalGeral = response.data.total;
            } else {
              this.listagemEmpty = true;
            }
          } else {
            this.listagemEmpty = true;
          }
        },
        error: (error: any) => {
          this.listagemEmpty = true;
          this.pnotifyService.error();
        }
      });
  }

  onExibir(podeEditar: number) {
    return podeEditar === 1 ? true : false;
  }

  onLoadRitmoDBA(params: any) {
    if (this.acessoDBAs === true) {
      this.listagemDBALoaded = false;
      this.listagemDBAEmpty = false;

      this.posicaoDiariaService.getListaDBA(params.data).subscribe({
        next: (response: JsonResponse) => {
          if (response.success === true) {
            this.listagemDBA = response.data.analitico;
            this.totaisDBA = response.data.total;

            this.listagemDBALoaded = true;
          } else {
            this.listagemDBAEmpty = true;
          }
        },
        error: (error: any) => {
          this.pnotifyService.error();
        }
      });
    }
  }

  setDateFormValues(): void {
    const dia =
      this.form.value.data.getDate() < 10
        ? `0${this.form.value.data.getDate()}`
        : this.form.value.data.getDate();

    const mes =
      this.form.value.data.getMonth() + 1 < 10
        ? `0${this.form.value.data.getMonth() + 1}`
        : this.form.value.data.getMonth() + 1;

    this.dtPesquisa = `${dia}/${mes}/${this.form.value['data'].getFullYear()}`;

    this.mesAtual = `${this.dateService.getFullMonth(
      this.form.value.data
    )}/${this.form.value.data.getFullYear()}`;
  }

  onDetalhesFilter(detalhes: TemplateRef<any>, linha: string, ordem: number) {
    this.loaderNavbar = true;
    this.detalhesClasseLoaded = false;
    this.detalhesClasseEmpty = false;
    this.linha = ordem - 1;

    this.posicaoDiariaService
      .getDetalhesManetoni({
        data: this.dateService.convertToUrlDate(new Date(this.form.value.data)),
        ordem: ordem,
      })
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.success === true) {
            if (response.data.analitico && response.data.analitico.length > 0) {
              this.detalhesTitulo = linha;
              this.detalhesClasse = response.data.analitico;
              this.detalhesTotais = response.data.total;
              this.detalhesClasseLoaded = true;

              setTimeout(() => {
                this.openModal(detalhes);
              }, 500);
            } else {
              this.detalhesClasseEmpty = true;
            }
          }
        },
        error: (error: any) => {
          this.pnotifyService.error();
          this.location.back();
        }
      });
  }

  openModal(detalhes: TemplateRef<any>) {
    console.log(detalhes);
    this.modalRef = this.modalService.show(
      detalhes,
      Object.assign(
        {
          ignoreBackdropClick: true,
        },
        { class: 'modal-lg' }
      )
    );
  }

  onModalClose() {
    this.modalRef.hide();
    this.linha = -1;
  }

  onSubmit() {
    this.loaderNavbar = true;

    let i: number = 0,
      formObj: any = [];

    while (i < 9) {
      if (i != 6 && i != 8) {
        formObj.push({
          toneladaEditado: this.formEdit.toneladaEditado[i],
          valorEditado: this.formEdit.valorEditado[i],
          toneladaMeta: this.formEdit.toneladaMeta[i],
          valorMeta: this.formEdit.valorMeta[i],
        });
      }

      i++;
    }

    let params: any = {
      dados: formObj,
      periodo: this.dateService.convertToUrlDate(
        new Date(this.form.value.data)
      ),
    };

    if (params.dados.length > 0) {
      this.posicaoDiariaService
        .postRitmoEditado(params)
        .pipe(
          finalize(() => {
            this.loaderNavbar = false;
            this.setFormFilter();
          })
        )
        .subscribe(
          (reponse: JsonResponse) => {
            if (reponse.success === true) {
              this.pnotifyService.success('Dados salvos com sucesso.');
            } else {
              this.pnotifyService.notice(
                'Dados não foram salvos, favor tentar novamente.'
              );
            }
          },
          (error: any) => {
            this.pnotifyService.notice(
              'Dados não foram salvos, favor tentar novamente.'
            );
          }
        );
    } else {
      this.pnotifyService.notice('Favor verificar dados.');
    }
  }

  onExport() {
    let data = new Date().toLocaleDateString().split('/'),
      dataExport = `${data[0]}${data[1]}${data[2]}`;

    let dados: any = [],
      listagemExport: any = [];

    dados = this.listagem.concat(this.totalGeral);

    dados.forEach((item, key) => {
      listagemExport[key] = {
        Linha: item.linha,
        ToneladaHoje: item.toneladaHoje,
        ValorHoje: item.valorHoje,
        ToneladaMesAtual: item.toneladaMesAtual,
        ValorMesAtual: item.valorMesAtual,
        ToneladaRitmo: item.toneladaRitmo,
        ValorRitmo: item.valorRitmo,
        ToneladaEditado: item.toneladaEditado,
        ValorEditado: item.valorEditado,
        ToneladaMeta: item.toneladaMeta,
        ValorMeta: item.valorMeta,
        ToneladaMetaEditado: item.toneladaMetaEditado,
        ValorMetaEditado: item.valorMetaEditado,
      };
    });

    this.xlsxService.exportFile(listagemExport, `PosicaoDiaria_${dataExport}`);
  }

  classComparativo(value: number) {
    let textClass = '';

    if (value > 0) {
      textClass = 'text-success';
    } else if (value < 0) {
      textClass = 'text-danger';
    }

    return textClass;
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
