import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

// Services
import { ComercialCadastrosSituacaoPropostaService } from '../situacao-proposta.service';

@Injectable({
  providedIn: 'root',
})
export class ComercialCadastrosSituacaoPropostaFormularioResolverGuard
  implements Resolve<any> {
  constructor(
    private situacaoPropostaService: ComercialCadastrosSituacaoPropostaService
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    if (route.params && route.params.id) {
      return this.situacaoPropostaService.getDetalhes(route.params.id);
    }

    // É implementado o método "of" para manter a tipagem de retorno com Observable.
    return of({
      success: true,
      data: {
        codSituacaoProposta: null,
        situacaoProposta: null,
        codParametroSituacaoProposta: 0,
        codSituacao: null,
        codTipoFinalizacao: 0,
        permiteAlterarEmpresa: 0,
      },
    });
  }
}
