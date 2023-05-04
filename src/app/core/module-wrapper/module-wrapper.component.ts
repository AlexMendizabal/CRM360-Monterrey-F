import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'core-module-wrapper',
  templateUrl: './module-wrapper.component.html',
  styleUrls: ['./module-wrapper.component.scss']
})
export class ModuleWrapperComponent implements OnInit {
  openMenu = false;

  constructor() {}

  ngOnInit() {}

  onEventMenu(event: boolean) {
    this.openMenu = event;
  }

  isMenuOpen() {
    return this.openMenu;
  }
}
