import {
  Component,
  Input,
  OnChanges,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter
} from '@angular/core';

// ngx-bootstrap
import { PageChangedEvent } from 'ngx-bootstrap/pagination';

@Component({
  selector: 'comercial-dashboard-vendedor-analitico',
  templateUrl: './analitico.component.html',
  styleUrls: ['./analitico.component.scss']
})
export class ComercialDashboardVendedorAnaliticoComponent implements OnChanges {
  @Input() data: any;
  @Output('close') closeEmitter: EventEmitter<boolean> = new EventEmitter();
  @ViewChild('scroll', { static: false }) scroll: ElementRef;

  tableTitle: string;
  tableConfig: string;
  tableData: any;
  tableDataReturned: any;

  maxSize: number = 10;
  itemsPerPage: number = 10;

  constructor() {}

  ngOnChanges() {
    this.tableTitle = `${this.data.config.title} - ${this.data.data.tipo}`;
    this.tableConfig = this.data.config.type;
    this.tableData = this.data.data.data;
    this.tableDataReturned = this.tableData.slice(0, this.itemsPerPage);
    this.scrollToBottom();
  }

  onPageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.tableDataReturned = this.tableData.slice(startItem, endItem);
  }

  scrollToBottom() {
    setTimeout(() => {
      this.scroll.nativeElement.scrollIntoView();
    }, 500);
  }

  onClose() {
    this.closeEmitter.emit(true);
  }
}
