import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { DateService } from 'src/app/shared/services/core/date.service';
import { Location } from '@angular/common';
import { exit } from 'process';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ControladoriaSaldosBancosService } from '../../services/saldos-bancos.service';
import { ControladoriaTiposSaldosBancosService } from '../../services/tipos-saldos-bancos.service';

@Component({
  selector: 'cadastro-saldos-bancos',
  templateUrl: './saldos-bancos.component.html',
  styleUrls: ['./saldos-bancos.component.scss']
})
export class ControladoriaCadastroSaldosBancosComponent implements OnInit {
  spinnerFullScreen: boolean = false;
  loaderNavbar: boolean = false;
  breadCrumbTree: any = [];
  data: Date = new Date();
  bsConfig: Partial<BsDatepickerConfig>;
  form: FormGroup;
  empresas = [];
  bancos = [];
  tiposLancamentos = [];
  listas = [];
  ativaBotao: boolean = false;

  appTitle = 'Cadastro de Lançamentos';

  modalRef: BsModalRef;
  config = {
    animated: false,
    ignoreBackdropClick: true,
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private localeService: BsLocaleService,
    private formBuilder: FormBuilder,
    private saldosBancosService: ControladoriaSaldosBancosService,
    private tipoSaldosBancosService: ControladoriaTiposSaldosBancosService,
    private notice: PNotifyService,
    private dateService: DateService,
    private route: Router,
    private location: Location,
    private routerService: RouterService,
    private modalService: BsModalService
  ) {
    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );

    this.form = this.formBuilder.group({
      DATA_SALD: [null, Validators.required],
      ID_BANC_TIPO: [null, Validators.required],
      ID_LANC_BANC: [null, Validators.required],
      VL_LANC: [null, Validators.required],
      ID_LANC_EMPR: [null],
      DS_LANC_OBSE: [null],
      ID_BANC_SALD: [null],
      JUSTIFICATIVA: [null, Validators.minLength(10)],
      time: [new Date().getTime()],
    });
  }

  ngOnInit(): void {
    this.setBreadCrumb();
    this.getEmpresas();
    this.getBancos();
    this.getTipos();
    this.onActivatedRoute();
  }

  setBreadCrumb() {
    this.breadCrumbTree = [
      {
        descricao: 'Home',
        routerLink: '/controladoria/home',
      },
      {
        descricao: 'Lançamento saldos bancos',
        routerLink: '/controladoria/saldos-bancos',
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

  getEmpresas() {
    this.saldosBancosService.getEmpresas(this.getParams()).subscribe((response) => {
      this.empresas = response.body['data'];
    });
  }

  getBancos() {
    this.saldosBancosService.getBancos().subscribe((response) => {
      this.bancos = response.body['data'];
    });
  }

  getTipos() {
    this.tipoSaldosBancosService.getTipos(this.getParams()).subscribe((response) => {
      this.tiposLancamentos = response.body['data'];
    });
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

  postCadastrar() {
    this.spinnerFullScreen = true;
    this.saldosBancosService.postCadastrar(this.getParams()).subscribe(
      (response) => {
        if (response.status === 200)
          this.notice.success(response.body['mensagem']);
        this.location.back();
      },
      (error) => this.notice.error()
    );
  }

  getLista(params) {
    this.spinnerFullScreen = true;
    this.saldosBancosService.getLista(params).subscribe((response) => {
      this.form.patchValue(response.body['data'][0]);
      this.spinnerFullScreen = false;
    });
  }

  onActivatedRoute() {
    const params = this.activatedRoute.snapshot.params;
    const queryParams = this.activatedRoute.snapshot.queryParams;
    if (params.hasOwnProperty('id')) {
      this.getLista({ ID_BANC_SALD: params.id });
    } else if (queryParams.hasOwnProperty('q')) {
      const decoded = this.routerService.getBase64UrlParams(queryParams);

      this.form.patchValue(decoded);
      this.form.get('ID_BANC_SALD').setValue(undefined);
    }
  }

  validaSalvar(template) {
    if (!this.form.get('ID_BANC_SALD').value) {
      this.postCadastrar();
    } else {
      this.modalRef = this.modalService.show(template, this.config);
    }
  }
}
