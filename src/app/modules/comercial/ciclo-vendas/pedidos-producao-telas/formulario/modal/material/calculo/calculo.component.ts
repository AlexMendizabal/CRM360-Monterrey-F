import { ICalculoModel } from './../../../../../cotacoes/formulario/models/calculo';
import { ITelasModel } from './../../../../models/carrinho';
import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { EMPTY } from 'rxjs';

// ngx-bootstrap
import { BsModalRef } from 'ngx-bootstrap/modal';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { ComercialCicloVendasPedidosProducaoTelasFormularioService } from '../../../formulario.service';

// Interfaces
import { JsonResponse } from 'src/app/models/json-response';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'comercial-ciclo-vendas-pedidos-producao-telas-formulario-modal-material-calculo',
  templateUrl: './calculo.component.html',
  styleUrls: ['./calculo.component.scss'],
})
export class ComercialCicloVendasPedidosProducaoTelasFormularioModalMaterialCalculoComponent
  implements OnInit {
  @Input('index') index: number;
  @Input('material') material: ITelasModel;
  @Input('tipoCalculo') tipoCalculo: number;
  @Input('codCliente') codCliente: number;

  // @Output('dadosCalculo') dadosCalculo: EventEmitter<Object> = new EventEmitter();

  loaderModal: boolean;

  calculo: any = {
    index: null,
    tipoCalculo: 0,
    tonelada: 0,
    qtde: 0,
    valorUnitario: 0,
    valorItem: 0,
    aliquotaIpi: 0,
    valorIpi: 0,
    aliquotaIcms: 0,
    valorIcms: 0,
    valorIcmsSt: 0,
    valorTotal: 0,
  };

  form: FormGroup;

  descPreco: string;
  descQtde: string;

  currencyMaskOptions = {
    align: 'left',
    prefix: '',
    thousands: '.',
    decimal: ',',
    // precision: 3,
  };

  resultCaculo: Array<any> = [];

  showImpostos = false;

  constructor(
    private formBuilder: FormBuilder,
    private bsModalRef: BsModalRef,
    private pnotifyService: PNotifyService,
    private confirmModalService: ConfirmModalService,
    private formularioService: ComercialCicloVendasPedidosProducaoTelasFormularioService,
    private pedidosProducaoTelas: ComercialCicloVendasPedidosProducaoTelasFormularioService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit(): void {
    this.setFormBuilder();
    this.setUnidadeCalculo();
  }

  setFormBuilder(): void {
    const valor = this.material.valor !== 0 ? this.material.valor : 0;


    this.form = this.formBuilder.group({
      unidadeCalculo: ['m²'],
      quantidade: [this.material.quantidade, [Validators.required]],
      preco: [valor, [Validators.required]],
      medida: [this.material.medida1],
    });

    // this.setFormValidators();
    this.checkTotais();
  }


  setUnidadeCalculo(  ): void {
    
    this.resultCaculo = [];
    this.resetTotais();

    this.descQtde = '(Qtde m²)';
    this.descPreco = 'Preço por m²';
  }

  disabledUnidadeCalculo(): boolean {
    let isDisabled = null;

    if (
      this.tipoCalculo === 3 ||
      this.tipoCalculo === 4 ||
      this.tipoCalculo === 5
    ) {
      isDisabled = true;
    }

    return isDisabled;
  }

  showInputMedida(): boolean {
    let show = false;

    if (this.tipoCalculo === 4) {
      show = true;
    }

    return show;
  }

  showInfoMetragem(): boolean {
    let show = false;

    if (this.tipoCalculo === 2 || this.tipoCalculo === 4) {
      show = true;
    }

    return show;
  }

  showInfoFatorMultiplo(): boolean {
    let show = false;

    if (this.tipoCalculo === 5) {
      show = true;
    }

    return show;
  }

  onCalcular(): void {

    if (this.checkFormValidators() === false) {
      if (
        Math.floor(this.material.valorUnit * 100) / 100 >
        this.form.value.preco
      ) {
        this.confirmModalService
          .showConfirm(
            null,
            'Preço abaixo do mínimo',
            'O preço informado está abaixo do valor mínimo. Deseja continuar mesmo assim?',
            'Cancelar',
            'Confirmar'
          )
          .subscribe((response: boolean) =>
            response ? this.postCalculoMaterial() : EMPTY
          );
      } else {
        this.postCalculoMaterial();
      }
    }
  }

  checkFormValidators(): boolean {
    let hasError = false;

    this.form.controls.quantidade.setErrors(null);
    this.form.controls.preco.setErrors(null);

    if (this.form.value.quantidade == 0) {
      this.form.controls.quantidade.setErrors({ incorrect: true });
      hasError = true;
      this.pnotifyService.notice(
        'Informe a quantidade para realizar o cálculo.'
      );
    } else {
      if (this.tipoCalculo === 5) {
        const fatorMultiplo = 10;

        if (this.form.value.quantidade % fatorMultiplo !== 0) {
          this.form.controls.quantidade.setErrors({ incorrect: true });
          hasError = true;
          this.pnotifyService.notice(
            `A quantidade tem que ser múltipla de ${fatorMultiplo}.`
          );
        }
      }
    }

    if (this.form.value.preco == 0) {
      this.form.controls.preco.setErrors({ incorrect: true });
      hasError = true;
      this.pnotifyService.notice('Informe o preço para realizar o cálculo.');
    }

    return hasError;
  }

  postCalculoMaterial(): void {
    this.loaderModal = true;
    this.resetTotais();
    this.resultCaculo = [];

    let params = {
      codMaterial: this.material.codMaterial,
      quantidade: this.form.value.quantidade,
    };

    console.log(params)
    this.pedidosProducaoTelas
      .getCalculoMaterial(params)
      .pipe(
        finalize(() => {
          this.loaderModal = false;
        })
      )
      .subscribe((response: JsonResponse) => {
        if (response.success === true) {
          if (response.data.length === 1) {
            console.log(response.data)
            this.calcularTotais(response.data[0]);
          } else {

            this.resultCaculo = response.data;
          }
        }
      });
  }

  checkTotais(): void {

    if (this.material.quantidade > 0) {
      this.calculo.tonelada = this.material.pesoEspecifico;
      // this.calculo.valorUnitario = this.material.valor;
      // this.calculo.valorItem = this.material.valorTotalOri;
      // this.calculo.valorIpi = this.material.valorIpi;
      // this.calculo.valorIcms = this.material.valorIcms;
      // this.calculo.valorIcmsSt = this.material.valorIcmsSt;
      // this.calculo.valorTotal = this.material.valorTotalOri;
    }

    // this.calculo.aliquotaIpi = this.material.percentualIpi;
    // this.calculo.aliquotaIcms = this.material.percentualIcms;
  }



  calcularTotais(data: any): void {
    this.resetTotais();

    this.calculo.tonelada = data.Peso;
    this.calculo.qtde = this.form.value.quantidade;
    // this.calculo.valorUnitario = data.valorUnitario;
    // this.calculo.valorItem = data.valorItem;
    // this.calculo.aliquotaIpi = data.aliquotaIpi;
    // this.calculo.valorIpi = data.valorIpi;
    // this.calculo.aliquotaIcms = data.aliquotaIcms;
    // this.calculo.valorIcms = data.valorIcms;
    // this.calculo.valorIcmsSt = data.valorIcmsSt;
    // this.calculo.valorTotal = data.valorTotal;

    // this.calculoEmitter();

  }

  resetTotais(): void {
    this.calculo = {
      index: null,
      tipoCalculo: 0,
      tonelada: 0,
      qtde: 0,
      valorUnitario: 0,
      valorItem: 0,
      aliquotaIpi: 0,
      valorIpi: 0,
      aliquotaIcms: 0,
      valorIcms: 0,
      valorIcmsSt: 0,
      valorTotal: 0,
    };
  }

  onSubmit(): void {
    const calculos = this.calculo;
    this.calculo.index = this.index;
    this.formularioService.calculoSubject.next(calculos);

    if (this.calculo.tonelada === 0) {
      this.confirmModalService
        .showConfirm(
          null,
          'Cálculo não efetuado',
          'O cálculo não foi efetuado, pois o material precisa ter altura, comprimento e peso, verifique no cadastro do material. Deseja continuar mesmo assim?',
          'Cancelar',
          'Confirmar'
        )
        .subscribe((response: boolean) =>
          response ? this.postCalculoMaterial() : EMPTY
        );

    } else {
      this.postCalculoMaterial();
    } {

    }
      // this.formularioService.calculoSubject.next(calculos);
      this.onClose();
    // this.addCalculo();
  }

  onClose(): void {
    this.bsModalRef.hide();
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

  onShowImpostos(): void {
    this.showImpostos = !this.showImpostos;
  }
}
