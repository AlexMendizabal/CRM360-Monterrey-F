import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

// Services
import { ComercialCadastrosMateriaisFichaCadastralService } from '../ficha-cadastral.service';

@Injectable({
  providedIn: 'root',
})
export class ComercialCadastrosSetorAtividadeFormularioResolverGuard
  implements Resolve<any> {
  constructor(
    private fichaCadastralService: ComercialCadastrosMateriaisFichaCadastralService
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    if (route.params && route.params.id) {
      return this.fichaCadastralService.getDetalhes(route.params.id);
    }

    // É implementado o método "of" para manter a tipagem de retorno com Observable.
    return of({
      success: true,
      data: {
        codFichaCadastral: null,
        codMaterial: null,
        nomeMaterial: null,
        descMaterial: null,
        codSituacao: 1,
        situacao: null,
        anexos: [],
      },
    });
  }
}
