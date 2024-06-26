import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss']
})
export class AppHeaderComponent implements OnInit {
  @Input('show') show = true;
  @Input('backButton') backButton = true;
  @Input('appTitle') appTitle: string;

  constructor() {}

  ngOnInit() {}
}
