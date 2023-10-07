import { Injectable } from '@angular/core';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';


@Injectable({
  providedIn: 'root',
})
export class ComercialCicloVendasCotacoesFormularioModalSelecionarService {

  constructor(
    private pnotifyService: PNotifyService,
  ) {
    this.pnotifyService.getPNotify();
  }

}
