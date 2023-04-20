import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'card-button',
  templateUrl: './card-button.component.html',
  styleUrls: ['./card-button.component.scss'],
})
export class CardButtonComponent implements OnInit {
  @Input('class') class: string;
  @Input('icon') icon: string;
  @Input('text') text: string;
  @Input('view') view: string = 'Grid';

  constructor() {}

  ngOnInit() {}

  cardClass(): string {
    const viewClass = this.view === 'List' ? 'list' : 'grid';

    return `${this.class} ${viewClass}`;
  }

  iconClass(): string {
    return this.icon;
  }
}
