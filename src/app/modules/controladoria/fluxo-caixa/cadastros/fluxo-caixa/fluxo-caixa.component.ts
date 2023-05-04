import { finalize } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import {
  BsModalService,
  BsModalRef,
  ModalDirective,
} from 'ngx-bootstrap/modal';
import { Location } from '@angular/common';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { DateService } from 'src/app/shared/services/core/date.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { ControladoriaFluxoCaixaService } from '../../services/fluxo-caixa.service';
import { ControladoriaTiposFluxoCaixaService } from '../../services/tipos-fluxo-caixa.service';
import { ControladoriaEmpresasService } from '../../services/empresas.service';
import { ControladoriaBancosService } from '../../services/bancos.service';

@Component({
  selector: 'cadastro-fluxo-caixa',
  templateUrl: './fluxo-caixa.component.html',
  styleUrls: ['./fluxo-caixa.component.scss'],
})
export class ControladoriaCadastrosFluxoCaixaComponent
  implements OnInit {
  spinnerFullScreen: boolean = false;
  loaderNavbar: boolean = false;
  breadCrumbTree: any = [];
  data: Date = new Date();
  bsConfig: Partial<BsDatepickerConfig>;
  form: FormGroup;
  tipos = [];
  tipo = 0;
  tiposLancamentos = [];
  empresas = [];
  bancos = [];
  validaPagamento = false;

  inativaBotao: boolean = true;

  modalRef: BsModalRef;
  config = {
    animated: false,
    ignoreBackdropClick: true,
  };

  appTitle = 'Cadastro de Lançamentos';

  constructor(
    private fluxoCaixaService: ControladoriaFluxoCaixaService,
    private tiposFluxoCaixaService: ControladoriaTiposFluxoCaixaService,
    private empresaService: ControladoriaEmpresasService,
    private bancoService: ControladoriaBancosService,
    private activatedRoute: ActivatedRoute,
    private routerService: RouterService,
    private route: Router,
    private notice: PNotifyService,
    private formBuilder: FormBuilder,
    private localeService: BsLocaleService,
    private modalService: BsModalService,
    private dateService: DateService,
    private location: Location
  ) {
    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );

    this.form = this.formBuilder.group({
      COD_LANCAMENTO: [null],
      DATA_VENCIMENTO: [null, Validators.required],
      DATA_EXECUCAO: [null, Validators.required],
      COD_TIPO: [null, Validators.required],
      COD_TIPO_LANCAMENTO: [null, Validators.required],
      COD_EMPR_LANCAMENTO: [null, Validators.required],
      COD_EMPR_RECEBIMENTO: [null],
      COD_BANCO: [null],
      VALOR: [null, Validators.required],
      OBSERVACAO: [null],
      JUSTIFICATIVA: [null, Validators.minLength(10)],
      time: [new Date().getTime()],
    });
  }

  ngOnInit(): void {
    this.setBreadCrumb();
    this.getTipos();
    this.getEmpresas();
    this.getBancos();
    this.onActivatedRoute();
  }

  setBreadCrumb() {
    this.breadCrumbTree = [
      {
        descricao: 'Home',
        routerLink: '/controladoria/home',
      },
      {
        descricao: 'Fluxo de caixa',
        routerLink: '/controladoria/fluxo-caixa',
      },
      {
        descricao: this.appTitle,
      },
    ];
  }

  onActivatedRoute() {
    const params = this.activatedRoute.snapshot.params;
    const queryParams = this.activatedRoute.snapshot.queryParams;

    if (params.hasOwnProperty('id')) {
      this.getFluxoCaixa({ COD_LANCAMENTO: params.id });
    } else if (queryParams.hasOwnProperty('q')) {
      const decoded = this.routerService.getBase64UrlParams(queryParams);

      this.getTiposFluxoCaixa({ COD_TIPO: decoded['COD_TIPO'] });

      this.form.patchValue(decoded);
      this.form.get('COD_LANCAMENTO').setValue(undefined);
    }
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
    this.tipo;
    this.fluxoCaixaService.getTipos().subscribe((response) => {
      this.tipos = response['data'];
    });
  }

  getTiposFluxoCaixa(params?) {
    this.spinnerFullScreen = true;
    this.tipo = this.form.value.COD_TIPO;
    this.tiposFluxoCaixaService
      .getTiposFluxoCaixa(params)
      .subscribe((response) => {
        if (response.status === 204) {
          this.notice.notice('Não existe tipos de lançamentos cadastrados.');
          this.spinnerFullScreen = false;
          this.tiposLancamentos = [];
        } else {
          this.tiposLancamentos = response.body['data'];
          this.spinnerFullScreen = false;
          this.mostraCampos();
        }
      });
  }

  getEmpresas() {
    this.empresaService
      .getEmpresas(this.getParams())
      .subscribe((response) => {
        if (response.status === 204) {
          this.notice.notice('Não existe empresas cadastradas.');
        } else this.empresas = response.body['data'];
      });
  }

  getBancos() {
    this.bancoService.getBancos(this.getParams()).subscribe((response) => {
      if (response.status === 204) {
        this.notice.notice('Não existe bancos cadastradas.');
      } else this.bancos = response.body['data'];
    });
  }

  mostraCampos(): boolean {
    if (this.form.value['COD_TIPO'] == 2) {
      this.validaPagamento = true;
      this.form.controls['COD_EMPR_RECEBIMENTO'].enable();
      this.form.controls['COD_BANCO'].enable();
      return true;
    } else if (this.form.value['COD_EMPR_RECEBIMENTO']) {
      this.validaPagamento = false;
      this.form.controls['COD_EMPR_RECEBIMENTO'].enable();
      this.form.controls['COD_BANCO'].enable();
      return true;
    }
    this.validaPagamento = true;
    this.form.controls['COD_EMPR_RECEBIMENTO'].enable();
    this.form.controls['COD_BANCO'].enable();
    return false;
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

  validaSalvar(template) {
    if (!this.form.get('COD_LANCAMENTO').value) {
      this.postCadastrar();
    } else {
      this.modalRef = this.modalService.show(template, this.config);
    }
  }

  postCadastrar() {
    this.spinnerFullScreen = true;
    this.fluxoCaixaService.postCadastrar(this.getParams()).subscribe(
      (response) => {
        if (response.status === 200)
          this.notice.success(response.body['mensagem']);
        this.location.back();
      },
      (error) => this.notice.error()
    );
  }

  retorna() {
    this.route.navigate([`./../`], {
      relativeTo: this.activatedRoute,
    });
  }

  getFluxoCaixa(params) {
    this.spinnerFullScreen = true;

    this.fluxoCaixaService
      .getFluxoCaixa(params)
      .pipe(
        finalize(() => {
          this.spinnerFullScreen = false;
        })
      )
      .subscribe((response) => {
        this.form.patchValue(response.body['data'][0]);
        this.getTiposFluxoCaixa(this.getParams());
      });
  }
}
