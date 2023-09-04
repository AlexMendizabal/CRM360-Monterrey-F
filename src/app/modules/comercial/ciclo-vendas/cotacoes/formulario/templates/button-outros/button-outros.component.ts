import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

// Services
import { ComercialCicloVendasCotacoesFormularioModalMaterialFichaCadastralService } from '../../modal/material/ficha-cadastral/ficha-cadastral.service';
import { ComercialCicloVendasCotacoesFormularioModalMaterialSimilaridadeService } from '../../modal/material/similaridade/similaridade.service';

// Interfaces
import { IMateriaisModel } from '../../models/materiais';

@Component({
  selector: 'comercial-ciclo-vendas-cotacoes-formulario-template-button-outros',
  templateUrl: './button-outros.component.html',
  styleUrls: ['./button-outros.component.scss'],
})
export class ComercialCicloVendasCotacoesFormularioTemplateButtonOutrosComponent
  implements OnInit {
  @Input('codCliente') codCliente: number;
  @Input('codEndereco') codEndereco: number;
  @Input('material') material: IMateriaisModel;
  @Input('index') index: number;
  @Input('codFormaPagamento') codFormaPagamento: number;
  @Input('freteConta') freteConta: number;

  @Output('activeRow') activeRow: EventEmitter<number> = new EventEmitter();

  constructor(
    private fichaCadastralService: ComercialCicloVendasCotacoesFormularioModalMaterialFichaCadastralService,
    private similaridadeService: ComercialCicloVendasCotacoesFormularioModalMaterialSimilaridadeService
  ) {}

  ngOnInit(): void {}

  onFichaCadastral(): void {
    // @ts-ignore: Ignorar error TS2339
    this.fichaCadastralService.showModal(this.material.id_material);
  }

  onSimilaridade(): void {
    this.similaridadeService.showModal(this.material, this.codCliente, this.codEndereco, this.codFormaPagamento, this.freteConta);
  }

  setActiveRow(): void {
    this.activeRow.emit(this.index);
  }

  resetActiveRow(): void {
    this.activeRow.emit(null);
  }
}
