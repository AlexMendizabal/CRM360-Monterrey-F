import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';

// Services
import { ComercialAgendaService } from 'src/app/modules/comercial/agenda/agenda.service';

// Interfaces
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialAgendaAcessosResolverGuard implements Resolve<any> {
  constructor(private agendaService: ComercialAgendaService) {}

  resolve(): Observable<Object | JsonResponse> {
    return this.agendaService.getAcessos();
  }
}
