import { Injectable } from '@angular/core';

import PNotify from 'pnotify/dist/es/PNotify';
import PNotifyButtons from 'pnotify/dist/es/PNotifyButtons';

@Injectable()
export class PNotifyService {
  stack = {
    dir1: 'up',
    dir2: 'left',
    firstpos1: 25,
    firstpos2: 25
  };

  constructor() {
    PNotify.defaults.styling = 'bootstrap4';
    PNotify.defaults.icons = 'fontawesome5';
    PNotify.defaults.delay = 5000;
  }

  getPNotify() {
    // Inicializa a biblioteca.
    PNotifyButtons;
    return PNotify;
  }

  success(message: string = 'Operación realizada con éxito.') {
    this.showMessage('success', 'Éxito.', message);
  }

  error(message: string = 'Inténtelo de nuevo.') {
    this.showMessage('error', 'Algo salio mal.', message);
  }

  notice(message: string) {
    this.showMessage('notice', 'Advertencia', message);
  }

  delete(message: string = 'Operación eliminada con éxito.'){
    this.showMessage('error', 'Algo salió mal.', message);
  }

  private showMessage(type: string, title: string, message: string) {
    PNotify.alert({
      addClass: 'custom',
      type: type,
      title: title,
      text: message,
      hide: true,
      modules: {
        Buttons: {
          sticker: false
        }
      },
      stack: this.stack
    });
  }
}
