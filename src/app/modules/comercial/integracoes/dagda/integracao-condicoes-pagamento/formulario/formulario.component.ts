import { ComercialIntegracoesDagdaServicesAssociacaoCondicoesPagamento } from './../../services/associacao-condicoes-pagamento.service';
import { finalize } from 'rxjs/operators';
import { PNotifyService } from './../../../../../../shared/services/core/pnotify.service';

import { DateService } from './../../../../../../shared/services/core/date.service';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';

@Component({
  selector: 'formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss'],
})
export class ComercialIntegracoesDagdaIntegracaoCondicoesPagamentoFormularioComponent
  implements OnInit
{
  currentUser: any = JSON.parse(localStorage.getItem('currentUser'));
  matricula: any = this.currentUser['info']['matricula'];
  spinnerFullScreen: boolean = true;
  loaderNavbar: boolean = false;
  breadCrumbTree: any = [];
  form: FormGroup;
  data: Date = new Date();

  validForm = false;
  showTable = false;
  buttonAssosiarEnabled = false;
  isFieldValid = false;

  associacao = {
    codTid: null,
    descTid: null,
    codDagda: null,
    descDagda: null,
  };

  submittingForm: boolean;

  condicoesDagda: Array<any> = [];

  condicoesTid: Array<any> = [];

  appTitle = 'Cadastro de Associação';

  /* Config Table */
  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: false,
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private dateService: DateService,
    private route: Router,
    private pnotify: PNotifyService,
    private location: Location,
    private associacaoService: ComercialIntegracoesDagdaServicesAssociacaoCondicoesPagamento
  ) {}

  ngOnInit(): void {
    this.spinnerFullScreen = false;
    this.setBreadCrumb();
    this.setFormBuilder();
    this.getCondicoesPagamentoDagda();
    this.getCondicoesPagamentoTid();
  }

  // Função que preenche as condições de pagamento Dagda
  getCondicoesPagamentoDagda() {
    this.associacaoService
      .getCondicoesPagamentoDagda()
      .pipe(
        finalize(() => {
          this.spinnerFullScreen = false;
          this.loaderNavbar = false;
        })
      )
      .subscribe({
        next: (response) => {
          if (response.status === 200) {
            this.condicoesDagda = response.body['data'];
          }
        },
        error: (error) => this.pnotify.error(),
      });
  }

  // Função que preenche as condições de pagamento Tid
  getCondicoesPagamentoTid() {
    this.associacaoService
      .getCondicoesPagamentoTid()
      .pipe(
        finalize(() => {
          this.spinnerFullScreen = false;
          this.loaderNavbar = false;
        })
      )
      .subscribe({
        next: (response) => {
          if (response.status === 200) {
            this.condicoesTid = response.body['data'];
          }
        },
        error: (error) =>
          this.pnotify.notice('Nenhum resgistro foi encontrado!'),
      });
  }

  setFormBuilder() {
    let detalhes: any = {};
    // Verifica se há 'id' no parametro da url, se sim inicia com os dados desse id no formBuilder
    if (this.activatedRoute.snapshot.params.id) {
      detalhes = this.fillForm(this.activatedRoute.snapshot.params.id);
    } else {
      detalhes = [
        {
          codigoTid: null,
          descricaoTid: null,
          codigoDagda: null,
          descricaoDagda: null,
        },
      ];
    }

    this.form = this.formBuilder.group({
      codigoTid: [detalhes[0].codigoTid, Validators.required],
      codigoDagda: [detalhes[0].codigoDagda, Validators.required],
      descTid: [detalhes[0].descricaoTid],
      descDagda: [detalhes[0].descricaoDagda],

      matricula: this.matricula,
    });

    if (this.activatedRoute.snapshot.params.id) {
      this.isFieldValid = true;
      this.onAssociarCondicoesPagamento();
    }
  }

  // Preenche o form com os dados do id passado
  fillForm(id) {
    return this.associacaoService.getAss(id);
  }

  // Verifica se o form é válido
  checkValidForm() {
    if (this.form.valid) {
      this.buttonAssosiarEnabled = true;
    } else {
      this.validForm = false;
    }
  }

  // Seta no form a descrição Tid
  changeTid(event) {
    this.form.get('descTid').setValue(event.descricao);
  }

  // Seta no form a descrição Degda
  changeDagda(event) {
    this.form.get('descDagda').setValue(event.descricao);
  }

  // Ao clicar no botão de associar cria a associação (visualmente)
  onAssociarCondicoesPagamento() {
    if (!this.form.valid) {
      this.pnotify.error('Não foi possivel realizar esta associação');
      return;
    }
    this.validForm = true;
    this.showTable = true;
    this.buttonAssosiarEnabled = false;

    this.associacao.codTid = this.form.value.codigoTid;
    this.associacao.descTid = this.form.value.descTid;
    this.associacao.codDagda = this.form.value.codigoDagda;
    this.associacao.descDagda = this.form.value.descDagda;

    this.isFieldValid = true;
  }

  // Desfaz uma associação (visualmente)
  deleteAssosiacao() {
    console.log(this.associacao);
    this.validForm = false;
    this.showTable = false;
    this.buttonAssosiarEnabled = false;

    this.associacao.codTid = null;
    this.associacao.descTid = null;
    this.associacao.codDagda = null;
    this.associacao.descDagda = null;
    this.isFieldValid = false;

    this.form.get('codigoDagda').reset();
    this.form.get('codigoTid').reset();
  }

  onCancel() {
    const id = this.activatedRoute.snapshot.params.idSubModulo;
    this.route.navigate(
      [`/comercial/integracoes/dagda/${id}/integracao-condicao-pagamento`],
      {
        relativeTo: this.activatedRoute,
      }
    );
  }

  setBreadCrumb() {
    const id = this.activatedRoute.snapshot.params.idSubModulo;

    this.breadCrumbTree = [
      {
        descricao: 'Home',
        routerLink: `/comercial/home`,
      },
      {
        descricao: 'Integração Dagda',
        routerLink: `/comercial/integracoes/dagda/${id}`,
      },
      {
        descricao: 'Condições de Pagamento',
        routerLink: `/comercial/integracoes/dagda/${id}/integracao-condicao-pagamento`,
      },
      {
        descricao: this.appTitle,
      },
    ];
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
        if (_obj[prop] instanceof Array) _params[prop] = _obj[prop].toString();
        else _params[prop] = _obj[prop];
      }
    }

    return _params;
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

  onSubmit() {
    this.spinnerFullScreen = true;
    this.associacaoService.createAssociacao(this.getParams()).subscribe({
      next: (response) => {
        console.log(response);
        if (response.status == 200) {
          this.spinnerFullScreen = false;
          this.pnotify.success(response.body['mensagem']);
          this.location.back();
          return;
        }
      },
      error: (error) => this.pnotify.error(),
    });
  }

  onLoaderNavbar(event: boolean): void {
    this.loaderNavbar = event;
  }
}
