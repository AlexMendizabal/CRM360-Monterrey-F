import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
})
export class MessageComponent implements OnInit {
  @Input('icon') icon: string;
  @Input('text') text: string;
  @Input('position') position = 'center';

  constructor() {}

  ngOnInit(): void {}
}
