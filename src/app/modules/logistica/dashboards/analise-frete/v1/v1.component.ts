import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
// angular
import {
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';

// ngx
import {
  BsLocaleService,
  BsDatepickerConfig,
  BsModalService,
  BsModalRef,
} from 'ngx-bootstrap';

// rxjs
import { forkJoin, Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

// services
import { environment } from 'src/environments/environment';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { DateService } from 'src/app/shared/services/core/date.service';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { LogisticaDashboardsAnaliseFreteService } from '../services/analise-frete.service';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { LogisticaEntregaFusionService } from '../../../entrega/services/fusion.service';
import { LogisticaFiliaisService } from '../../../cadastros/filiais/services/filiais.service';

@Component({
  selector: 'logistica-dashboards-frete-sintetico',
  templateUrl: './v1.component.html',
  styleUrls: ['./v1.component.scss'],
})
export class LogisticaDashboardsAnaliseFreteV1Component implements OnInit {
  breadCrumbTree: any = [
    {
      descricao: 'Logistica',
    },
    {
      descricao: 'Dashboards',
    },
  ];

  bsConfig: Partial<BsDatepickerConfig>;
  modalRef: BsModalRef;

  info: string;
  $subscription: Subscription;
  config = {
    grafico01: null,
    grafico02: null,
    grafico03: null,
    grafico04: null,
    grafico05: null,
    grafico06: null,
  };

  private readonly API = environment.API;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  matricula = this.currentUser['info']['matricula'];

  dataLoaded = true;
  permission = false;

  form: FormGroup;
  empresas: any = [];

  filtered: boolean;

  data = {
    conjunto01: {
      data: {},
      empty: true,
      keys: [],
      loading: false,
      show: false,
    },
    conjunto02: {
      data: {},
      empty: false,
      keys: [],
      loading: false,
      show: false,
    },
    conjunto03: {
      data: {},
      empty: true,
      keys: [],
      loading: false,
      show: false,
    },
    conjunto04: {
      data: {},
      empty: true,
      keys: [],
      loading: false,
      show: false,
    },
  };

  params = {
    TMS: {
      conjunto01: {
        parametro: 1,
        agregacao: 'PERIODO',
      },
      conjunto02: {
        parametro: 1,
        agregacao: 'TIPO_VEICULO',
      },
      conjunto03: {
        parametro: 1,
        agregacao: 'SEM_AGREGACAO',
      },
      conjunto04: {
        parametro: 1,
        agregacao: 'MODALIDADE',
      },
    },
    Fusion: {
      conjunto01: {
        parametro: 2,
        agregacao: 'PERIODO',
      },
      conjunto02: {
        parametro: 2,
        agregacao: 'TIPO_VEICULO',
      },
      conjunto03: {
        parametro: 2,
        agregacao: 'SEM_AGREGACAO',
      },
      conjunto04: {
        parametro: 2,
        agregacao: 'MODALIDADE',
      },
    },
  };

  rotulos = [];

  appTitle = 'Análisis de Fletes I';

  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: false,
    isFixed: true,
    border: false,
    small: false,
    hover: false,
    theme: {
      color: 'white',
    },
  };

  loading: boolean = true;

  /* bsConfig: Partial<BsDatepickerConfig>; */

  orderBy = 'Frete';
  orderType = 'DESC';

  constructor(
    private activatedRoute: ActivatedRoute,
    private atividadesService: AtividadesService,
    private formBuilder: FormBuilder,
    private localeService: BsLocaleService,
    private router: Router,
    private http: HttpClient,
    private pnotify: PNotifyService,
    private dateService: DateService,
    private service: LogisticaDashboardsAnaliseFreteService,
    private routeService: RouterService,
    private filiaisService: LogisticaFiliaisService
  ) {
    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );

    this.form = this.formBuilder.group({
      projeto: [null, Validators.required],
      dataInicial: [dateService.getFirstDayMonth(), Validators.required],
      dataFinal: [new Date(), Validators.required],
      origem: ['Fusion'],
      timestamp: [new Date().getTime()],
    });
  }

  ngOnInit() {
    this.atividadesService.registrarAcesso().subscribe();
    this.getEmpresas();
    this.getRotulos();
    setTimeout(() => {
      this.onActiveRoute();
    }, 1000)
    //this.getUltimaAtualizacao();
    this.setBreadCrumb();
  }

  setBreadCrumb() {
    const params = this.activatedRoute.snapshot.params;
    const submoduloId = params?.idSubModulo;

    this.breadCrumbTree = [
      {
        descricao: 'Logistica',
      },
      {
        descricao: 'Dashboards',
        routerLink: `/logistica/dashboards/${submoduloId}`,
      },
      {
        descricao: this.appTitle,
      },
    ];
  }

  onActiveRoute() {
    this.activatedRoute.queryParams.subscribe((response) => {
      let _params = JSON.parse(
        JSON.stringify(this.routeService.getBase64UrlParams(response))
      );

      if (_params == undefined) {
        return;
      }

      if (Object.keys(_params).length == 0) {
        return;
      }

      _params.projeto = _params?.projeto?.split(',');

      this.form.patchValue(_params);

      this.getIndicadores(this.getParams());

      this.filtered = true;
    });
  }

  getEmpresas() {
    this.loading = true;
    this.filiaisService.getFiliais({ status: '1' })
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: response => {
          this.empresas = response.body['data'];
        },
        error: () => {
          this.pnotify.error();
        }
      })
  }

  getParams() {
    let _params = {};
    let _obj = this.form.value;

    for (let prop in _obj) {
      if (!_obj[prop]) continue;
      else if (_obj[prop] instanceof Date)
        _params[prop] = this.dateService.convertToUrlDate(_obj[prop]);
      else if (Array.isArray(_obj[prop])) _params[prop] = _obj[prop].toString();
      else _params[prop] = _obj[prop];
    }

    return _params;
  }

  scrollintoView(event, $element) {
    $element.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
      inline: 'nearest',
    });
  }

  onFilter() {
    this.form.get('timestamp').setValue(new Date().getTime());

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routeService.setBase64UrlParams(this.getParams()),
    });
  }

  /* getUltimaAtualizacao() {
    this.info = undefined;
    this.http.get(`${this.API}/logistica/indicadores/ultima-atualizacao`, { observe: "response" })
      .subscribe(
        (data) => {
          if (data.status === 200) {
            this.info = `Última atualização: ${data.body["ultimaAtualizacao"]}`;
          }
        }
      )
  } */

  /* CSS - Campos requeridos */
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

  onFieldInvalid(field: any) {
    field = this.form.get(field);

    return field.status == 'INVALID' && field.touched;
  }

  getIndicadores(params?) {
    this.getConjunto01(params);
    this.getConjunto02(params);
    this.getConjunto03(params);
    this.getConjunto04(params);
  }

  getConjunto01(params) {
    this.data.conjunto01.empty = false;
    this.data.conjunto01.loading = true;
    this.data.conjunto01.show = false;

    let dataInicial = this.dateService.convertToUrlDate(
      this.onBackMonths(this.form.get('dataInicial').value, 12)
    );

    let origem = this.form.get('origem').value;

    let _params = {
      ...params,
      dataInicial: dataInicial,
      ...this.params[origem].conjunto01,
    };

    let requests = [];

    requests.push(
      this.service.getIndicadores({ ..._params, tipoRetorno: 'grafico' })
    );
    requests.push(
      this.service.getIndicadores({
        ..._params,
        tipoRetorno: 'grafico',
        inMedia: 1,
      })
    );

    forkJoin(requests)
      .pipe(
        finalize(() => {
          this.data.conjunto01.loading = false;
        })
      )
      .subscribe(
        (responses: Array<any>) => {
          if (responses[0].status != 200) {
            this.data.conjunto01.data = {};
            this.data.conjunto01.keys = [];
            this.data.conjunto01.empty = true;
            return;
          }

          const data = responses[0].body['data'];

          if (responses[1].status == 200) {
            for (const key in responses[1].body['data']) {
              let media = {
                categoria: 'Promedio',
                media: responses[1].body['data'][key][0]['valor'],
              };

              data[key].push(media);
            }
          }

          this.data.conjunto01.empty = false;
          this.data.conjunto01.show = true;
          this.data.conjunto01.data = data;
          this.data.conjunto01.keys = Object.keys(data);
        },
        (error) => {
          this.data.conjunto01.empty = true;
          this.pnotify.error();
        }
      );
  }

  getConjunto02(params) {
    this.data.conjunto02.empty = false;
    this.data.conjunto02.loading = true;
    this.data.conjunto02.show = false;

    let origem = this.form.get('origem').value;

    let _params = { ...params, ...this.params[origem].conjunto02 };

    this.service
      .getIndicadores({ ..._params, tipoRetorno: 'grafico' })
      .pipe(
        finalize(() => {
          this.data.conjunto02.loading = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status != 200) {
            this.data.conjunto02.empty = true;
            this.data.conjunto02.data = {};
            this.data.conjunto02.keys = [];
            return;
          }

          if (response.status != 200) {
            this.data.conjunto02.empty = true;
            this.data.conjunto02.data = {};
            this.data.conjunto02.keys = [];
            return;
          }
          this.data.conjunto02.empty = false;
          this.data.conjunto02.show = true;
          this.data.conjunto02.data = response.body['data'];
          this.data.conjunto02.keys = Object.keys(this.data.conjunto02.data);
        },
        (error) => {
          this.data.conjunto02.empty = true;
          this.pnotify.error();
        }
      );
  }

  getConjunto03(params) {
    this.data.conjunto03.empty = false;
    this.data.conjunto03.loading = true;
    this.data.conjunto03.show = false;

    let origem = this.form.get('origem').value;

    let _params = { ...params, ...this.params[origem].conjunto03 };

    this.service
      .getIndicadores(_params)
      .pipe(
        finalize(() => {
          this.data.conjunto03.loading = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status != 200) {
            this.data.conjunto03.data = {};
            this.data.conjunto03.keys = [];
            this.data.conjunto03.empty = true;
            return;
          }

          const data = response.body['data'][0];
          this.data.conjunto03.empty = false;
          this.data.conjunto03.show = true;
          this.data.conjunto03.data = data;
          this.data.conjunto03.keys = Object.keys(data);
        },
        (error) => {
          this.data.conjunto03.empty = true;
          this.pnotify.error();
        }
      );
  }

  getConjunto04(params) {
    this.data.conjunto04.empty = false;
    this.data.conjunto04.loading = true;
    this.data.conjunto04.show = false;

    let origem = this.form.get('origem').value;

    let _params = { ...params, ...this.params[origem].conjunto04 };

    this.service
      .getIndicadores({ ..._params, tipoRetorno: 'grafico' })
      .pipe(
        finalize(() => {
          this.data.conjunto04.loading = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status != 200) {
            this.data.conjunto04.data = {};
            this.data.conjunto04.keys = [];
            this.data.conjunto04.empty = true;
            return;
          }

          const data = response.body['data'];
          this.data.conjunto04.empty = false;
          this.data.conjunto04.show = true;
          this.data.conjunto04.data = data;
          this.data.conjunto04.keys = Object.keys(data);
        },
        (error) => {
          this.data.conjunto04.empty = true;
          this.pnotify.error();
        }
      );
  }

  onBackMonths(reference: string, months: number): Date {
    let _date = this.dateService.convertStringToDate(reference, 'pt-br');

    _date = _date instanceof Date ? _date : new Date(_date);

    _date = new Date(_date.setMonth(_date.getMonth() - months));
    _date = new Date(_date.setDate(1));

    return _date;
  }

  getRotulos() {
    this.service.getRotulos().subscribe((response) => {
      if (response.status != 200) {
        return;
      }

      this.rotulos = response.body['data'];
    });
  }

  onConfig(id, size) {
    this.config[id] = size;
  }

  getCardValue(key) {
    const value = this.data?.conjunto03?.data[key];

    if (!value) {
      return 0;
    }

    return value['valor'];
  }
}
