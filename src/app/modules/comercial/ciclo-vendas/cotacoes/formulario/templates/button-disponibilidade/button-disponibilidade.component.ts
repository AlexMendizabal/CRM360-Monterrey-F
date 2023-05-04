import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { EMPTY } from 'rxjs';
import { finalize } from 'rxjs/operators';

// Services
import { ComercialCicloVendasCotacoesService } from '../../../cotacoes.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';

// Interfaces
import { IDepositoModel } from '../../models/deposito';
import { JsonResponse } from 'src/app/models/json-response';

@Component({
  selector:
    'comercial-ciclo-vendas-cotacoes-formulario-template-button-disponibilidade',
  templateUrl: './button-disponibilidade.component.html',
  styleUrls: ['./button-disponibilidade.component.scss'],
})
export class ComercialCicloVendasCotacoesFormularioTemplateButtonDisponibilidadeComponent
  implements OnInit {
  @Input('index') index: number;
  @Input('codMaterial') codMaterial: number;
  @Input('deposito') deposito: IDepositoModel = {
    codDeposito: null,
    nomeDeposito: null,
    quantidade: null,
    unidade: null,
  };

  @Output('activeRow') activeRow: EventEmitter<number> = new EventEmitter();
  @Output('onChange') onChange: EventEmitter<any> = new EventEmitter();

  disponibilidade: Array<IDepositoModel> = [];
  disponibilidadeLoaded: boolean;

  isSelectable: boolean;

  constructor(
    private cotacoesService: ComercialCicloVendasCotacoesService,
    private confirmModalService: ConfirmModalService
  ) {}

  ngOnInit(): void {
    this.checkDeposito();
  }

  checkDeposito(): void {
    if (typeof this.deposito !== 'undefined') {
      this.isSelectable = true;
    } else {
      this.isSelectable = false;
    }
  }

  onShown(): void {
    this.setActiveRow();
    this.getEstoqueDepositos();
  }

  onHidden(): void {
    this.resetActiveRow();
    this.resetEstoqueDepositos();
  }

  setActiveRow(): void {
    this.activeRow.emit(this.index);
  }

  resetActiveRow(): void {
    this.activeRow.emit(null);
  }

  getEstoqueDepositos(): void {
    this.disponibilidade = [];
    this.disponibilidadeLoaded = false;

    this.cotacoesService
      .getEstoqueDepositos(this.deposito.codDeposito, this.codMaterial)
      .pipe(
        finalize(() => {
          this.disponibilidadeLoaded = true;
        })
      )
      .subscribe((response: JsonResponse) => {
        if (response.success === true) {
          this.disponibilidade = response.data;
        }
      });
  }

  resetEstoqueDepositos(): void {
    this.disponibilidade = [];
  }

  onClickDeposito(deposito: IDepositoModel): void {
    if (this.isSelectable === true) {
      if (deposito.codDeposito !== this.deposito.codDeposito) {
        // this.showConfirmChangeDeposito(deposito);
        this.onChange.emit({ index: this.index, deposito: deposito });
      }
    }
  }

  showConfirmChangeDeposito(deposito: IDepositoModel): void {
    this.confirmModalService
      .showConfirm(
        null,
        'Alteração de depósito',
        `Deseja alterar para o depósito "${deposito.nomeDeposito}"?`,
        'Cancelar',
        'Confirmar'
      )
      .subscribe((response: boolean) =>
        response
          ? this.onChange.emit({ index: this.index, deposito: deposito })
          : EMPTY
      );
  }
}
