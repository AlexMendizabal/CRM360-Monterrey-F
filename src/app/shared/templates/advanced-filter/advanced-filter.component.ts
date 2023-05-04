import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'advanced-filter',
  templateUrl: './advanced-filter.component.html',
  styleUrls: ['./advanced-filter.component.scss']
})
export class AdvancedFilterComponent implements OnInit {
  showAdvancedFilter = true;

  constructor() {}

  ngOnInit() {}

  onAdvancedFilter() {
    this.showAdvancedFilter = !this.showAdvancedFilter;
  }
}
