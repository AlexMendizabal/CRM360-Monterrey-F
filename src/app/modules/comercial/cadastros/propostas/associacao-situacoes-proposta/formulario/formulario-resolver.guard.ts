import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

// Services
import { ComercialCadastrosPropostasAssociacaoSituacoesPropostaService } from '../associacao-situacoes-proposta.service';

@Injectable({
  providedIn: 'root',
})
export class ComercialCadastrosPropostasAssociacaoSituacoesPropostaFormularioResolverGuard
  implements Resolve<any> {
  constructor(
    private materiaisSimilaridadeService: ComercialCadastrosPropostasAssociacaoSituacoesPropostaService
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    if (route.params && route.params.id) {
      return this.materiaisSimilaridadeService.getDetalhes(route.params.id);
    }

    // É implementado o método "of" para manter a tipagem de retorno com Observable.
    return of({
      success: true,
      mensagem: null,
      data: {
        codAssociacao: null,
        descLegenda: null,
        cor: '#0033FF',
        ordemExibicao: '',
        codSituacao: 1,
        situacoesAssociadas: [],
      },
    });
  }
}
