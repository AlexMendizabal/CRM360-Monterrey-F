import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

// Services
import { ComercialClientesDetalheService } from './detalhes.service';

@Injectable({
  providedIn: 'root'
})
export class ComercialClientesDetalhesResolverGuard implements Resolve<any> {
  constructor(private detalhesService: ComercialClientesDetalheService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    if (route.params && route.params['id']) {
      return this.detalhesService.getDetalhes(route.params['id']);
    }

    return of({
      responseCode: 204
    });
  }
}
