import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';

import { ComercialClientesService } from 'src/app/modules/comercial/services/clientes.service';

@Injectable({
  providedIn: 'root'
})
export class ComercialClientesCadastroPotencialCompraResolverGuard
  implements Resolve<any> {
  constructor(private clienteService: ComercialClientesService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    if (route.parent.parent.params && route.parent.parent.params['id']) {
      return this.clienteService.getPotencialCompra(
        route.parent.parent.params['id']
      );
    }
  }
}
