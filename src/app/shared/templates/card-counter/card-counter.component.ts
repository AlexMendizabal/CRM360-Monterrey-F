import { Component, OnInit, Input } from '@angular/core';

// Interfaces
import { CardCounterConfig } from './models/config';

@Component({
  selector: 'card-counter',
  templateUrl: './card-counter.component.html',
  styleUrls: ['./card-counter.component.scss'],
})
export class CardCounterComponent implements OnInit {
  @Input('icon') icon: string;
  @Input('color') color: string;
  @Input('counter') counter: number;
  @Input('duration') duration: number = 3;
  @Input('text') text: string;
  @Input('config') config: Partial<CardCounterConfig>;

  countFrom = 0;
  countTo: number;

  defaultConfig: Partial<CardCounterConfig> = {
    showDecimals: true,
    format: 'number',
  };

  constructor() {}

  ngOnInit(): void {
    this.checkConfig();
  }

  checkConfig(): void {
    if (this.config) {
      for (let key in this.config) {
        const value = this.config[key];
        this.defaultConfig[key] = value;
      }
    }
  }

  iconClass(): string {
    return this.icon;
  }

  colorClass(): string {
    return this.color;
  }

  onCountoEnd(): void {
    this.countFrom = this.counter;
  }
}
