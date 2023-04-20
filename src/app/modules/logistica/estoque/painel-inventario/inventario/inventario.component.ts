import { Component, OnInit, OnDestroy } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { Subscription } from 'rxjs';
import { LogisticaEstoquePainelInventarioInventarioService } from './inventario.service';
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { DateService } from 'src/app/shared/services/core/date.service';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { object } from '@amcharts/amcharts4/core';
import { DetailPanelService } from 'src/app/shared/templates/detail-panel/detal-panel.service';

@Component({
  selector: 'inventario',
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.scss'],
})
export class LogisticaEstoquePainelInventarioInventarioComponent
  implements OnInit, OnDestroy {
  form: FormGroup;
  bsConfig: Partial<BsDatepickerConfig>;
  listaInventarios: any = [];
  inventarios: any = [];
  totalItems: number;
  loaderNavbar: boolean = false;
  spinnerFullScreen: boolean = true;
  loading: boolean = true;
  ultimoStatusEnviado: any = null;
  noResult: boolean = true;
  noResultado: boolean = true;
  noLista: boolean = true;
  $subscription: Subscription;
  inve: any = [];
  compressedTable = false;
  idInventario: number;
  infoClasses = '';
  infoLinha = '';
  infoIdInventario = '';
  $activatedRouteSubscription: Subscription;

  appTitle = 'Painel de inventário';

  /* Parametros para filtros */
  tipo: any;
  empresas: any;
  depositos: any;
  linhas: any;
  classes: any;
  materiais: any;
  dataInicial: any;
  dataFinal: any;
  cdInventario = '';
  sigla: any;
  informacoes: any;
  parametro: boolean = false;
  checked: boolean = true;
  /* Parametros para filtros */

  filtroEmpresas: any = [];
  filtroDepositos: any = [];
  filtroLinhas: any = [];
  filtroClasses: any = [];
  filtroMateriais: any = [];

  dadosEmpty = false;
  breadCrumbTree: Array<Breadcrumb> = [
    {
      descricao: this.appTitle,
    },
  ];

  /* Paginação */
  itemsPerPage: number = 10;
  currentPage: number = 1;
  /* Paginação */

  /* Legendas */
  subtitles: Array<Subtitles> = [
    {
      id: 'LOGI_INVE_STAT_ABER',
      text: 'Em aberto',
      color: 'yellow',
    },
    {
      id: 'LOGI_INVE_STAT_CANC',
      text: 'Cancelado',
      color: 'red',
    },
    {
      id: 'LOGI_INVE_STAT_CANC_SIST',
      text: 'Cancelado pelo sistema',
      color: 'gray',
    },
    {
      id: 'LOGI_INVE_STAT_FINA',
      text: 'Finalizado',
      color: 'green',
    },
    {
      id: 'LOGI_INVE_STAT_APRO',
      text: 'Aprovado',
      color: 'blue',
    },
  ];
  /* Legendas */

  /* TIPOS DE INVENTÁRIOS */
  tipoInventario: any = [
    {
      value: 1,
      descNome: 'Inventário oficial',
    },
    {
      value: 2,
      descNome: 'Inventário rotativo',
    },
  ];

  /* Config Table */
  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
  };

  /* Painel de detalhes */
  $showDetailPanelSubscription: Subscription;
  showDetailPanel = false;

  constructor(
    private inventarioService: LogisticaEstoquePainelInventarioInventarioService,
    private activatedRoute: ActivatedRoute,
    private notice: PNotifyService,
    private route: Router,
    private atividadesService: AtividadesService,
    private localeService: BsLocaleService,
    private formBuilder: FormBuilder,
    private dateService: DateService,
    private routerService: RouterService,
    private detailPanelService: DetailPanelService
  ) {
    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );

    this.form = this.formBuilder.group({
      tipoInventario: [null],
      empresa: [null],
      depositos: [null],
      linhas: [null],
      classes: [null],
      materiais: [null],
      dataInicial: [''],
      dataFinal: [''],
      cdInventario: [null],
      sigla: [null],
      pagina: 1,
    });
  }

  ngOnInit() {
    this.atividadesService.registrarAcesso().subscribe();

    /* CODIFICAÇÃO E DECODIFICAÇÃO DA ROTA */
    this.$activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (response) => {
        if (Object.keys(response).length !== 0) {
          const _response = this.routerService.getBase64UrlParams(response);
          this.form.patchValue(_response);
        }
        this.getInventario(this.getParams());
      }
    );

    /* INICIO FILTROS INICIAIS */
    this.inventarioService
      .getEmpresas()
      .pipe(
        finalize(() => {
          this.spinnerFullScreen = false;
        })
      )
      .subscribe((response: any) => {
        if (Object.keys(response).length > 0) {
          this.empresas = response;
        }
      });

    this.inventarioService
      .getLinhas()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((response: any) => {
        if (Object.keys(response).length > 0) {
          this.linhas = response;
        }
      });

    this.onDetailPanel();
  }

  onDetailPanel(): void {
    this.$showDetailPanelSubscription = this.detailPanelService.config.subscribe(
      (event: any) => {
        this.showDetailPanel = event.showing;
      }
    );
  }

  ngOnDestroy(): void {
    this.$activatedRouteSubscription.unsubscribe();
    this.$showDetailPanelSubscription.unsubscribe();
  }

  getParams() {
    let _params = {};
    const obj = this.form.value;

    for (let prop in obj) {
      if (obj[prop]) {
        if (prop == 'dataInicial' || prop == 'dataFinal') {
          _params[prop] =
            obj[prop] instanceof Date
              ? this.dateService.convertToUrlDate(obj[prop])
              : obj[prop].substring(0, 10);
        } else {
          _params[prop] = obj[prop];
        }
      }
    }
    return _params;
  }

  onSearch() {
    this.route.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams()),
    });
  }

  getDepositos() {
    this.loaderNavbar = true;

    if (this.form.get('empresa').status === 'VALID') {
      let idEmpresa = this.form.get('empresa').value;
      this.inventarioService
        .getDepositos(idEmpresa)
        .subscribe((response: any) => {
          if (Object.keys(response).length > 0) {
            this.depositos = response;
          }
          this.loaderNavbar = false;
        });
    }
  }

  getClasses() {
    this.classes = [];
    let descricaoLinhas = [];
    this.loaderNavbar = true;

    if (this.form.get('linhas').status === 'VALID') {
      descricaoLinhas.push(this.form.get('linhas').value);
      this.inventarioService
        .getClasses(descricaoLinhas)
        .subscribe((response: any) => {
          if (Object.keys(response).length > 0) {
            this.classes = response;
          }
          this.loaderNavbar = false;
        });
    }
  }

  getMateriais(linhas, classes) {
    this.materiais = [];
    this.loaderNavbar = true;

    if (
      this.form.get('linhas').status === 'VALID' ||
      this.form.get('classes').status === 'VALID'
    ) {
      let descricaoLinhas = this.form.get('linhas').value;
      let idClasses = this.form.get('classes').value;
      this.inventarioService
        .getMateriais(descricaoLinhas, idClasses)
        .subscribe((response: any) => {
          if (Object.keys(response).length > 0) {
            this.materiais = response.result;
          }
          this.loaderNavbar = false;
        });
    }
  }

  getInventario(params?) {
    this.loaderNavbar = true;
    this.spinnerFullScreen = true;
    this.checked = !this.checked;

    this.inventarioService
      .getInventario(params)
      .pipe(
        finalize(() => {
          this.spinnerFullScreen = false;
          this.loaderNavbar = false;
        })
      )
      .subscribe(
        (data) => {
          if (data.status === 200) {
            this.noResult = false;
            this.inve = data['body']['data']['inventarios'];
            this.inventarios = data['body']['data']['inventarios'];
            let lancamentos = [];
            this.inventarios.forEach((element) => {
              if (element.empresa || element.deposito) {
                lancamentos.push({
                  empresa: element.empresa,
                  deposito: element.deposito,
                });
              }
            });
            this.loaderNavbar = false;
            this.informacoes = lancamentos;

            if (!this.totalItems) {
              this.totalItems = data['body']['data']['qtRegistros'];
            }
          } else if (data.status === 204) {
            this.notice.notice('Nenhum resultado para sua pesquisa');
            this.dadosEmpty = true;
          } else {
            this.notice.error();
          }
        },
        (error) => {
          this.notice.notice(
            'Não há inventários cadastrados para esse status.'
          );
          this.dadosEmpty = true;
        }
      );
  }

  getClassesInventario(idInventario, i) {
    this.detailPanelService.show();
    this.noLista = true;
    this.noResultado = false;
    this.inventarioService
      .getClassesInventario(idInventario)
      .pipe(
        finalize(() => {
          this.detailPanelService.loadedFinished(false);
        })
      )
      .subscribe((response: any) => {
        if (response['status'] === 200) {
          response.body.data.forEach((element) => {
            if (element.dsClasse == null) {
              this.noResultado = true;
            } else {
              this.noLista = false;
              this.infoClasses = response.body.data;
            }
          });
        }
      });
    this.compressedTable = true;
    this.infoLinha = this.inve[i].dsLinha;
    this.infoIdInventario = this.inve[i].idInventario;
  }

  /* Paginação */
  onPageChanged(event: PageChangedEvent): void {
    const page = event.page;
    this.form.get('pagina').setValue(page);
    this.onSearch();
  }
  /* Paginação */

  abrirInventario(idInventario, idStatusInventario) {
    this.route.navigate([`../${idInventario}/contagem-materiais`], {
      relativeTo: this.activatedRoute,
    });
  }

  abrirRelatorio(idInventario) {
    this.route.navigate([`../${idInventario}/relatorio`], {
      relativeTo: this.activatedRoute,
    });
  }

  openModal(index) {
    this.idInventario = this.inventarios[index].idInventario;
    this.compressedTable = true;
  }

  onClose() {
    this.compressedTable = false;
  }

  /* clickEvent(inventario) {
    this.inventarios.forEach(element => {
      if (element.idInventario != inventario.idInventario) {
        element.status = false;
      } else if (inventario.status == true) {
        inventario.status = true;
      } else {
        inventario.status = !inventario.status;
      }
      this.detailPanelService.hide();
    });
  } */

  onFieldError(field: string) {
    if (this.onFieldInvalid(field)) {
      return 'is-invalid';
    }
    return '';
  }

  onFieldInvalid(field: any) {
    field = this.form.get(field);
    return field.status == 'INVALID' && field.touched;
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

  onClickSubtitle(id): void {
    this.form.get('sigla').setValue(id);
    this.onSearch();
  }

  onCadastrar() {
    this.route.navigate(['../cadastro'], {
      relativeTo: this.activatedRoute,
    });
  }
}
