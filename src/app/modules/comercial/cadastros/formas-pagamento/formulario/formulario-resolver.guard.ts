import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

// Services
import { ComercialCadastrosFormasPagamentoService } from '../formas-pagamento.service';

@Injectable({
  providedIn: 'root',
})
export class ComercialCadastrosFormasPagamentoFormularioResolverGuard
  implements Resolve<any> {
  constructor(
    private formasPagamentoService: ComercialCadastrosFormasPagamentoService
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    if (route.params && route.params.id) {
      return this.formasPagamentoService.getDetalhes(route.params.id);
    }

    // É implementado o método "of" para manter a tipagem de retorno com Observable.
    return of({
      success: true,
      data: {
        codFormaPagamento: null,
        formaPagamento: null,
        codFormaPagamentoERP: null,
        codTipoPerc: null,
        codValorPerc: null,
        qtdeParcelas: null,
        codTipoDia: null,
        codSituacao: null,
        situacao: null,
        parcelas: null,
      },
    });
  }
}
