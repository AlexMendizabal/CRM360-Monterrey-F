import { Component, OnInit, Input } from '@angular/core';
import { IAtividade } from 'src/app/models/atividade';

@Component({
  selector: 'card-group',
  templateUrl: './card-group.component.html',
  styleUrls: ['./card-group.component.scss'],
})
export class CardGroupComponent implements OnInit {
  @Input('text') text: string = 'Selecione uma atividade';
  @Input('list') atividades: Array<IAtividade> = [];

  view = {
    icon: '',
    type: '',
  };

  constructor() {}

  ngOnInit(): void {
    this.setView('Grid');
  }

  setView(type: string): void {
    if (type === 'List') {
      this.view.type = 'List';
      this.view.icon = 'fas fa-th';
    } else if (type === 'Grid') {
      this.view.type = 'Grid';
      this.view.icon = 'fas fa-list';
    }
  }

  onChangeView(): void {
    const type = this.view.type === 'List' ? 'Grid' : 'List';
    this.setView(type);
  }

  viewGridClass(): string {
    let gridClass: string;

    if (this.view.type === 'List') {
      gridClass = 'col-lg-6';
    } else if (this.view.type === 'Grid') {
      gridClass = 'col-lg-3';
    }

    return gridClass;
  }
}
