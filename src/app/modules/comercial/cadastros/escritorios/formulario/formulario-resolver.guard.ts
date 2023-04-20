import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

// Services
import { ComercialCadastrosEscritorioService } from '../escritorios.service';

@Injectable({
  providedIn: 'root'
})
export class ComercialCadastrosEscritorioFormularioResolverGuard
  implements Resolve<any> {
  constructor(private escritorioService: ComercialCadastrosEscritorioService) { }

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    if (route.params && route.params.id) {
      return this.escritorioService.getDetalhes(route.params.id);
    }

    // É implementado o método "of" para manter a tipagem de retorno com Observable.
    return of({
      success: true,
      data: {
        codEscritorio: null,
        nomeEscritorio: null,
        codEmpresa: null,
        nomeEmpresa: null,
        codSituacao: 1,
        situacao: null,
        codUsuario: null,
        nomeUsuario: null,
        dataCadastro: null
      }
    });
  }
}
