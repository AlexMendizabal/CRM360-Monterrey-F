import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { Location } from '@angular/common';
import { DateService } from 'src/app/shared/services/core/date.service';
import { ControladoriaTiposFluxoCaixaService } from '../../services/tipos-fluxo-caixa.service';
import { ControladoriaFluxoCaixaService } from '../../services/fluxo-caixa.service';

@Component({
  selector: 'cadastro-tipos-fluxo-caixa',
  templateUrl: './tipos-fluxo-caixa.component.html',
  styleUrls: ['./tipos-fluxo-caixa.component.scss']
})
export class ControladoriaCadastroTiposFluxoCaixaComponent implements OnInit {
  breadCrumbTree: any = [];
  spinnerFullScreen: boolean = false;
  loaderNavbar: boolean = false;
  appTitle = 'Cadastro de Lançamentos';
  form: FormGroup;
  tipos = [];
  tiposLancamentos = [];
  idLancLanc: number;

  constructor(
    private cadastroTiposService: ControladoriaTiposFluxoCaixaService,
    private fluxoCaixaService: ControladoriaFluxoCaixaService,
    private activatedRoute: ActivatedRoute,
    private notice: PNotifyService,
    private formBuilder: FormBuilder,
    private location: Location,
    private dateService: DateService
  ) {
    this.form = this.formBuilder.group({
      COD_TIPO: [null, Validators.required],
      DESC_TIPO_LANCAMENTO: [null, Validators.required],
      COD_TIPO_LANCAMENTO: [null],
      time: [new Date().getTime()],
    });
  }

  ngOnInit(): void {
    this.setBreadCrumb();
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
        descricao: 'Lançamento fluxo de caixa',
        routerLink: '/controladoria/fluxo-caixa',
      },
      {
        descricao: 'Tipos de Lançamentos',
        routerLink: '/controladoria/fluxo-caixa/tipos-fluxo-caixa',
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

  getTipos() {
    this.fluxoCaixaService.getTipos().subscribe((response) => {
      this.tipos = response['data'];
    });
  }

  getTiposFluxoCaixa(params) {
    this.spinnerFullScreen = true;
    this.cadastroTiposService.getTiposFluxoCaixa(params).subscribe((response) => {
      this.form.patchValue(response.body['data'][0]);
      this.spinnerFullScreen = false;
    });
  }

  getTiposLancamentosAtualizado() {
    let lista = this.tiposLancamentos[0];
    this.form.controls['cadastroTipo'].setValue(lista.COD_TIPO);
    this.form.controls['cadastroLancamento'].setValue(
      lista.DESC_TIPO_LANCAMENTO
    );
  }

  putTiposFluxoCaixa() {
    this.spinnerFullScreen = true;
    this.cadastroTiposService.putTiposFluxoCaixa(this.getParams()).subscribe(
      (response) => {
        if (response.status === 200) {
          this.notice.success(response.body['mensagem']);
          this.location.back();
        }
      },
      (error) => this.notice.error()
    );
  }

  onActivatedRoute() {
    const params = this.activatedRoute.snapshot.params;

    if (params.hasOwnProperty('id')) {
      this.getTiposFluxoCaixa({ COD_TIPO_LANCAMENTO: params.id });
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
