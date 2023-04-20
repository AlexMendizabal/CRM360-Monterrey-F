import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

// Services
import { ComercialCadastrosMotivoAssociacaoService } from '../motivo-associacao.service';

@Injectable({
  providedIn: 'root'
})
export class ComercialCadastrosMotivoAssociacaoFormularioResolverGuard
  implements Resolve<any> {
  constructor(
    private motivoAssociacaoService: ComercialCadastrosMotivoAssociacaoService
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    if (route.params && route.params.id) {
      return this.motivoAssociacaoService.getDetalhes(route.params.id);
    }

    // É implementado o método "of" para manter a tipagem de retorno com Observable.
    return of({
      success: true,
      data: {
        codMotivoAssociacao: null,
        motivoAssociacao: null,
        codCarteira: null,
        codSituacao: null,
        situacao: null,
        codUsuario: null,
        nomeUsuario: null,
        dataCadastro: null
      }
    });
  }
}
