import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

// Services
import { ComercialCadastrosCnaesService } from '../cnaes.service';

@Injectable({
  providedIn: 'root',
})
export class ComercialCadastrosCnaesFormularioResolverGuard
  implements Resolve<any> {
  constructor(private cnaesService: ComercialCadastrosCnaesService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    if (route.params && route.params.id) {
      return this.cnaesService.getDetalhes(route.params.id);
    }

    // É implementado o método "of" para manter a tipagem de retorno com Observable.
    return of({
      success: true,
      data: {
        codCnae: null,
        cnae: null,
        descricao: null,
        codParametroERP: null,
        codSituacao: null,
        situacao: null,
      },
    });
  }
}
