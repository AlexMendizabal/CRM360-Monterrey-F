import {
  Component,
  OnInit,
  Input,
  ContentChild,
  TemplateRef,
  OnChanges,
} from '@angular/core';
import { CustomTableConfig } from './models/config';

@Component({
  selector: 'custom-table',
  templateUrl: './custom-table.component.html',
  styleUrls: ['./custom-table.component.scss'],
})
export class CustomTableComponent implements OnInit, OnChanges {
  @Input('config') config: Partial<CustomTableConfig>;

  @ContentChild('thead', {}) theadTmpl: TemplateRef<any>;
  @ContentChild('tbody', {}) tbodyTmpl: TemplateRef<any>;

  defaultConfig: Partial<CustomTableConfig> = {
    subtitleBorder: false,
    fixedHeader: false,
    bodyHeight: 250,
    isResponsive: false,
    isFixed: false,
    border: true,
    small: true,
    select: true,
    hover: true,
    theme: {
      color: 'light',
    },
  };

  constructor() {}

  ngOnInit(): void {
    this.checkConfig();
  }

  ngOnChanges(): void {
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

  tableClass(): string {
    let tableClass = '';

    if (this.defaultConfig.subtitleBorder === true) {
      tableClass = `${tableClass} custom-border`;
    }

    if (this.defaultConfig.fixedHeader === true) {
      tableClass = `${tableClass} table-fixed-header`;
    }

    if (this.defaultConfig.isFixed === true) {
      tableClass = `${tableClass} table-fixed`;
    }

    if (this.defaultConfig.border === true) {
      tableClass = `${tableClass} border`;
    }

    if (this.defaultConfig.select === false) {
      tableClass = `${tableClass} no-select`;
    }

    if (this.defaultConfig.hover === true) {
      tableClass = `${tableClass} table-hover`;
    }

    tableClass = `${tableClass} ${this.tableSize()}`;

    return tableClass;
  }

  tableSize(): string {
    return this.defaultConfig.small === true ? 'table-sm' : '';
  }

  bodyHeight(): Object {
    let ngStyle = {};

    if (this.defaultConfig.fixedHeader === true) {
      ngStyle = {
        height: `${this.defaultConfig.bodyHeight}px`,
      };
    }

    return ngStyle;
  }
}
