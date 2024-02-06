import { CustomTableConfig } from './../../../../../../shared/templates/custom-table/models/config';
import { Router, ActivatedRoute } from '@angular/router';
import { PNotifyService } from './../../../../../../shared/services/core/pnotify.service';
import { RouterService } from './../../../../../../shared/services/core/router.service';
import { DateService } from './../../../../../../shared/services/core/date.service';
import { DetailPanelService } from 'src/app/shared/templates/detail-panel/detal-panel.service';

import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ComercialIntegracoesServicosIntegracaoMateriaisComponent } from '../../services/associacao-materiais.service';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';

@Component({
  selector: 'lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
  providers: [DetailPanelService],
})
export class ComercialIntegracoesDagdaIntegracaoMateriaisListaComponent
  implements OnInit, OnDestroy
{
  currentUser: any = JSON.parse(localStorage.getItem('currentUser'));
  idMtcorp: any = this.currentUser['info']['id'];
  spinnerFullScreen: boolean = true;
  loaderNavbar: boolean = false;
  breadCrumbTree: any = [];
  noResult = false;
  listas: any = [];
  detalhes: any = [];
  linhas: [];
  despartamentos: [];
  classes: [];
  loadingLinhas: boolean;
  loadingDepartamentos: boolean;
  loadingClasses: boolean;
  form: FormGroup;
  bsConfig: Partial<BsDatepickerConfig>;
  $activateRoutedSubscription: Subscription;
  data: Date = new Date();
  dadosEmpty = false;
  dadosEmptyDetalhes = false;

  appTitle = 'Descuento de materiales';
  panelTitle = 'Descuento';

  situacao = [
    {
      cd: '',
      ds: 'Todos',
    },
    {
      cd: '0',
      ds: 'Inactivo',
    },
    {
      cd: '1',
      ds: 'Activo',
    },
  ];

  reg = [
    {
      cd: 10,
      ds: '10',
    },
    {
      cd: 25,
      ds: '25',
    },
    {
      cd: 50,
      ds: '50',
    },
    {
      cd: 100,
      ds: '100',
    },
    {
      cd: 200,
      ds: '200',
    },
    {
      cd: 300,
      ds: '300',
    }, 
  ];

  integrados = [
    {
      cd: '1',
      ds: 'Vinculados',
    },
    {
      cd: '0',
      ds: 'Não Vinculados',
    },
  ];

  /* Paginação */
  itemsPerPage: number = 10;
  totalItems: number;
  currentPage: number = 1;
  begin: number = 0;
  end: number = this.itemsPerPage;

  orderBy = 'DS.id';
  orderType = 'ASC';

  /* Config Table */
  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
  };

  /* Painel de detalhes */
  $showDetailPanelSubscription: Subscription;
  showDetailPanel = false;

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private dateService: DateService,
    private localeService: BsLocaleService,
    private routerService: RouterService,
    private pnotify: PNotifyService,
    private route: Router,
    private detailPanelService: DetailPanelService,
    private associacaoService: ComercialIntegracoesServicosIntegracaoMateriaisComponent
  ) {
    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );

    this.form = this.formBuilder.group({
      codigoMaterial: [null],
      nomMaterial: [null],
      cdDagda: [null],
      status: [null],
      id_dep: [null],
      idMatTidDagda: null,
      inCada: null,
      registros: 10,
      pagina: this.currentPage,
      orderBy: this.orderBy,
      orderType: this.orderType,
    /*   time: [new Date().getTime()], */
    });
  }

  ngOnInit(): void {
    this.setBreadCrumb();
    this.getActiveRoute();
    this.getDepartamento();
    this.onSubscription();
  }

  ngOnDestroy() {
    this.$activateRoutedSubscription.unsubscribe();
    this.$showDetailPanelSubscription.unsubscribe();
  }

  onFilter() {
    /* this.form.get('time').setValue(new Date().getTime()); */
    this.loaderNavbar = true;
    this.detailPanelService.hide();
    if (this.form.value['registros']) {
      this.itemsPerPage = this.form.value['registros'];
      this.end = this.form.value['registros'];
    }
    this.route.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams()),
    });
  }

  getActiveRoute() {
    this.spinnerFullScreen = true;
    this.$activateRoutedSubscription =
      this.activatedRoute.queryParams.subscribe((response) => {
        if (Object.keys(response).length > 0) {
          const _response = this.routerService.getBase64UrlParams(response);
          this.form.patchValue(_response);
        }

        if (this.form.get('cdDagda').value) {
          this.getDetalhes({ cdDagda: this.getParams()['cdDagda'] });
        } else {
          this.getAssociacao(this.getParams());
        }
      });
  }

  setBreadCrumb() {
    const id = this.activatedRoute.snapshot.params.idSubModulo;
    this.breadCrumbTree = [
      {
        descricao: 'Home',
        routerLink: `/comercial/home`,
      },
      {
        descricao: 'Materiales',
        routerLink: `/comercial/integracoes/dagda/${id}`,
      },
      {
        descricao: this.appTitle,
      },
    ];
  }

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

  getAssociacao(params: any) {
    if (params === 0) {
      this.dadosEmpty = true;
      this.noResult = false;
      this.spinnerFullScreen = false;
      this.loaderNavbar = false;
      return;
    } else {
      this.loaderNavbar = true;
      this.associacaoService
        .getAssociacao(params)
        .pipe(
          finalize(() => {
            this.spinnerFullScreen = false;
            this.loaderNavbar = false;
          })
        )
        .subscribe({
          next: (response) => {
            if (response.status != 200) {
              this.dadosEmpty = true;
              this.noResult = false;
              this.pnotify.notice('¡No se encontraron registros!');
              this.listas = [];
              return;
            }
            this.listas = response.body['data'];
            this.totalItems = response.body['data'].length;
            this.noResult = true;
          },
          error: (error) => this.pnotify.error(),
        });
    }
  }

  /* Paginação */
  onPageChanged(event: PageChangedEvent): void {
    this.begin = (event.page - 1) * event.itemsPerPage;
    this.end = event.page * event.itemsPerPage;
  }

  getParams() {
    let _params = {};
    let _obj = this.form.value;

    for (let prop in _obj) {
      if (_obj[prop]) {
        if (_obj[prop] instanceof Date)
          _params[prop] = this.dateService
            .convertToBrazilianDate(_obj[prop])
            .substring(0, 10);
        else _params[prop] = _obj[prop];
      }
    }

    return _params;
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
    this.form.get('orderBy').setValue(this.orderBy);
    this.form.get('orderType').setValue(this.orderType);
    this.onFilter();
  }

  onEdit(item) {
    this.route.navigate(['./', item.ID_MATE_TID], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(item),
    });
  }

  onEditStatus(param) {
    this.loaderNavbar = true;
    param.estado = param.estado == 1 ? 0 : 1;
    const params = {
      id_descuento: param.id,
      codigo_material: param.CODIGOMATERIAL,
      status: param.estado,
      user: this.idMtcorp,
    };

    this.associacaoService
      .onSubmit(params)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe({
        next: (response) => {
          if (response.status === 200) {
            this.pnotify.success('El estado cambió exitosamente');
            this.getAssociacao(this.getParams());
          }
        },
        error: (error) => this.pnotify.error(),
      });
  }

 /*  getLinhas() {
    this.loadingLinhas = true;

    this.associacaoService.getLinhas().subscribe((response) => {
      if (response.body['responseCode'] != 200) {
        this.pnotify.notice('Nenhuma linha foi encontrada!');
        this.loadingLinhas = false;
      } else {
        this.loadingLinhas = false;
        this.linhas = response.body['result'];
      }
    });
  } */

  getDepartamento() {
    this.loadingDepartamentos = true;

    this.associacaoService.getDepartamento().subscribe((response) => {
      if (response.body['responseCode'] != 200) {
        this.pnotify.notice('¡No se encontraron!');
        this.loadingDepartamentos = false;
      } else {
        this.loadingDepartamentos = false;
        this.despartamentos = response.body['result'];
      }
    });
  }

/*   getClasses() {
    this.loadingClasses = true;
    let idlinha = {
      ID_LINH:
        this.form.get('ID_LINH').value == null
          ? ''
          : this.form.get('ID_LINH').value,
    };
    this.associacaoService.getClasses(idlinha).subscribe((response) => {
      if (response.body['responseCode'] == 200) {
        this.loadingClasses = false;
        this.classes = response.body['result'];
      } else {
        this.pnotify.notice('Nenhuma classe foi encontrada!');
        this.loadingClasses = false;
      }
    });
  } */

  onSubscription() {
    this.$showDetailPanelSubscription =
      this.detailPanelService.config.subscribe((event: any) => {
        this.showDetailPanel = event.showing;
      });
  }

  onDetailPanel(param): void {
    if (param.estado== 0) {
      return;
    } else {
      this.detailPanelService.show();
      this.getDetalhes({codigoMaterial: param.ID_MATE_TID });
    }
  }

  getDetalhes(param) {
    let params = {};
    this.associacaoService
      .getDetalhes(param)
      .pipe(
        finalize(() => {
          if (this.showDetailPanel) {
            this.detailPanelService.loadedFinished(false);
          }
        })
      )
      .subscribe((response) => {
        if (response.status == 200) {
          this.detalhes = response.body['data'];
          params = { codigoMaterial: this.detalhes[0]['ID_MATE_TID'] };
          this.dadosEmptyDetalhes = false;

          if (this.form.get('cdDagda').value && this.showDetailPanel == false) {
            this.getAssociacao({
              params,
            });
          }
        } else {
          this.pnotify.notice('¡No se encontraron asociaciones!');
          this.detalhes = [];
          this.dadosEmptyDetalhes = true;
          this.getAssociacao(0);
        }
      });
  }

  deleteAssociacao(i, param): void {
    this.detalhes.splice(i, 1);
    const params = {
      idMatTidDagda: param.ID,
      cdMatTid: param.ID_MATE_TID,
      cdMatDagda: param.ID_MATE_DAGD,
      user: this.idMtcorp,
    };

    this.associacaoService.deleteAssociacao(params).subscribe((response) => {
      this.pnotify.success('Associação removida com sucesso');
      this.getDetalhes({ codigoMaterial: param.ID_MATE_TID });
    });
  }

  disableForm() {
    if (this.form.get('cdDagda').value) {
      this.form.get('ID_LINH').disable();
      this.form.get('ID_CLAS').disable();
    } else {
      this.form.get('ID_LINH').enable();
      this.form.get('ID_CLAS').enable();
    }
  }
}
