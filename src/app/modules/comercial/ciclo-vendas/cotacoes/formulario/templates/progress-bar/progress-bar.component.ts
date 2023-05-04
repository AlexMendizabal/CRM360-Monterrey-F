import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'comercial-ciclo-vendas-cotacoes-formulario-template-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss']
})
export class ComercialCicloVendasCotacoesFormularioTemplateProgressBarComponent
  implements OnInit {
  @Input('metaAtual') metaAtual: number;
  @Input('somaCotacao') somaCotacao: number;

  countoSomaCotacao: number;

  constructor() {}

  ngOnInit(): void {}

  classMeta(): string {
    let progressClass = '';

    if (this.metaAtual < 88) {
      progressClass = 'red';
    } else if (this.metaAtual > 88 && this.metaAtual < 95) {
      progressClass = 'yellow';
    } else if (this.metaAtual > 95) {
      progressClass = 'green';
    }

    return progressClass;
  }
}
