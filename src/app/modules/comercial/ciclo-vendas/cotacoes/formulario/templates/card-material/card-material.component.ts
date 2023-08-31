import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

// Interfaces
import { ISimilaridadeModel } from '../../models/similaridade';

@Component({
  selector: 'comercial-ciclo-vendas-cotacoes-formulario-template-card-material',
  templateUrl: './card-material.component.html',
  styleUrls: ['./card-material.component.scss'],
})
export class ComercialCicloVendasCotacoesFormularioTemplateCardMaterialComponent
  implements OnInit {
  @Input('size') size = '';
  @Input('material') material: ISimilaridadeModel;
  @Input('filtro') filtro;

  

  @Output('onMaterial') onMaterial: EventEmitter<
    ISimilaridadeModel
  > = new EventEmitter();

  constructor() {}

  ngOnInit(): void {
  }
  
  onAddMaterial(material: ISimilaridadeModel): void {
    
  /*   console.log(this.filtro);
     console.log(material);  */
    this.onMaterial.emit(material);
  }
}
