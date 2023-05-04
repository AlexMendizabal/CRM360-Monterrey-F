import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

// Services
import { ComercialCadastrosTipoOperadorService } from '../tipo-operadores.service';

@Injectable({
  providedIn: 'root'
})
export class ComercialCadastrosTipoOperadorFormularioResolverGuard
  implements Resolve<any> {
  constructor(
    private tipoOperadorService: ComercialCadastrosTipoOperadorService
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    if (route.params && route.params.id) {
      return this.tipoOperadorService.getDetalhes(route.params.id);
    }

    // É implementado o método "of" para manter a tipagem de retorno com Observable.
    return of({
      success: true,
      data: {
        codTipoOperador: null,
        tipo: null,
        codSituacao: 1
      }
    });
  }
}
