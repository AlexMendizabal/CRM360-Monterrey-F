import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

import { finalize } from 'rxjs/operators';

// ng-brazil
import { MASKS } from 'ng-brazil';

import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { ComercialGestaoTabelaPrecosService } from '../../tabela-precos.service';
import { DateService } from 'src/app/shared/services/core/date.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

@Component({
  selector: 'comercial-tabela-preco-clone',
  templateUrl: './clone.component.html',
  styleUrls: ['./clone.component.scss'],
})
export class ComercialTabelaPrecoCloneComponent implements OnInit, OnChanges {
  public MASKS = MASKS;

  @Output() close: EventEmitter<any> = new EventEmitter();
  @Input() formValue = {};

  form: FormGroup;

  loading = true;
  saving = false;

  bsConfig: Partial<BsDatepickerConfig>;

  constructor(
    private formBuilder: FormBuilder,
    private localeService: BsLocaleService,
    private service: ComercialGestaoTabelaPrecosService,
    private dateService: DateService,
    private pnotify: PNotifyService
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
    /* this.setForm(); */
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes?.formValue) {
      return;
    }

    let currentValue = changes?.formValue.currentValue;

    if (!this.form) {
      this.setForm();
    }

    this.getDetalhes(currentValue?.codPreco);
  }

  setForm() {
    this.form = this.formBuilder.group({
      codPreco: [null, [Validators.required]],
      nomePreco: [null, [Validators.required]],
      codTabelaClonada: [null],
      dataInicialVigencia: [this.dateService.getToday(), [Validators.required]],
      dataFinalVigencia: [null],
      faixaDescontoComercial: [null],
      faixaDescontoGerencial: [null],
      percentualAcrescimo: [null],
      percentualDesconto: [null],
      assocGrupos: [null],
    });
  }

  onClose() {
    this.close.emit(true);
  }

  getParams() {
    let _params = {};
    let _obj = this.form.value;

    for (let prop in _obj) {
      if (_obj[prop]) {
        if (_obj[prop] instanceof Date)
          _params[prop] = this.dateService.convertToUrlDate(_obj[prop]);
        else _params[prop] = _obj[prop];
      }
    }

    return _params;
  }

  saveTabelaPrecos(params) {
    if (
      params.dataFinalVigencia == '' ||
      params.dataFinalVigencia == null ||
      params.dataFinalVigencia == undefined
    ) {
      params['dataFinalVigencia'] = '';
    }

    if (params.percentualAcrescimo == 0) {
      params.percentualAcrescimo = null;
    }

    if (params.percentualDesconto == 0) {
      params.percentualDesconto = null;
    }

    params['codTabelaClonada'] = params?.codPreco?.toString()?.slice();

    delete params['codPreco'];

    const acrescimo = params?.percentualAcrescimo;
    const desconto = params?.percentualDesconto;

    if (acrescimo > 0) {
      params?.assocGrupos?.forEach((element) => {
        element.precos.forEach((preco) => {
          preco.valorMaterial *= 1 + acrescimo / 100;
        });
      });
    }

    if (desconto > 0) {
      params?.assocGrupos?.forEach((element) => {
        element.precos.forEach((preco) => {
          preco.valorMaterial *= 1 - desconto / 100;
        });
      });
    }

    this.saving = true;
    this.service
      .saveTabelaPrecos(params, 'insert')
      .pipe(
        finalize(() => {
          this.saving = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response['success'] == true) {
            this.pnotify.success('Tabela criada com sucesso!');
            this.onClose();
          } else {
            this.pnotify.error('Falha ao criar a tabela');
          }
        },
        error: (error) => {
          this.pnotify.error('Ocorreu um erro ao processar a solicitação.');
        }
      });
  }

  onDesativarAcrescimo() {
    if (this.form.value.percentualDesconto > 0) {
      this.form.controls.percentualAcrescimo.disable();
    } else if (
      this.form.value.percentualDesconto == 0 ||
      this.form.value.percentualDesconto == null
    ) {
      this.form.controls.percentualAcrescimo.enable();
    }
  }

  onDesativarDesconto() {
    if (this.form.value.percentualAcrescimo > 0) {
      this.form.controls.percentualDesconto.disable();
    } else if (
      this.form.value.percentualAcrescimo == 0 ||
      this.form.value.percentualAcrescimo == null
    ) {
      this.form.controls.percentualDesconto.enable();
    }
  }

  getDetalhes(codTabela) {
    this.loading = true;
    this.service
      .getDetalhes(codTabela)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response['success']) {
            let data = response['data'];

            data.dataInicialVigencia = this.dateService.getToday();
            data.dataFinalVigencia = data?.dataFinalVigencia
              ? new Date(data.dataFinalVigencia)
              : '';
            data.codTabelaClonada = data.codPreco?.toString()?.slice();

            data?.assocGrupos?.map((grupo) => {
              grupo?.precos?.map((preco) => {
                preco.codAssociacao = '';
              });
            });

            // delete data.codPreco;
            delete data.nomeUsuario;

            this.form.patchValue(data);
          } else {
            this.pnotify.error('Falha ao consultar os dados da tabela.');
          }
        },
        error: (error) => {
          this.pnotify.error('Ocorreu um erro ao processar a solicitação.');
        }
      });
  }

  // Tratamento de erros
  onFieldError(field: string) {
    if (this.onFieldInvalid(field)) {
      return 'is-invalid';
    }

    return '';
  }

  onFieldInvalid(field: any) {
    field = this.form.get(field);

    if (field.errors != null) {
      if (field.errors.hasOwnProperty('required') && field.touched) {
        return 'required';
      }
    }

    return '';
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
}
