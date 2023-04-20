import { assocTabela } from './../models/tabela-precos';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

// Services
import { ComercialGestaoTabelaPrecosService } from './../tabela-precos.service';

@Injectable({
  providedIn: 'root',
})
export class ComercialGestaoTabelaPrecosFormularioResolverGuard
  implements Resolve<any> {
  constructor(
    private tabelaPrecosService: ComercialGestaoTabelaPrecosService
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    if (route.params && route.params.id) {
      return this.tabelaPrecosService.getDetalhes(route.params.id);
    }

    // É implementado o método "of" para manter a tipagem de retorno com Observable.
    return of({
      success: true,
      mensagem: null,
      data: {
        codPreco: null,
        nomePreco: null,
        codSituacao: null,
        dataInicialVigencia: null,
        dataFinalVigencia: null,
        nomeUsuario: null,
        dataCadastro: null,
        assocGrupos: [],
      },
    });
  }
}
