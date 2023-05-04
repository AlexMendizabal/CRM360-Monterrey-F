import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

// Services
import { TecnologiaInformacaoControleLinhaService } from '../controle-linhas.service';

@Injectable({
  providedIn: 'root'
})
export class TecnologiaInformacaoControleLinhaFormularioResolverGuard
  implements Resolve<any> {
  constructor(
    private controleLinhasService: TecnologiaInformacaoControleLinhaService
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    if (route.params && route.params.id) {
      return this.controleLinhasService.getDetalhes(route.params.id);
    }

    // É implementado o método "of" para manter a tipagem de retorno com Observable.
    return of({
      success: true,
      data: {
        codLinha: null,
        codPatrimonio: null,
        descricao: null,
        codEscritorio: null,
        nomeEscritorio: null,
        codEmpresa: null,
        nomeEmpresa: null,
        codSituacao: null,
        situacao: null,
        valor: null,
        numContrato: null,
        dataVencimentoContrato: null,
        codUsuario: null,
        nomeUsuario: null,
        dataCadastro: null
      }
    });
  }
}
