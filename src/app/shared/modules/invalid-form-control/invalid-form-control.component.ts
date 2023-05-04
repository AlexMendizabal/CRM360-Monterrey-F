import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'invalid-form-control',
  templateUrl: './invalid-form-control.component.html',
  styleUrls: ['./invalid-form-control.component.scss']
})
export class InvalidFormControlComponent implements OnInit {
  @Input() show: boolean;
  @Input() message: string;

  constructor() {}

  ngOnInit() {}
}
