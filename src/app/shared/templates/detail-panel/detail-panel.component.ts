import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';

// Services
import { DetailPanelService } from './detal-panel.service';

@Component({
  selector: 'detail-panel',
  templateUrl: './detail-panel.component.html',
  styleUrls: ['./detail-panel.component.scss']
})
export class DetailPanelComponent implements OnInit {
  @ViewChild('scroll', {}) scroll: ElementRef;
  @Input('panelTitle') title: string;

  config = {
    showing: false,
    loading: false,
    loaded: false,
    empty: true
  };

  constructor(private detailPanelService: DetailPanelService) {}

  ngOnInit() {
    this.checkTitle();
    this.onEventEmitter();
  }

  checkTitle(): void {
    this.title =
      typeof this.title != 'undefined' && this.title.length > 0
        ? this.title
        : 'Detalhes';
  }

  onClose(): void {
    this.detailPanelService.hide();
  }

  onEventEmitter(): void {
    this.detailPanelService.config.subscribe((event: any) => {
      this.config = event;

      if (this.config.showing === true) {
        this.scroll.nativeElement.scrollIntoView({
          behavior: 'instant'
        });
      }
    });
  }
}
