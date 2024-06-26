import { Component, OnInit, Input } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
} from '@angular/forms';

// ngx-bootstrap
import { BsModalRef } from 'ngx-bootstrap/modal';

// Services
import { ComercialCicloVendasCotacoesFormularioService } from '../../../formulario.service';

@Component({
  selector:
    'comercial-ciclo-vendas-cotacoes-formulario-modal-material-desconto',
  templateUrl: './desconto.component.html',
  styleUrls: ['./desconto.component.scss'],
})
export class ComercialCicloVendasCotacoesFormularioModalMaterialDescontoComponent
  implements OnInit {
  @Input('params') params: any;

  form: FormGroup;

  maxValue: number;

  currencyMaskOptions = {
    align: 'left',
    prefix: '',
    suffix: '',
    thousands: '.',
    decimal: ',',
    precision: 2,
  };

  constructor(
    private formBuilder: FormBuilder,
    private bsModalRef: BsModalRef,
    private formularioService: ComercialCicloVendasCotacoesFormularioService
  ) {}

  ngOnInit(): void {
    this.setFormBuilder();
  }

  onClose(): void {
    this.bsModalRef.hide();
  }

  setFormBuilder(): void {
    const formValue: any = this.checkFormValue();

    this.form = this.formBuilder.group({
      tipo: [formValue.tipo, [Validators.required]],
      desconto: [formValue.desconto, [Validators.required]],
    });

    this.onChangeTipoDesconto(formValue.tipo);
  }

  checkFormValue(): Object {
    let formValue = {
      tipo: 'valor',
      desconto: 0,
    };

    if (this.params.aplicarDesconto === 'carrinho') {
      if (this.params.descontoCarrinho.tipo !== null) {
        formValue = {
          tipo: this.params.descontoCarrinho.tipo,
          desconto: this.params.descontoCarrinho.desconto,
        };
      }
    } else if (this.params.aplicarDesconto === 'material') {
      if (this.params.material.tipoDesc !== null) {
        formValue.tipo = this.params.material.tipoDesc;
        if (this.params.material.tipoDesc === 'valor') {
          formValue.desconto = this.params.material.valorDesc;
        } else if (this.params.material.tipoDesc === 'percentual') {
          formValue.desconto = this.params.material.percentualDesc;
        }
      }
    }

    return formValue;
  }

  onChangeTipoDesconto(tipo: string): void {
    if (tipo === 'valor') {
      this.currencyMaskOptions.prefix = 'R$ ';
      this.currencyMaskOptions.suffix = '';
      this.maxValue = 9999999;
    } else if (tipo === 'percentual') {
      this.currencyMaskOptions.prefix = '';
      this.currencyMaskOptions.suffix = '%';
      this.maxValue = 100;
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.formularioService.descontoSubject.next({
        aplicarDesconto: this.params.aplicarDesconto,
        index:
          typeof this.params.index !== 'undefined' ? this.params.index : null,
        tipo: this.form.value.tipo,
        desconto: this.form.value.desconto,
      });
      this.onClose();
    }
  }

  onFieldError(field: string): string {
    if (this.onFieldInvalid(field)) {
      return 'is-invalid';
    }

    return '';
  }

  onFieldInvalid(field: any): boolean {
    field = this.form.get(field);

    return field.status == 'INVALID' && field.touched;
  }

  onFieldRequired(
    abstractControl: AbstractControl,
    abstractControlField?: string
  ): string {
    if (abstractControl.validator) {
      const validator = abstractControl.validator({} as AbstractControl);
      if (validator && validator.required) {
        return 'is-required';
      }
    }

    if (abstractControlField) {
      for (const controlName in abstractControl['controls']) {
        if (abstractControl['controls'][controlName]) {
          if (
            this.onFieldRequired(abstractControl['controls'][controlName]) &&
            controlName == abstractControlField
          ) {
            return 'is-required';
          }
        }
      }
    }

    return '';
  }
}
