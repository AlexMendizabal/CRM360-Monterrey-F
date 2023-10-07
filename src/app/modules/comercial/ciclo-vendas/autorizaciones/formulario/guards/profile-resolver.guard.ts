import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

// Services
import { ComercialService } from 'src/app/modules/comercial/comercial.service';

// Interfaces
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialCicloVendasCotacoesFormularioProfilesResolverGuard
  implements Resolve<any> {
  constructor(private comercialService: ComercialService) {}

  resolve(): Observable<Object | JsonResponse> {
    return this.comercialService.getPerfil();
  }
}
