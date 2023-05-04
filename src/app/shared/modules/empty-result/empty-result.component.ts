import { Component, Input } from '@angular/core';

@Component({
  selector: 'empty-result',
  templateUrl: './empty-result.component.html',
  styleUrls: ['./empty-result.component.scss']
})
export class EmptyResultComponent {
  @Input('position') position = 'center';
  @Input('message') message: string;
}
