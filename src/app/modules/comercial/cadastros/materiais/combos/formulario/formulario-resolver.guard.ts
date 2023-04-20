import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

// Services
import { ComercialCadastrosMateriaisComboService } from '../combos.service';

@Injectable({
  providedIn: 'root',
})
export class ComercialCadastrosMateriaisComboFormularioResolverGuard
  implements Resolve<any> {
  constructor(
    private materiaisCombosService: ComercialCadastrosMateriaisComboService
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    if (route.params && route.params.id) {
      return this.materiaisCombosService.getDetalhes(route.params.id);
    }


    // É implementado o método "of" para manter a tipagem de retorno com Observable.
    return of({
      success: true,
      mensagem: null,
      data: {
        codCombo: null,
        codLinha: null,
        codClasse: null,
        codMaterial: null,
        codSituacao: 1,
        nomeMaterial: null,
        quantidade: 0,
        materiais: [],
      },
    });
  }
}
