import { Injectable } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';

// Components
import { ConfirmModalComponent } from './confirm-modal.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmModalService {
  constructor(private modalService: BsModalService) {}

  showConfirm(
    type: string,
    title: string,
    message: string,
    cancelTxt?: string,
    okTxt?: string
  ) {
    const modalRef = this.modalService.show(ConfirmModalComponent, {
      animated: false,
      ignoreBackdropClick: true,
      keyboard: false,
      class: 'confirm'
    });

    modalRef.content.type = type;
    modalRef.content.title = title;
    modalRef.content.message = message;

    if (type === 'delete') {
      modalRef.content.messageAlerts = [
        "Se eliminará toda la información relacionada.",
        "Esta acción no se puede deshacer."
      ];
    }

    if (type === 'inactivate') {
      modalRef.content.messageAlerts = [
        'Las informaciones serán inactivadas.'
      ];
    }

    if (cancelTxt) {
      modalRef.content.cancelTxt = cancelTxt;
    }

    if (okTxt) {
      modalRef.content.okTxt = okTxt;
    }

    // É uma boa prática tipar o retorno.
    // Obs.: ao tipar o retorno é possível acessar o intellisense do serviço.
    return (<ConfirmModalComponent>modalRef.content).confirmResult;
  }
}
