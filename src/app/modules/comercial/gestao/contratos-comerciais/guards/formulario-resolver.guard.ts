

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

// Services
import { ComercialGestaoContratosComerciaisService } from './../contratos-comerciais.service';

@Injectable({
  providedIn: 'root',
})
export class ComercialoGestaoContratosComerciaisFormularioResolverGuard
  implements Resolve<any> {
  constructor( private contratosComerciaisService: ComercialGestaoContratosComerciaisService,

  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    if (route.params && route.params.id) {
      return this.contratosComerciaisService.getDetalhes(route.params.id);
    }

    // É implementado o método "of" para manter a tipagem de retorno com Observable.
    return of({
      success: true,
      mensagem: null,
      data: [
        {
          codContrato: null,
          codCliente: [],
          nomeContrato: null,
          dataInicialVigencia: null,
          dataFinalVigencia: null,
          codSituacao: null,
          qtdeMaximaConsumo: null,
          materiais: []
      }
    ],
    });
  }
}
