import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

// Services
import { ComercialCadastrosEquipeVendaService } from '../equipe-venda.service';

@Injectable({
  providedIn: 'root'
})
export class ComercialCadastrosEquipeVendaFormularioResolverGuard
  implements Resolve<any> {
  constructor(
    private equipeVendaService: ComercialCadastrosEquipeVendaService
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    if (route.params && route.params.id) {
      return this.equipeVendaService.getDetalhes(route.params.id);
    }

    // É implementado o método "of" para manter a tipagem de retorno com Observable.
    return of({
      success: true,
      data: {
        codEquipeVenda: null,
        codCarteira: null,
        nomeCarteira: null,
        codSituacao: null,
        situacao: null,
        codUsuario: null,
        nomeUsuario: null,
        dataCadastro: null
      }
    });
  }
}
