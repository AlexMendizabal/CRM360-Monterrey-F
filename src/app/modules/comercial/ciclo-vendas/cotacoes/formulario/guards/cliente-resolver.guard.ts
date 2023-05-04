import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

// Services
import { ComercialVendedoresService } from 'src/app/modules/comercial/services/vendedores.service';

// Interfaces
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialCicloVendasCotacoesFormularioClienteResolverGuard
  implements Resolve<any> {
  constructor(private vendedoresService: ComercialVendedoresService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<Object | JsonResponse> {
    if (route.params && route.params.codCliente) {
      return this.vendedoresService.getValidaClienteCarteira(
        route.params.codCliente
      );
    }

    // É implementado o método "of" para manter a tipagem de retorno com Observable.
    return of({
      success: true,
      mensagem: null,
      data: {
        podeAcessar: true,
      },
    });
  }
}
