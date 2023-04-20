import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

// Services
import { ComercialCadastrosMateriaisGrupoService } from '../grupos.service';

@Injectable({
  providedIn: 'root',
})
export class ComercialCadastrosMateriaisGrupoFormularioResolverGuard
  implements Resolve<any> {
  constructor(
    private materiaisGruposService: ComercialCadastrosMateriaisGrupoService
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    if (route.params && route.params.id) {
      return this.materiaisGruposService.getDetalhes(route.params.id);
    }

    // É implementado o método "of" para manter a tipagem de retorno com Observable.
    return of({
      success: true,
      mensagem: null,
      data: {
        codGrupo: null,
        nomeGrupo: null,
        precoGrupo: null,
        codSituacao: '',
        materiais: [],
      },
    });
  }
}
