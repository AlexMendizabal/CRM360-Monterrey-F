import { EventEmitter, Injectable, TemplateRef } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { AuthService } from 'src/app/shared/services/core/auth.service';

@Injectable({
  providedIn: 'root'
})

export class ChangePasswordModalService {
  modalRef: BsModalRef;

  constructor(
    private authService: AuthService,
    private bsModalService: BsModalService
  ) { }

  show(template: TemplateRef<any>) {
    this.modalRef = this.bsModalService.show(template, {
      class: 'modal-lg',
    });
  }

  hide() {
    this.modalRef.hide();
  }

  changePassword(data: any) {
    return this.authService.changePassword(data);
  }

}
