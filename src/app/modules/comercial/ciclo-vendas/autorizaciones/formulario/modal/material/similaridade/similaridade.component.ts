import { Component, OnInit, Input } from '@angular/core';

// ngx-bootstrap
import { BsModalRef } from 'ngx-bootstrap/modal';

// Services
import { ComercialCicloVendasCotacoesFormularioService } from '../../../formulario.service';

// Interfaces
import { ISimilaridadeModel } from '../../../models/similaridade';

@Component({
  selector:
    'comercial-ciclo-vendas-cotacoes-formulario-modal-material-similaridade',
  templateUrl: './similaridade.component.html',
  styleUrls: ['./similaridade.component.scss'],
})
export class ComercialCicloVendasCotacoesFormularioModalMaterialSimilaridadeComponent
  implements OnInit {
  @Input('title') title: string;
  @Input('materiais') materiais: Array<ISimilaridadeModel>;

  constructor(
    private bsModalRef: BsModalRef,
    private formularioService: ComercialCicloVendasCotacoesFormularioService
  ) {}

  ngOnInit(): void {}

  onClose(): void {
    this.bsModalRef.hide();
  }

  onMaterial(material: ISimilaridadeModel): void {
    this.formularioService.materiaisSubject.next([material]);
    material.onCarrinho = true;
  }
}
