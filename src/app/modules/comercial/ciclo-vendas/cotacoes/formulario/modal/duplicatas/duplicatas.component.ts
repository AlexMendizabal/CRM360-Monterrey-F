import { Component, OnInit, Input } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
  FormArray,
  FormControl,
} from '@angular/forms';
import { finalize } from 'rxjs/operators';

// ngx-bootstrap
import { BsModalRef } from 'ngx-bootstrap/modal';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialCicloVendasCotacoesService } from '../../../cotacoes.service';

// Interfaces
import { DateService } from 'src/app/shared/services/core/date.service';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { JsonResponse } from 'src/app/models/json-response';

@Component({
  selector: 'comercial-ciclo-vendas-cotacoes-formulario-modal-duplicatas',
  templateUrl: './duplicatas.component.html',
  styleUrls: ['./duplicatas.component.scss'],
})
export class ComercialCicloVendasCotacoesFormularioModalDuplicatasComponent
  implements OnInit
{
  @Input('codCotacao') codCotacao: number;
  @Input('codEmpresa') codEmpresa: number;
  @Input('codFormaPagamento') codFormaPagamento: number;
  @Input('podeEditarDuplicata') podeEditarDuplicata: boolean;
  @Input('valorProposta') valorProposta: number;
  @Input('valorIcmsSt') valorIcmsSt: number;
  @Input('duplicatas') duplicatas: Array<any>;

  loaderModal: boolean;
  index: number;

  formChanged = false;

  tableConfig: Partial<CustomTableConfig> = {
    hover: false,
  };

  bsConfig: Partial<BsDatepickerConfig>;
  bsConfigR: Readonly<BsDatepickerConfig>;

  showDuplicatas = true;

  form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private localeService: BsLocaleService,
    private bsModalRef: BsModalRef,
    private pnotifyService: PNotifyService,
    private dateService: DateService,
    private cotacoesService: ComercialCicloVendasCotacoesService
  ) {
    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );
    this.pnotifyService.getPNotify();
  }

  ngOnInit(): void {
    this.setFormBuilder();
  }

  onClose(): void {
    this.bsModalRef.hide();
  }

  onAlterar(i: number): void {
    this.index = i;
    this.showDuplicatas = false;
    let data = this.dateService.convertStringToDate(
      this.duplicatas[i].dataVencimento,
      'usa'
    );
    this.form.controls.dataVencimento.setValue(data);
    this.form.controls.dataVencimento.updateValueAndValidity();
  }

  setFormBuilder(): void {
    this.form = this.formBuilder.group({
      dataVencimento: [null, [Validators.required]],
    });
  }

  onCancel(): void {
    this.showDuplicatas = true;
  }

  checkDatasError() {
    let index = this.index;
    let hasError = false;

    if (this.form.value.dataVencimento < this.dateService.getToday()) {
      hasError = true;
      this.pnotifyService.notice(
        `A data da parcela é menor que a data de hoje`
      );
    }

    for (let i = this.duplicatas.length; i > 0; i--) {
      let j = i - 1;

      if (index > j) {
        if (
          this.form.value.dataVencimento <=
          this.dateService.convertStringToDate(
            this.duplicatas[j].dataVencimento,
            'usa'
          )
        ) {
          this.pnotifyService.notice(
            `A data da parcela ${
              index + 1
            } é menor ou igual a data da parcela ${i}.`
          );
          hasError = true;
        }
      }

      if (index < j) {
        if (
          this.form.value.dataVencimento >=
          this.dateService.convertStringToDate(
            this.duplicatas[j].dataVencimento,
            'usa'
          )
        ) {
          this.pnotifyService.notice(
            `A data da parcela ${
              index + 1
            } é maior ou igual a data da parcela ${i}.`
          );
          hasError = true;
        }
      }
    }

    if (hasError == false) {
      this.onSubmit(index);
    }

    // if(this.form.value['qtdeParcelas'].length >1 ){

    //   let array: number = this.form.value['qtdeParcelas'].length;

    //   for(let i = array; i>1; i--){
    //     let j = i-1;
    //     let k = i-2
    //     if(this.form.value['qtdeParcelas'][j]['dataVencimento'] < this.form.value['qtdeParcelas'][k]['dataVencimento']){
    //       hasError = true;
    //       this.pnotifyService.notice(`A data da parcela ${i} é menor que a data da parcela ${j}`);
    //     }
    //   }
    // }

    // if(this.form.value['qtdeParcelas'].length >1 ){

    //   let array: number = this.form.value['qtdeParcelas'].length;

    //   for(let i = array; i>1; i--){
    //     let j = i-1;
    //     let k = i-2
    //     if(this.form.value['qtdeParcelas'][j]['dataVencimento'] == this.form.value['qtdeParcelas'][k]['dataVencimento']){
    //       hasError = true;
    //       this.pnotifyService.notice(`A data da parcela ${i} é igual a data da parcela ${j}`);
    //     }
    //   }
    // }
  }

  onSubmit(i: number): void {
    this.loaderModal = true;

    const params = {
      codCotacao: this.codCotacao,
      codEmpresa: this.codEmpresa,
      parcelaIndex: i,
      dataVencimento: this.form.value.dataVencimento,
    };

    this.cotacoesService
      .postAlterarDuplicatas(params)
      .pipe(
        finalize(() => {
          this.loaderModal = false;
          this.getDuplicatas();
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.success === true) {
            this.pnotifyService.success('Alteração realizada com sucesso!');
          } else {
            this.pnotifyService.notice(response.mensagem);
          }
        },
        error: (error: any) => {
          if (error['error'].hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
      });
  }

  getDuplicatas() {
    this.loaderModal = true;
    let codCotacao = this.codCotacao,
      codEmpresa = this.codEmpresa;

    this.cotacoesService
      .getDuplicatas({
        codCotacao,
        codEmpresa,
      })
      .pipe(
        finalize(() => {
          this.loaderModal = false;
          this.showDuplicatas = true;
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.success === true) {
            this.duplicatas = response.data;
          } else {
            this.pnotifyService.notice(response.mensagem);
          }
        },
        error: (error: any) => {
          if (error['error'].hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
      });
  }

  onInput(): void {
    this.formChanged = true;
  }

  formCanDeactivate(): boolean {
    if (this.formChanged) {
      if (confirm('Este cliente no forma parte de tu cartera?')) {
        return true;
      } else {
        return false;
      }
    }
    return true;
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
