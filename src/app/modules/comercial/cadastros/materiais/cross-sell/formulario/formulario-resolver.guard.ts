import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

// Services
import { ComercialCadastrosMateriaisCrossSellService } from '../cross-sell.service';

@Injectable({
  providedIn: 'root',
})
export class ComercialCadastrosMateriaisCrossSellFormularioResolverGuard
  implements Resolve<any> {
  constructor(
    private materiaisCrossSellService: ComercialCadastrosMateriaisCrossSellService
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    if (route.params && route.params.id) {
      return this.materiaisCrossSellService.getDetalhes(route.params.id);
    }

    // É implementado o método "of" para manter a tipagem de retorno com Observable.
    return of({
      success: true,
      mensagem: null,
      data: {
        codCrossSell: null,
        codLinha: null,
        codClasse: null,
        codGrupos: null,
        codMaterial: null,
        nomeMaterial: null,
        codSituacao: null,
        materiais: [],
      },
    });
  }
}
