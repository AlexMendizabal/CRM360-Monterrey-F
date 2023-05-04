import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

// Interfaces
import { Subtitles } from './subtitles';

@Component({
  selector: 'subtitles',
  templateUrl: './subtitles.component.html',
  styleUrls: ['./subtitles.component.scss'],
})
export class SubtitlesComponent implements OnInit {
  @Input() data: Array<Subtitles> = [];
  @Input() allowActivation = false;
  @Input() show: boolean;

  @Output() activationChange: EventEmitter<Subtitles> = new EventEmitter();

  activeIndex: number;

  constructor() {}

  ngOnInit() {}

  setActive(index: number): void {
    if (this.activeIndex !== index && this.allowActivation === true) {
      this.activeIndex = index;
      this.activationChange.emit(this.data[index]);
    } else {
      this.activeIndex = null;

      if (this.allowActivation === true) {
        this.activationChange.emit(null);
      }
    }
  }

  subtitleClass(index: number, item: Subtitles): string {
    let subtitleClass = item.color ? item.color : '';

    if (this.activeIndex === index) {
      subtitleClass = `${subtitleClass} active`;
    }

    if (this.allowActivation === true) {
      subtitleClass = `${subtitleClass} hover`;
    }

    return subtitleClass;
  }

  subtitleStyle(index: number, item: Subtitles): object {
    if (this.activeIndex === index && item.hex) {
      return {
        'border-color': item.hex,
      };
    }

    return {};
  }

  squareStyle(item: Subtitles): object {
    if (item.hex) {
      return {
        'background-color': item.hex,
      };
    }

    return {};
  }

  textStyle(item: Subtitles): object {
    if (item.hex) {
      return {
        color: item.hex,
      };
    }

    return {};
  }
}
