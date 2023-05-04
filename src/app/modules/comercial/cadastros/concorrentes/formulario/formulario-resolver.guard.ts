import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

// Services
import { ComercialCadastrosConcorrenteService } from '../concorrentes.service';

@Injectable({
  providedIn: 'root'
})
export class ComercialCadastrosTransportadoraFormularioResolverGuard
  implements Resolve<any> {
  constructor(
    private concorrenteService: ComercialCadastrosConcorrenteService
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    if (route.params && route.params.id) {
      return this.concorrenteService.getConcorrente(route.params.id);
    }

    // É implementado o método "of" para manter a tipagem de retorno com Observable.
    return of({
      success: true,
      data: {
        codConcorrenteTid: null,
        nomeConcorrente: null,
        nomeMarcaAco: null,
        codSituacao: null
      }
    });
  }
}
