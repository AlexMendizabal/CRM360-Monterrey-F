import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { Location } from '@angular/common';
import { DateService } from 'src/app/shared/services/core/date.service';
import { ControladoriaEmpresasService } from '../../services/empresas.service';

@Component({
  selector: 'cadastro-empresas',
  templateUrl: './empresas.component.html',
  styleUrls: ['./empresas.component.scss']
})
export class ControladoriaCadastroEmpresasComponent implements OnInit {
  idLancEmpr: number = this.activatedRoute.snapshot.params['id'];
  breadCrumbTree: any = [];
  spinnerFullScreen: boolean = false;
  loaderNavbar: boolean = false;
  appTitle = 'Cadastro de Empresas';
  form: FormGroup;
  empresas = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private notice: PNotifyService,
    private empresaService: ControladoriaEmpresasService,
    private route: Router,
    private location: Location,
    private dateService: DateService
  ) {
    this.form = this.formBuilder.group({
      DESC_EMPR: [null, Validators.required],
      COD_EMPR: [null],
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
        descricao: 'Empresas',
        routerLink: '/controladoria/fluxo-caixa/empresas',
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

  getEmpresas(param) {
    this.spinnerFullScreen = true;
    this.empresaService.getEmpresas(param).subscribe((response) => {
      this.empresas = response.body['data'];
      this.spinnerFullScreen = false;
      this.form.patchValue(response.body['data'][0]);
    });
  }

  putEmpresas() {
    this.spinnerFullScreen = true;
    this.empresaService.putEmpresas(this.getParams()).subscribe(
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
      this.getEmpresas({ COD_EMPR: params.id });
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
