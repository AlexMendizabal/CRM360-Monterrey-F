import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

// Services
import { ComercialCadastrosMateriaisSimilaridadeService } from '../similaridade.service';

@Injectable({
  providedIn: 'root',
})
export class ComercialCadastrosMateriaisSimilaridadeFormularioResolverGuard
  implements Resolve<any> {
  constructor(
    private materiaisSimilaridadeService: ComercialCadastrosMateriaisSimilaridadeService
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
        codSimilaridade: null,
        codMaterial: null,
        nomeMaterial: null,
        codSituacao: '',
        materiais: [],
      },
    });
  }
}
