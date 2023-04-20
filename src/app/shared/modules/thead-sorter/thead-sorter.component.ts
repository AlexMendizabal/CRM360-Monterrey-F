import { Component, Input } from '@angular/core';

@Component({
  selector: 'thead-sorter',
  templateUrl: './thead-sorter.component.html',
  styleUrls: ['./thead-sorter.component.scss']
})
export class TheadSorterComponent {
  @Input('value') value = '';
  @Input('active') active: boolean;
  @Input('sort') sort: string;

  iconClass() {
    let iconClass: string;

    if (this.active === true) {
      if (this.sort.toLowerCase() === 'asc') {
        iconClass = 'fas fa-sort-up';
      } else if (this.sort.toLowerCase() === 'desc') {
        iconClass = 'fas fa-sort-down';
      }
    } else {
      iconClass = 'fas fa-sort';
    }

    return iconClass;
  }
}
