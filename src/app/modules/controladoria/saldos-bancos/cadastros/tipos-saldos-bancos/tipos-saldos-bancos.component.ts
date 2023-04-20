import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { Location } from '@angular/common';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { DateService } from 'src/app/shared/services/core/date.service';
import { ControladoriaTiposSaldosBancosService } from '../../services/tipos-saldos-bancos.service';

@Component({
  selector: 'cadastro-tipos-saldos-bancos',
  templateUrl: './tipos-saldos-bancos.component.html',
  styleUrls: ['./tipos-saldos-bancos.component.scss']
})
export class ControladoriaCadastroTiposSaldosBancosComponent implements OnInit {
  breadCrumbTree: any = [];
  spinnerFullScreen: boolean = false;
  loaderNavbar: boolean = false;
  appTitle = 'Cadastro de tipos de lançamentos';
  form: FormGroup;
  tiposLancamentos = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private tipoSaldosBancosService: ControladoriaTiposSaldosBancosService,
    private notice: PNotifyService,
    private route: Router,
    private location: Location,
    private routerService: RouterService,
    private dateService: DateService
  ) {
    this.form = this.formBuilder.group({
      DS_BANC_TIPO: [null, Validators.required],
      ID_BANC_TIPO: [null],
      time: [new Date().getTime()],
    });
  }

  ngOnInit(): void {
    this.setBreadCrumb();
    this.onActivatedRoute();
  }

  setBreadCrumb() {
    this.breadCrumbTree = [
      {
        descricao: 'Home',
        routerLink: '/controladoria/home',
      },
      {
        descricao: 'Lançamento fluxo de caixa',
        routerLink: '/controladoria/saldos-bancos',
      },
      {
        descricao: 'Tipos de lançamentos',
        routerLink: '/controladoria/saldos-bancos/tipos-saldos-bancos',
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

  getTipos(param) {
    this.spinnerFullScreen = true;
    this.tipoSaldosBancosService.getTipos(param).subscribe((response) => {
      if (response.status === 204) {
        this.notice.notice('Não existe tipos de lançamentos cadastrados.');
        this.spinnerFullScreen = false;
      }
      this.form.patchValue(response.body['data'][0]);
      this.spinnerFullScreen = false;
    });
  }

  putTiposLancamentos() {
    this.spinnerFullScreen = true;
    this.tipoSaldosBancosService
      .putTiposLancamentos(this.getParams())
      .subscribe(
        (response) => {
          if (response.status === 200)
            this.notice.success(response.body['mensagem']);
          this.location.back();
        },
        (error) => this.notice.error()
      );
  }

  onActivatedRoute() {
    const params = this.activatedRoute.snapshot.params;
    if (params.hasOwnProperty('id')) {
      this.getTipos({ ID_BANC_TIPO: params.id });
    }
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
}
