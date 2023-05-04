import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

// Services
import { ComercialCadastrosSetorAtividadeService } from '../setor-atividade.service';

@Injectable({
  providedIn: 'root',
})
export class ComercialCadastrosSetorAtividadeFormularioResolverGuard
  implements Resolve<any> {
  constructor(
    private setorAtividadeService: ComercialCadastrosSetorAtividadeService
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    if (route.params && route.params.id) {
      return this.setorAtividadeService.getDetalhes(route.params.id);
    }

    // É implementado o método "of" para manter a tipagem de retorno com Observable.
    return of({
      success: true,
      data: {
        codSetorAtividade: null,
        setorAtividade: null,
        codParametroSetorAtividade: null,
        codSituacao: null,
        situacao: null,
      },
    });
  }
}
