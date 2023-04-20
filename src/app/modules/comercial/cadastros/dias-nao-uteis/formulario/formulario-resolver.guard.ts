import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

// Services
import { ComercialCadastrosDiaNaoUtilService } from '../dias-nao-uteis.service';

@Injectable({
  providedIn: 'root'
})
export class ComercialCadastrosDiaNaoUtilFormularioResolverGuard
  implements Resolve<any> {
  constructor(private diaNaoUtilService: ComercialCadastrosDiaNaoUtilService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    if (route.params && route.params.id) {
      return this.diaNaoUtilService.getDetalhes(route.params.id);
    }

    // É implementado o método "of" para manter a tipagem de retorno com Observable.
    return of({
      success: true,
      data: {
        codigo: null,
        data: null,
        motivo: null,
        codSituacao: 1
      }
    });
  }
}
