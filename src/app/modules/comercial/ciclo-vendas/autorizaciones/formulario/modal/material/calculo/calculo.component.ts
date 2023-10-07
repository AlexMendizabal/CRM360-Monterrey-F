import { Component, OnInit, Input } from '@angular/core';
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
import { ComercialCicloVendasCotacoesFormularioService } from '../../../formulario.service';
import { ComercialCicloVendasAutorizacionesService } from '../../../../autorizaciones.service';

// Interfaces
import { ICarrinhoModel } from '../../../models/carrinho';
import { ICalculoModel } from '../../../models/calculo';
import { JsonResponse } from 'src/app/models/json-response';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'comercial-ciclo-vendas-cotacoes-formulario-modal-material-calculo',
  templateUrl: './calculo.component.html',
  styleUrls: ['./calculo.component.scss'],
})
export class ComercialCicloVendasCotacoesFormularioModalMaterialCalculoComponent
  implements OnInit {
  @Input('index') index: number;
  @Input('material') material: ICarrinhoModel;
  @Input('tipoCalculo1') tipoCalculo1: number;
  @Input('nomeTipoCalculo1') nomeTipoCalculo1: number;
  @Input('tipoCalculo2') tipoCalculo2: number;
  @Input('nomeTipoCalculo2') nomeTipoCalculo2: number;
  @Input('tipoLancamento') tipoLancamento: number;
  @Input('nomeTipoLancamento') nomeTipoLancamento: string;
  @Input('codCliente') codCliente: number;
  @Input('medida') medida: number;
  @Input('codEndereco') codEndereco: number;

  medidaDisable = false;

  loaderModal: boolean;

  calculo: ICalculoModel = {
    index: null,
    tipoCalculo: 0,
    tipoLancamento: 0,
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
    valorBaseIcmsSt: 0,
    aliquotaReducaoIcms: 0,
    unidade: '',
    medida: 0,
    nrPedidoCliente: '',
    codItemPedidoCliente: '',
    codProdutoCliente: ''
  };

  form: FormGroup;

  tipoCalculo: number;
  descPreco: string;
  descQtde: string;

  currencyMaskOptions = {
    align: 'left',
    prefix: '',
    thousands: '.',
    decimal: ',',
    precision: 3,
  };

  opcoesVenda: Array<any> = [];

  showImpostos = false;

  constructor(
    private formBuilder: FormBuilder,
    private bsModalRef: BsModalRef,
    private pnotifyService: PNotifyService,
    private confirmModalService: ConfirmModalService,
    private formularioService: ComercialCicloVendasCotacoesFormularioService,
    private cotacoesService: ComercialCicloVendasAutorizacionesService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit(): void {
    this.setFormBuilder();
    this.onSetUnidadeLancamento();
    this.onDisablePreco1();
    this.onDisablePreco2();
  }

  setFormBuilder(): void {
    this.form = this.formBuilder.group({

      quantidade: [
        null,
        [Validators.required, Validators.min(0.001), Validators.minLength(1)],
      ],
      preco1: [this.material.valor, [Validators.required, Validators.min(0.001)]],
      preco2: [null],
      medida: [
        { value: this.medida, disabled: this.medida > 0 ? true : false },
      ],
      nrPedidoCliente: this.material.nrPedidoCliente,
      codItemPedidoCliente: this.material.codItemPedidoCliente,
      codProdutoCliente: this.material.codProdutoCliente
    });

    this.setFormValidators();
  }

  setFormValidators(): void {
    if (this.tipoLancamento === 3) {
      this.form.controls.medida.setValidators([
        Validators.required,
        Validators.min(0.001),
      ]);
      this.form.controls.medida.updateValueAndValidity();
      if(this.material.medida1 > 0){
        this.form.controls.medida.setValue(this.material.medida1);
        this.form.controls.medida.updateValueAndValidity();
      }
    }

    if (this.tipoCalculo2 > 0) {
      this.form.controls.preco1.setValue(0);
      this.form.controls.preco1.updateValueAndValidity();
      this.form.controls.preco2.setValue(this.material.valor);
      this.form.controls.preco2.setValidators([
        Validators.required,
        Validators.min(0.001),
      ]);
      this.form.controls.preco2.updateValueAndValidity();
    }

    if(this.tipoLancamento == 6){
      this.form.controls.quantidade.setValue(this.material.quantidade);
      this.form.controls.quantidade.updateValueAndValidity();
    }else{
      this.form.controls.quantidade.setValue(this.material.qtdePecas);
      this.form.controls.quantidade.updateValueAndValidity();
    }

  }

  onSetUnidadeLancamento(): void {
    this.opcoesVenda = [];
    this.resetTotais();

    this.descQtde = 'Qtde (' + this.nomeTipoLancamento + ')';
    this.descPreco = 'Preço por ' + this.nomeTipoCalculo1;
    this.currencyMaskOptions.decimal = '';
    this.currencyMaskOptions.precision = 0;

    if (this.tipoLancamento == 6) {
      this.currencyMaskOptions.decimal = ',';
      this.currencyMaskOptions.precision = 3;
    }

    if (this.tipoLancamento == 3) {
      this.descQtde = 'Qtde (PEÇA)';
    }
  }

  onDisablePreco1() {
    if (this.form.value.preco2 > 0) {
      this.form.controls.preco1.disable();
      this.form.controls.preco1.clearValidators();
      this.form.controls.preco1.updateValueAndValidity();
    } else if (this.form.value.preco2 == 0 || this.form.value.preco2 == null) {
      this.form.controls.preco1.enable();
      this.form.controls.preco1.setValidators([
        Validators.required,
        Validators.min(0.001),
      ]);
      this.form.controls.preco1.updateValueAndValidity();
    }
  }

  onDisablePreco2() {
    if (this.form.value.preco1 > 0) {
      this.form.controls.preco2.disable();
      this.form.controls.preco2.clearValidators();
      this.form.controls.preco2.updateValueAndValidity();
    } else if (this.form.value.preco1 == 0 || this.form.value.preco1 == null) {
      this.form.controls.preco2.enable();
      this.form.controls.preco2.setValidators([
        Validators.required,
        Validators.min(0.001),
      ]);
      this.form.controls.preco2.updateValueAndValidity();
    }
  }

  showInputMedida(): boolean {
    let show = false;

    if (this.tipoLancamento === 3) {
      show = true;
    }

    return show;
  }

  showInfoMetragem(): boolean {
    let show = false;

    if (this.tipoLancamento === 3) {
      show = true;
    }

    return show;
  }

  showInfoFatorMultiplo(): boolean {
    let show = false;

    if (this.material.fatorMultiplo > 0) {
      show = true;
    }

    return show;
  }

  checkFormValidators(): boolean {
    let hasError = false;

    if (
      !this.form.controls.preco1.valid ||
      !this.form.controls.quantidade.valid ||
      !this.form.controls.medida.valid
    ) {
      if (
        this.form.value.quantidade == 0 ||
        this.form.value.quantidade == null
      ) {
        this.form.controls.quantidade.setErrors({ incorrect: true });
        hasError = true;
        this.pnotifyService.notice(
          'Informe a quantidade para realizar o cálculo.'
        );
      }

      if (
        (this.form.value.preco1 == 0 && !this.form.controls.preco2.valid) ||
        (this.form.value.preco1 == null && !this.form.controls.preco2.valid)
      ) {
        this.form.controls.preco1.setErrors({ incorrect: true });
        hasError = true;
        this.pnotifyService.notice('Informe o preço para realizar o cálculo.');
      }

      if (
        (this.form.getRawValue().medida == 0 && this.tipoLancamento == 3) ||
        (this.form.getRawValue().medida == null && this.tipoLancamento == 3)
      ) {
        this.form.controls.medida.setErrors({ incorrect: true });
        hasError = true;
        this.pnotifyService.notice('Informe a medida para realizar o cálculo.');
      }
    } else if (
      !this.form.controls.preco2.valid ||
      !this.form.controls.quantidade.valid
    ) {
      if (
        this.form.value.quantidade == 0 ||
        this.form.value.quantidade == null
      ) {
        this.form.controls.quantidade.setErrors({ incorrect: true });
        hasError = true;
        this.pnotifyService.notice(
          'Informe a quantidade para realizar o cálculo.'
        );
      }

      if (
        (this.form.value.preco2 == 0 && !this.form.controls.preco1.valid) ||
        (this.form.value.preco2 == null && !this.form.controls.preco1.valid)
      ) {
        this.form.controls.preco2.setErrors({ incorrect: true });
        hasError = true;
        this.pnotifyService.notice('Informe o preço para realizar o cálculo.');
      }
    }

    return hasError;
  }

  onCalcular(): void {
    if (this.checkFormValidators() === false && this.form.valid) {
      if (this.material.valorMaterialContrato > 0) {
        this.postCalculoMaterial(this.tipoCalculo1, this.form.value.preco1);
      } else if (this.form.value.preco2 > 0) {
        if (
          Math.floor(this.material.valorUnit * 100) / 100 >
          this.form.value.preco2
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
              response
                ? this.postCalculoMaterial(
                    this.tipoCalculo2,
                    this.form.value.preco2
                  )
                : EMPTY
            );
        } else {
          this.postCalculoMaterial(this.tipoCalculo2, this.form.value.preco2);
        }
      } else if (this.form.value.preco1 > 0 && this.tipoLancamento == 6) {
        if (
          Math.floor(this.material.valorUnit * 100) / 100 >
          this.form.value.preco1
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
              response
                ? this.postCalculoMaterial(
                    this.tipoCalculo1,
                    this.form.value.preco1
                  )
                : EMPTY
            );
        } else {
          this.postCalculoMaterial(this.tipoCalculo1, this.form.value.preco1);
        }
      } else {
        if (
          Math.floor(this.material.valorMaterialBarra * 100) / 100 >
          this.form.value.preco1
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
              response
                ? this.postCalculoMaterial(
                    this.tipoCalculo1,
                    this.form.value.preco1
                  )
                : EMPTY
            );
        } else {
          this.postCalculoMaterial(this.tipoCalculo1, this.form.value.preco1);
        }
      }
    }
  }

  postCalculoMaterial(tipoCalculo: number, preco: number): void {
    this.loaderModal = true;
    this.resetTotais();
    this.opcoesVenda = [];

    let params = {
      codMaterial: this.material.codMaterial,
      codTipoLancamento: this.tipoLancamento,
      tipoCalculo: tipoCalculo,
      codCliente: this.codCliente,
      quantidade: this.form.value.quantidade,
      preco: preco,
      medida: this.form.getRawValue().medida,
      codEmpresa: this.material.codEmpresa,
      codEndereco: this.codEndereco
    };

    this.cotacoesService
      .postCalculoMaterial(params)
      .pipe(
        finalize(() => {
          this.loaderModal = false;
        })
      )
      .subscribe((response: JsonResponse) => {
        if (response.success === true) {
          if (response.data.length === 1) {
            this.calcularTotais(response.data[0], tipoCalculo, this.tipoLancamento, this.material.unidade);
          }
        } else {
          this.pnotifyService.notice(response.mensagem);
        }
      });
  }

  calcularTotais(data: any, tipoCalculo: number, tipoLancamento: number, unidade: string): void {
    this.resetTotais();

    this.calculo.tonelada = data.tonelada;
    this.calculo.qtde = data.qtde;
    this.calculo.valorUnitario = data.valorUnitario;
    this.calculo.valorItem = data.valorItem;
    this.calculo.aliquotaIpi = data.aliquotaIpi;
    this.calculo.valorIpi = data.valorIpi;
    this.calculo.aliquotaIcms = data.aliquotaIcms;
    this.calculo.valorIcms = data.valorIcms;
    this.calculo.valorIcmsSt = data.valorIcmsSt;
    this.calculo.valorTotal = data.valorTotal;
    this.calculo.valorBaseIcmsSt = data.valorBaseIcmsSt;
    this.calculo.aliquotaReducaoIcms = data.aliquotaReducaoIcms;
    this.calculo.tipoCalculo = tipoCalculo;
    this.calculo.tipoLancamento = tipoLancamento;
    this.calculo.unidade = unidade;
    this.calculo.nrPedidoCliente = this.form.value.nrPedidoCliente,
    this.calculo.codItemPedidoCliente = this.form.value.codItemPedidoCliente,
    this.calculo.codProdutoCliente = this.form.value.codProdutoCliente
    this.calculo.medida = this.form.getRawValue().medida;
  }

  resetTotais(): void {
    this.calculo = {
      index: null,
      tipoCalculo: 0,
      tipoLancamento: 0,
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
      valorBaseIcmsSt: 0,
      aliquotaReducaoIcms: 0,
      unidade:'',
      medida: 0,
      nrPedidoCliente: '',
      codItemPedidoCliente: '',
      codProdutoCliente: ''
    };
  }

  onSubmit(): void {
    this.setCOD();
    if (this.calculo.valorTotal === 0) {
      this.pnotifyService.notice('Realize os cálculos para continuar.');
    } else {
      if(this.material.controladoPorLote == 1){
        if(this.material.estoqueLote != this.form.value.quantidade){
          this.pnotifyService.notice(`Quantidade diferente ao lote. Quantidade deve ser: ${this.material.estoqueLote}`);
          return;
        }
        else{
          this.calculo.index = this.index;
          this.formularioService.calculoSubject.next(this.calculo);
          this.onClose();
        }
      } else
      this.calculo.index = this.index;
      this.formularioService.calculoSubject.next(this.calculo);
      this.onClose();
    }
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

  setCOD(){
    this.calculo.nrPedidoCliente = this.form.value.nrPedidoCliente,
    this.calculo.codItemPedidoCliente = this.form.value.codItemPedidoCliente,
    this.calculo.codProdutoCliente = this.form.value.codProdutoCliente
  }
}
