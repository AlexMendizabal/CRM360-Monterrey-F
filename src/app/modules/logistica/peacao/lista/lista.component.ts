//angular
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

//ngx
import { BsDatepickerConfig, BsLocaleService, PageChangedEvent } from 'ngx-bootstrap';

//models
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { ILogisticaPeacao } from '../models/peacao';
import { ILogisticaSteelLogEmpresa } from '../../models/steellog/empresa';

//rxjs
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

//services
import { RouterService } from 'src/app/shared/services/core/router.service';
import { DateService } from 'src/app/shared/services/core/date.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { LogisticaPeacaoService } from '../services/peacao.service';
import { LogisticaSteellogService } from '../../services/steellog.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { AdminPerfisService } from 'src/app/modules/admin/perfis/services/perfis.service';

@Component({
  selector: 'logistica-peacao-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss']
})
export class LogisticaPeacaoListaComponent implements OnInit {

  form: FormGroup;

  appTitle: string = "Peação";
  breadCrumbTree: any = [];

  bsConfig: Partial<BsDatepickerConfig>;

  /* Pagination */
  itemsPerPage: number = 100;
  currentPage: number = 1;
  totalItems: any = 0;
  begin: number = 0;
  end: number = this.itemsPerPage;
  /* Pagination */

  subtitles: Array<Subtitles> = [
    {
      id: 1,
      text: 'Ativo',
      color: 'green',
    },
    {
      id: 2,
      text: 'Inativo',
      color: 'red',
    },
  ];

  items: ILogisticaPeacao[] = [];

  empresas: ILogisticaSteelLogEmpresa[] = [];

  /*loading*/
  loading = true;
  loadingNavBar = false;
  noResult = true;
  /*loading*/

  inAcessoExcluir: boolean;

  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true
  };

  $activatedRouteSubscription: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private routerService: RouterService,
    private localeService: BsLocaleService,
    private dateService: DateService,
    private atividadesService: AtividadesService,
    private pnotify: PNotifyService,
    private logisticaPeacaoService: LogisticaPeacaoService,
    private steelLogService: LogisticaSteellogService,
    private confirmModalService: ConfirmModalService,
    private perfilService: AdminPerfisService
  ) {

    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );
  }

  ngOnInit(): void {
    this.buildForm();
    this.registraAcesso()
    this.setBreadCrumb();
    this.onActivatedRoute();
    this.getEmpresas();
    this.verificaPerfil();
  }

  ngOnDestroy() {
    this.$activatedRouteSubscription.unsubscribe();
  }

  onActivatedRoute() {
    this.$activatedRouteSubscription = this.activatedRoute.queryParams
      .subscribe(
        (response) => {

          let _response = this.routerService.getBase64UrlParams(response);

          if (Object.keys(_response).length > 0)
            this.form.patchValue(_response);

          if (_response.hasOwnProperty('TT_REGI_PAGI'))
            this.itemsPerPage = _response['TT_REGI_PAGI']

          this.getDadosPeacao(this.getParams());

        }
      )
  }

  buildForm() {
    this.form = this.formBuilder.group({
      ID: [null],
      CD_EMPR: [null],
      CD_FICH: [null],
      VL_TOTA: [null],
      DS_TIPO: [null],
      DT_INIC: [new Date()],
      DT_FINA: [new Date()],
      TT_REGI_PAGI: [100],
      PAGI: [1],
      TIME: [(new Date()).getTime()]
    })
  }

  registraAcesso() {
    this.atividadesService.registrarAcesso().subscribe();
  }

  setBreadCrumb() {
    this.breadCrumbTree = [
      {
        descricao: 'Logistica'
      },
      {
        descricao: this.appTitle
      }
    ];
  }

  getEmpresas() {
    this.steelLogService
      .getEmpresas()
      .subscribe(
        response => {
          if (response.status === 200) {
            this.empresas = response.body['data']
          }
        }
      )
  }

  getDadosPeacao(params?: Partial<ILogisticaPeacao>) {

    if (!this.loading)
      this.loadingNavBar = true;

    this.logisticaPeacaoService
      .get(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.items = response.body['data'];
            this.totalItems = response.body['total'];
            this.noResult = false;
          } else {
            this.items = [];
            this.noResult = true;
            this.pnotify.notice('Nenhum resultado para sua consulta.')
          }
        },
        error => {
          this.items = [];
          this.noResult = true;
          this.pnotify.error();
        }
      )
  }

  delete(pedagio: ILogisticaPeacao, index: number) {

    this.loadingNavBar = true;

    this.logisticaPeacaoService
      .delete(pedagio.ID)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        response => {
          this.items.splice(index, 1);
          this.pnotify.success();
        },
        error => {
          try {
            this.pnotify.error(error.error.message)
          } catch (error) {
            this.pnotify.error();
          }
        }
      )
  }

  onConfirmDelete(pedagio: ILogisticaPeacao, index: number) {
    const type = 'delete';
    const title = 'Confirmar remoção do registro?';
    const message = 'Deseja realmente excluir o registro?';
    const cancelTxt = 'Cancelar';
    const okTxt = 'Confirmar';

    this.confirmModalService
      .showConfirm(type, title, message, cancelTxt, okTxt)
      .subscribe(
        (success: any) => {
          if (success) {
            this.delete(pedagio, index)
          }
        }
      );
  }

  setItensPerPage(ev): number {
    this.itemsPerPage = ev;
    return this.itemsPerPage;
  }

  /* Paginação */
  onPageChanged(event: PageChangedEvent): void {
    this.form.get("PAGI").setValue(event.page);
    this.onSearch();
  }
  /* Paginação */

  getParams() {

    let _params: Partial<ILogisticaPeacao> = {};
    let _obj = this.form.value;

    for (let prop in _obj) {
      if (_obj[prop]) {
        if (_obj[prop] instanceof Date)
          _params[prop] = this.dateService.convertToUrlDate(_obj[prop])
        else
          _params[prop] = _obj[prop]
      }
    }

    return _params;

  }

  onSearch() {
    this.form.get("TIME").setValue((new Date()).getTime());
    this.route.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams())
    })
  }

  // Validação de formulário
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
  // Validação de formulário

  verificaPerfil() {
    const matricula = (JSON.parse(localStorage.getItem("currentUser")))["info"]["matricula"];
    this.inAcessoExcluir = false;
    this.perfilService
      .getPerfil({ sigla: "LOGI_PEAC_ACES_EXCL", matricula: matricula })
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.inAcessoExcluir = true;
          }
        }
      );
  }

  onReset() {
    this.form.reset();
  }
}
