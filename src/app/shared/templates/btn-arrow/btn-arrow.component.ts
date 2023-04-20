import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'btn-arrow',
  templateUrl: './btn-arrow.component.html',
  styleUrls: ['./btn-arrow.component.scss']
})
export class BtnArrowComponent implements OnInit {

  status: boolean = false;
  @Output() onStatus = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit(): void {
  }

  onToggle(){
    this.status = !this.status;
    this.onStatus.emit(this.status);
  }

}
