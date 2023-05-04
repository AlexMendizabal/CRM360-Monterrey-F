import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';

// Services
import { LogisticaEntradaMateriaisService } from '../services/entrada-materiais.service';
// Interfaces
import { JsonResponse } from 'src/app/models/json-response';


@Injectable({
  providedIn: 'root',
})
export class LogisticaEntradaMateriaisAcessosResolverGuard implements Resolve<any> {
  constructor(private agendaService: LogisticaEntradaMateriaisService) {}

  resolve(): Observable<Object | JsonResponse> {
    return this.agendaService.getAcessos();
  }
}
