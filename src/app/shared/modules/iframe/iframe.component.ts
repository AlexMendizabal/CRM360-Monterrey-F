import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'custom-iframe',
  templateUrl: './iframe.component.html',
  styleUrls: ['./iframe.component.scss']
})
export class IframeComponent implements OnInit {
  @Input() url: string;

  constructor() {}

  ngOnInit() {}
}
