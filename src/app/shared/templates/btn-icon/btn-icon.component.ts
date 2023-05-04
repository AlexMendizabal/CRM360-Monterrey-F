import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'btn-icon',
  templateUrl: './btn-icon.component.html',
  styleUrls: ['./btn-icon.component.scss'],
})
export class BtnIconComponent implements OnInit {
  @Input('icon') icon: string;
  @Input('size') size = 'medium';
  @Input('disabled') disabled: boolean;

  constructor() {}

  ngOnInit(): void {}
}
