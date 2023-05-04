import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'permission-denied',
  templateUrl: './permission-denied.component.html',
  styleUrls: ['./permission-denied.component.scss']
})
export class PermissionDeniedComponent implements OnInit {
  @Input('message') message: string;

  constructor() {}

  ngOnInit() {}
}
