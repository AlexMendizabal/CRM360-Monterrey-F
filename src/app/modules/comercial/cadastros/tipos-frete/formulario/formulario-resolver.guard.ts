import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

// Services
import { ComercialCadastrosTiposFreteService } from '../tipos-frete.service';

@Injectable({
  providedIn: 'root',
})
export class ComercialCadastrosTiposFreteFormularioResolverGuard
  implements Resolve<any> {
  constructor(private tiposFreteService: ComercialCadastrosTiposFreteService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    if (route.params && route.params.id) {
      return this.tiposFreteService.getDetalhes(route.params.id);
    }

    // É implementado o método "of" para manter a tipagem de retorno com Observable.
    return of({
      success: true,
      data: {
        codigo: null,
        codTipoFrete: null,
        descricao: null,
        codSituacao: null,
        situacao: null,
        codUsuario: null,
        nomeUsuario: null,
        dataCadastro: null,
      },
    });
  }
}
