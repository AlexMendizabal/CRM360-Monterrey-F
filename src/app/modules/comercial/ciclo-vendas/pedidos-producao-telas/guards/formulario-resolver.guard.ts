import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

// Services
import { AuthService } from 'src/app/shared/services/core/auth.service';
import { DateService } from 'src/app/shared/services/core/date.service';
import { ComercialCicloVendasPedidosProducaoTelasService } from './../pedidos-producao-telas.service';

// Interfaces
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialCicloVendasPedidosProducaoTelasFormularioResolverGuard
  implements Resolve<any> {
  user: any;

  constructor(
    private pedidosProducaoTelasService: ComercialCicloVendasPedidosProducaoTelasService,
    private authService: AuthService,
    private dateService: DateService
  ) {
    this.user = this.authService.getCurrentUser().info;
  }

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    if (route.params && route.params.nrProposta) {
      return this.pedidosProducaoTelasService.getDetalhesPedidos(route.params.nrProposta)
    }

    // É implementado o método "of" para manter a tipagem de retorno com Observable.
    return of({
      success: true,
      mensagem: null,
      data:
          {
            codCliente: null,
            codLocalizacaoEstoque: null,
            codSituacao: null,
            codUsuarioCadastro: null,
            dataCadastro: null,
            dataPrevisaoEntrega: null,
            descPedido: null,
            descSituacao: null,
            nomeCliente: null,
            nomeLocalizacaoEstoque: '',
            nomeUsuarioCadastro: null,
            nrPedido: null,
            pesoTotal: null,
            prioridade: null,
            razaoSocial: null,
            codRazaoSocial: null,
            codEndereco: null,
            carrinho: []
        },



    });
  }
}
