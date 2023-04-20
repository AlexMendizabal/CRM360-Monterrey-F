import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-body',
  templateUrl: './app-body.component.html',
  styleUrls: ['./app-body.component.scss']
})
export class AppBodyComponent implements OnInit {
  @Input('show') show = true;
  @Input('breadCrumbTree') breadCrumbTree: any = [];

  constructor() {}

  ngOnInit() {}

  onShowBreadCrumb(): boolean {
    if (
      typeof this.breadCrumbTree !== 'undefined' &&
      this.breadCrumbTree.length > 0
    ) {
      return true;
    } else {
      return false;
    }
  }
}
