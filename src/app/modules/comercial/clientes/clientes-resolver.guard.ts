import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

// Services
import { ComercialClientesService } from 'src/app/modules/comercial/services/clientes.service';

@Injectable({
  providedIn: 'root'
})
export class ComercialClientesResolverGuard implements Resolve<any> {
  constructor(private clientesService: ComercialClientesService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    if (route.params && route.params['id']) {
      return this.clientesService.getPermissaoAcesso(route.params['id']);
    }

    return of({
      responseCode: 403
    });
  }
}
