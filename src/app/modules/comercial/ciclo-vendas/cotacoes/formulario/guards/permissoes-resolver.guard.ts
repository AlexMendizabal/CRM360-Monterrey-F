import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

// Services
import { ComercialCicloVendasCotacoesService } from '../../cotacoes.service';

// Interfaces
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialCicloVendasCotacoesFormularioPermissoesResolverGuard
  implements Resolve<any> {
  constructor(private cotacoesService: ComercialCicloVendasCotacoesService) {}

  resolve(): Observable<Object | JsonResponse> {
    return this.cotacoesService.getPermissoesAcesso();
  }
}
