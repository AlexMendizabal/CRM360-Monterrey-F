import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

// Services
import { ComercialCadastrosContatoFormasContatoService } from '../formas-contato.service';

@Injectable({
  providedIn: 'root',
})
export class ComercialCadastrosContatoFormasContatoFormularioResolverGuard
  implements Resolve<any> {
  constructor(
    private formasContatoService: ComercialCadastrosContatoFormasContatoService
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    if (route.params && route.params.id) {
      return this.formasContatoService.getFormaContato(route.params.id);
    }

    // É implementado o método "of" para manter a tipagem de retorno com Observable.
    return of({
      success: true,
      data: {
        codFormaContato: null,
        descricao: null,
        codSituacao: null,
      },
    });
  }
}
