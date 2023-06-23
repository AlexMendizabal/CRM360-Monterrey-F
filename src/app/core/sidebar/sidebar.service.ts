import { Injectable, EventEmitter } from '@angular/core';

// Services
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  loadAtividadesEmitter: EventEmitter<any> = new EventEmitter();

  constructor(private atividadesService: AtividadesService) {}

  getAtividades(idModulo: number) {
    return this.atividadesService.getAtividades(idModulo);
  }
}
