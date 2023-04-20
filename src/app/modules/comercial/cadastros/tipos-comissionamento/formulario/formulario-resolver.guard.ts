import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

// Services
import { ComercialCadastrosTipoComissionamentoService } from '../tipo-comissionamento.service';

@Injectable({
  providedIn: 'root'
})
export class ComercialCadastrosTipoComissionamentoFormularioResolverGuard
  implements Resolve<any> {
  constructor(
    private tipoComissionamentoService: ComercialCadastrosTipoComissionamentoService,
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    if (route.params && route.params.id) {
      return this.tipoComissionamentoService.getDetalhes(route.params.id);
    }

    // É implementado o método "of" para manter a tipagem de retorno com Observable.
    return of(
      {
        success: true,
        data: [{
          codTipoComissionamento: null,
          dsTipoComissionamento: null,
          qtdeRegistros: null,
          codSituacao: null,
          codLinha: null,
          nomeLinha: null,
          codClasse: null,
          nomeClasse: null,
          percentual: []
        }]
      }
    );
  }
}
