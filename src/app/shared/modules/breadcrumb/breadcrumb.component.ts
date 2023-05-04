import { Component, OnInit, Input } from '@angular/core';

// Interfaces
import { Breadcrumb } from './breadcrumb';

@Component({
  selector: 'breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit {
  @Input('tree') tree: Array<Breadcrumb> = [];

  constructor() {}

  ngOnInit() {}
}
