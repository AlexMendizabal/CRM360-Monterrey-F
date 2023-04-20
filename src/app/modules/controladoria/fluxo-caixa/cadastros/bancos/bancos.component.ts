import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { Location } from '@angular/common';
import { DateService } from 'src/app/shared/services/core/date.service';
import { ControladoriaBancosService } from '../../services/bancos.service';

@Component({
  selector: 'cadastro-bancos',
  templateUrl: './bancos.component.html',
  styleUrls: ['./bancos.component.scss']
})
export class ControladoriaCadastroBancosComponent implements OnInit {
  breadCrumbTree: any = [];
  spinnerFullScreen: boolean = false;
  loaderNavbar: boolean = false;
  appTitle = 'Cadastro de Bancos/Fundos';
  form: FormGroup;
  bancos = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private notice: PNotifyService,
    private bancosService: ControladoriaBancosService,
    private route: Router,
    private location: Location,
    private dateService: DateService
  ) {
    this.form = this.formBuilder.group({
      DESC_BANCO: [null, Validators.required],
      COD_BANCO: [null],
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
        routerLink: '/controladoria/fluxo-caixa',
      },
      {
        descricao: 'Bancos',
        routerLink: '/controladoria/fluxo-caixa/bancos',
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

  getBancos(param) {
    this.spinnerFullScreen = true;
    this.bancosService.getBancos(param).subscribe((response) => {
      this.bancos = response.body['data'];
      this.spinnerFullScreen = false;
      this.form.patchValue(response.body['data'][0]);
    });
  }

  putBancos() {
    this.spinnerFullScreen = true;
    this.bancosService.putBancos(this.getParams()).subscribe(
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
      this.getBancos({ COD_BANCO: params.id });
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
