import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Observable, of, Subscription } from 'rxjs';

// Services
import { ComercialComissoesGestaoComissionamentosService } from './../gestao-comissionamentos.service';

@Injectable({
  providedIn: 'root',
})
export class ComercialComissoesGestaoComissionamentosFormularioResolverGuard
  implements Resolve<any> {
  constructor(
      private gestaoComissionamentosService: ComercialComissoesGestaoComissionamentosService,
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {

    if (route.params && route.params.id) {
      return this.gestaoComissionamentosService.getDetalhes(route.params.id);
    }


    // É implementado o método "of" para manter a tipagem de retorno com Observable.

    return of(

        {
          success: true,
          mensagem: null,
          data: {
            nomeRepresentante: '',
            codRepresentante: '',
            valorTotalDescontos: '',
            valorTotalAjuda: '',
            dataInicial: '',
            dataFinal: '',
            codTipoPagamento: '',
            valorTotalComissao: '',
            idAnoMes: '',
            anexos: [],
            info: []
          },
        }
      );
  }
}
