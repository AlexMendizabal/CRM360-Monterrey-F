import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DetailPanelService {
  config: EventEmitter<any> = new EventEmitter();

  constructor() {}

  show(): void {
    this.config.emit({
      showing: true,
      loading: true,
      loaded: false,
      empty: true
    });
  }

  hide(): void {
    this.config.emit({
      showing: false,
      loading: false,
      loaded: false,
      empty: true
    });
  }

  loadedFinished(isEmpty: boolean): void {
    this.config.emit({
      showing: true,
      loading: false,
      loaded: true,
      empty: isEmpty
    });
  }
}
