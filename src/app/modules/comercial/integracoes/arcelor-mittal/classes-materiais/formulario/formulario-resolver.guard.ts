import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

// Services
import { ComercialIntegracoesArcelorMittalClassesMateriaisService } from '../classes-materiais.service';

@Injectable({
  providedIn: 'root'
})
export class ComercialIntegracoesClassesMateriaisFormularioResolverGuard
  implements Resolve<any> {
  constructor(
    private classesMateriaisService: ComercialIntegracoesArcelorMittalClassesMateriaisService
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    if (route.params && route.params['id']) {
      return this.classesMateriaisService.getAssociacoes(route.params['id']);
    }

    // É implementado o método "of" para manter a tipagem de retorno com Observable.
    return of({
      responseCode: 200,
      result: []
    });
  }
}
