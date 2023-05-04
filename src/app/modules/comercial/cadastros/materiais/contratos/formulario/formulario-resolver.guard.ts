import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

// Services
import { ComercialCadastrosMateriaisContratoService } from '../contratos.service';

@Injectable({
  providedIn: 'root',
})
export class ComercialCadastrosMateriaisContratoFormularioResolverGuard
  implements Resolve<any> {
  constructor(
    private materiaisContratosService: ComercialCadastrosMateriaisContratoService
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    if (route.params && route.params.id) {
      return this.materiaisContratosService.getDetalhes(route.params.id);
    }

    // É implementado o método "of" para manter a tipagem de retorno com Observable.
    return of({
      success: true,
      mensagem: null,
      data: {
        codContrato: null,
        codLinha: null,
        codClasse: null,
        codMaterial: null,
        codSituacao: 1,
        codStatus: 2,
        dataInicial: null,
        dataFinal: null,
        nomeContrato: null,
        motivo: null,
        quantidade: null,
        materiais: [],
      },
    });
  }
}
