import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

// Services
import { ComercialIntegracoesArcelorMittalVendedoresService } from '../vendedores.service';

@Injectable({
  providedIn: 'root',
})
export class ComercialIntegracoesArcelorMittalVendedoresFormularioResolverGuard
  implements Resolve<any> {
  constructor(
    private vendedoresService: ComercialIntegracoesArcelorMittalVendedoresService
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    // console.log(route);
    // if (route.params && route.params['id']) {
    //   return this.vendedoresService.getAssociacoes(route.params['id']);
    // }

    // É implementado o método "of" para manter a tipagem de retorno com Observable.
    return of({
      responseCode: 200,
      result: [],
    });
  }
}
