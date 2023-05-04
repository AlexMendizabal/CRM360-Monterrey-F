import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

// Services
import { ComercialCadastrosContatoOrigemContatoService } from '../origem-contato.service';

@Injectable({
  providedIn: 'root',
})
export class ComercialCadastrosContatoOrigemContatoFormularioResolverGuard
  implements Resolve<any> {
  constructor(
    private origemContatoService: ComercialCadastrosContatoOrigemContatoService
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    if (route.params && route.params.id) {
      return this.origemContatoService.getOrigemContato(route.params.id);
    }

    // É implementado o método "of" para manter a tipagem de retorno com Observable.
    return of({
      success: true,
      data: {
        codOrigemContato: null,
        descricao: null,
        codSituacao: null,
      },
    });
  }
}
