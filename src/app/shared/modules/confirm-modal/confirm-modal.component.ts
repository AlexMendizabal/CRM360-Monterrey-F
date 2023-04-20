import { Component, OnInit, Input } from '@angular/core';
import { Subject } from 'rxjs';

// ngx-bootstrap
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss']
})
export class ConfirmModalComponent implements OnInit {
  @Input() type: string;
  @Input() title: string;
  @Input() message: string;
  @Input() messageAlerts: Array<string>;
  @Input() cancelTxt: string = 'Cancelar';
  @Input() okTxt: string = 'Sim';

  confirmResult: Subject<boolean>;

  constructor(private bsModalRef: BsModalRef) {}

  ngOnInit() {
    this.confirmResult = new Subject();
  }

  onConfirm() {
    this.confirmAndClose(true);
  }

  onClose() {
    this.confirmAndClose(false);
  }

  private confirmAndClose(value: boolean) {
    this.confirmResult.next(value);
    this.bsModalRef.hide();
  }

  showHeader(): boolean {
    if (
      this.type === 'delete' ||
      this.type === 'inactivate' ||
      this.title !== null
    )
      return true;

    return false;
  }

  showBodyMessage(): boolean {
    if (this.type === 'delete' || this.type === 'inactivate') return true;

    return false;
  }

  bodyMessageClass(): string {
    if (this.type === 'delete' || this.type === 'inactivate') return '';

    return 'mb-0';
  }

  buttonClass(): string {
    let buttonClass = '';

    if (this.type === null || this.type === '') {
      buttonClass = 'btn-primary';
    } else if (this.type === 'delete' || this.type === 'inactivate') {
      buttonClass = 'btn-danger';
    }

    return buttonClass;
  }
}
