import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

// Services
import { ComercialCadastrosAssociacaoLinhasService } from '../associacao-linhas.service';

@Injectable({
  providedIn: 'root',
})
export class ComercialCadastrosAssociacaoLinhasFormularioResolverGuard
  implements Resolve<any> {
  constructor(
    private associacaoLinhasService: ComercialCadastrosAssociacaoLinhasService
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    if (route.params && route.params.id) {
      return this.associacaoLinhasService.getDetalhes({
        ID_LINH: route.params.id,
        IN_STAT:1,
      });
    }

    // É implementado o método "of" para manter a tipagem de retorno com Observable.
    return of({
      success: true,
      mensagem: null,
      data: {
        ID_LINH: null,
        NM_LINH: null,
        setores: [],
      },
    });
  }
}
