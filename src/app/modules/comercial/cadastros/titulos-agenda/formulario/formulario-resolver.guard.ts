import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

// Services
import { ComercialCadastrosTitulosAgendaService } from '../titulos-agenda.service';

@Injectable({
  providedIn: 'root',
})
export class ComercialCadastrosTitulosAgendaFormularioResolverGuard
  implements Resolve<any> {
  constructor(
    private titulosAgendaService: ComercialCadastrosTitulosAgendaService
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    if (route.params && route.params.id) {
      return this.titulosAgendaService.getDetalhes(route.params.id);
    }

    // É implementado o método "of" para manter a tipagem de retorno com Observable.
    return of({
      success: true,
      data: {
        codTitulo: null,
        descricaoTitulo: null,
        codCarteira: null,
        codSituacao: null,
        situacao: null,
        codUsuario: null,
        nomeUsuario: null,
        dataCadastro: null,
      },
    });
  }
}
