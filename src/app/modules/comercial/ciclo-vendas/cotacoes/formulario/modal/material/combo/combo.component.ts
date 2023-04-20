import { Component, OnInit, Input } from '@angular/core';

// ngx-bootstrap
import { BsModalRef } from 'ngx-bootstrap/modal';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialCicloVendasCotacoesFormularioService } from '../../../formulario.service';

// Interfaces
import { ICarrinhoModel } from '../../../models/carrinho';
import { IMateriaisModel } from '../../../models/materiais';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';

@Component({
  selector: 'comercial-ciclo-vendas-cotacoes-formulario-modal-material-combo',
  templateUrl: './combo.component.html',
  styleUrls: ['./combo.component.scss'],
})
export class ComercialCicloVendasCotacoesFormularioModalMaterialComboComponent
  implements OnInit {
  @Input('material') material: ICarrinhoModel;
  @Input('materialAssoc') materialAssoc: Array<IMateriaisModel> = [];

  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
  };

  constructor(
    private bsModalRef: BsModalRef,
    private pnotifyService: PNotifyService,
    private formularioService: ComercialCicloVendasCotacoesFormularioService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit(): void {}

  onClose(): void {
    this.bsModalRef.hide();
  }

  classStatusBorder(estoqueDisponivel: number): string {
    let borderClass: string;

    if (estoqueDisponivel > 0) {
      borderClass = 'border-success';
    } else {
      borderClass = 'border-danger';
    }

    return borderClass;
  }

  onCheckMaterial(index: number, material: IMateriaisModel): void {
    this.materialAssoc[index].checked = material.checked == 0 ? 1 : 0;
  }

  onSubmit(): void {
    let materiais = [];

    for (let index = 0; index < this.materialAssoc.length; index++) {
      if (this.materialAssoc[index].checked === 1) {
        materiais.push(this.materialAssoc[index]);
        this.materialAssoc[index].checked = 0;
      }
    }

    if (materiais.length > 0) {
      this.formularioService.materiaisSubject.next(materiais);
      this.onClose();
    } else {
      this.pnotifyService.notice('Selecione ao menos um material.');
    }
  }
}
