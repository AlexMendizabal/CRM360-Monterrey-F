import { Component, OnInit, Input } from '@angular/core';

// ngx-bootstrap
import { BsModalRef } from 'ngx-bootstrap/modal';

// Interfaces
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';

@Component({
  selector:
    'comercial-ciclo-vendas-cotacoes-formulario-modal-historico-exclusao',
  templateUrl: './historico-exclusao.component.html',
  styleUrls: ['./historico-exclusao.component.scss'],
})
export class ComercialCicloVendasCotacoesFormularioModalHistoricoExclusaoComponent
  implements OnInit {
  @Input('exclusoes') exclusoes: Array<any>;

  tableConfig: Partial<CustomTableConfig>;

  activeRow: number = null;

  selectedItem: any;

  constructor(private bsModalRef: BsModalRef) {}

  ngOnInit(): void {
    this.checkTableConfig();
    this.onShowDescricao(0, this.exclusoes[0]);
  }

  onClose(): void {
    this.bsModalRef.hide();
  }

  checkTableConfig(): void {
    if (this.exclusoes.length > 10) {
      this.tableConfig.fixedHeader = true;
      this.tableConfig.bodyHeight = 200;
    }
  }

  onShowDescricao(index: number, item: any): void {
    if (this.activeRow !== index) {
      this.activeRow = index;
      this.selectedItem = item;
    }
  }
}
