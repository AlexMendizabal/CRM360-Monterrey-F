import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { BsDatepickerConfig, BsLocaleService, PageChangedEvent } from 'ngx-bootstrap';

import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

// models
import { ILogisticaSenha } from '../models/senha';
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';
import { CustomTableConfig } from './../../../../shared/templates/custom-table/models/config';

// services
import { LogisticaSenhasService } from '../services/senhas.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterService } from './../../../../shared/services/core/router.service';
import { PNotifyService } from './../../../../shared/services/core/pnotify.service';
import { AtividadesService } from './../../../../shared/services/requests/atividades.service';
import { DateService } from './../../../../shared/services/core/date.service';

@Component({
  selector: 'logistica-senhas-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss']
})
export class LogisticaSenhasListaComponent implements OnInit {

  form: FormGroup;

  appTitle: string = "Lista de senhas";
  breadCrumbTree: any = [];

  bsConfig: Partial<BsDatepickerConfig>;
  
  /* Pagination */
  itemsPerPage: number = 100;
  currentPage: number = 1;
  totalItems: any = 0;
  begin: number = 0;
  end: number = this.itemsPerPage;
  /* Pagination */

  senhas: ILogisticaSenha[] = [];

  /*loading*/
  loading = true;
  loadingNavBar = false;
  noResult = true;
  /*loading*/

  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true
  };

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
    private senhasService: LogisticaSenhasService
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

          this.getSenhas(this.getParams())
        }
      )
  }

  buildForm() {
    this.form = this.formBuilder.group({
      ID_LOGI_SENH: [null],
      DS_SENH: [null],
      DS_USUA: [null],
      DS_APLC: [null],
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

  getSenhas(params){
    if (!this.loading)
      this.loadingNavBar = true;

    this.senhasService
      .getSenhas(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.senhas = response.body['data'];
            this.totalItems = response.body['total'];
            this.noResult = false;
          } else {
            this.senhas = [];
            this.noResult = true;
            this.pnotify.notice('Nenhum resultado para sua consulta.')
          }
        },
        error => {
          this.senhas = [];
          this.noResult = true;
          this.pnotify.error();
        }
      )
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

    let _params = {};
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

  onReset(){
    this.form.reset();
  }
}
