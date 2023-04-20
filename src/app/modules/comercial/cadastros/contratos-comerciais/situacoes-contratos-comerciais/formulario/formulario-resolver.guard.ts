import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

// Services
import { ComercialCadastrosContratosComerciaisSituacoesContratosComerciaisService } from '../situacoes-contratos-comerciais.service';

@Injectable({
  providedIn: 'root',
})
export class ComercialCadastrosContratosComerciaisSituacoesContratosComerciaisFormularioResolverGuard
  implements Resolve<any> {
  constructor(
    private situacoesContratosService: ComercialCadastrosContratosComerciaisSituacoesContratosComerciaisService
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    if (route.params && route.params.id) {
      return this.situacoesContratosService.getDetalhes(route.params.id);
    }

    // É implementado o método "of" para manter a tipagem de retorno com Observable.
    return of({
      success: true,
      data: {
        codSituacao: null,
        nomeSituacao: null,
        inEditar: 1,
        inAprovacao: 1,
        inSituacao: 1,
        situacao: null,
        codUsuario: null,
        nomeUsuario: null,
        dataCadastro: null,
      },
    });
  }
}
