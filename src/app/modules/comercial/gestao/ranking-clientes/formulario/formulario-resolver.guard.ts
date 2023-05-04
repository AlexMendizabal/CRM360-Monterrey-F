import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

// Services
import { ComercialGestaoRankingClientesService } from '../ranking-clientes.service';

@Injectable({
  providedIn: 'root',
})
export class ComercialGestaoRankingClientesFormularioResolverGuard
  implements Resolve<any> {
  constructor(private rankingClientesService: ComercialGestaoRankingClientesService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    if (route.params && route.params.id) {
      return this.rankingClientesService.getDetalhes(route.params.id);
    }
    
    // É implementado o método "of" para manter a tipagem de retorno com Observable.
    return of({
      success: true,
      data: {
        codClassificacao: null,
        nomeClassificacao: null,
        peso: null,
        nota1Fim: null,
        nota2Inicio: null,
        nota2Fim: null,
        nota3Inicio: null,
        nota3Fim: null,
        nota4Inicio: null,
        nota4Fim: null,
        nota5Inicio: null,
        situacao: null
      },
    });
  }
}
