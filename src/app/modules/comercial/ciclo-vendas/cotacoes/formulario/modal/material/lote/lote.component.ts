
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
import { ComercialCicloVendasCotacoesService } from '../../../../cotacoes.service';

// Interfaces
import { ICarrinhoModel } from '../../../models/carrinho';
import { ILoteModel } from './../../../models/lote';

import { finalize } from 'rxjs/operators';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';


@Component({
  selector: 'comercial-ciclo-vendas-cotacoes-formulario-modal-material-lote',
  templateUrl: './lote.component.html',
  styleUrls: ['./lote.component.scss'],
})
export class ComercialCicloVendasCotacoesFormularioModalMaterialLoteComponent
  implements OnInit {
  @Input('index') index: number;
  @Input('material') material: ICarrinhoModel;
  @Input('lotes') lotes: Array<any>;

  loaderModal: boolean;

  tableConfig: Partial<CustomTableConfig> = {
    hover: false,
  };

  loteSelecionado: ILoteModel = {
    index: null,
    sequenciaLote: null,
    estoque: null,
    loteFabricacao: null,
  };

  form: FormGroup;

  constructor(
    private bsModalRef: BsModalRef,
    private pnotifyService: PNotifyService,
    private formularioService: ComercialCicloVendasCotacoesFormularioService,
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit(): void {
    
  }

  onSubmit(i:number): void {
      this.loteSelecionado.index = this.index;
      this.loteSelecionado.sequenciaLote = this.lotes[i].sequenciaLote;
      this.loteSelecionado.estoque = this.lotes[i].estoque;
      this.loteSelecionado.loteFabricacao = this.lotes[i].loteFabricacao;
      this.formularioService.loteSubject.next(this.loteSelecionado);
      this.onClose();
      this.pnotifyService.success("Lote selecionado com sucesso")
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

}
