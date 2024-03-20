import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

// Services
import { ComercialCicloVendasCotacoesService } from '../../cotacoes.service';
import { AuthService } from 'src/app/shared/services/core/auth.service';
import { DateService } from 'src/app/shared/services/core/date.service';

// Interfaces
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialCicloVendasCotacoesFormularioDataResolverGuard
  implements Resolve<any> {
  user: any;

  constructor(
    private cotacoesService: ComercialCicloVendasCotacoesService,
    private authService: AuthService,
    private dateService: DateService
  ) {
    this.user = this.authService.getCurrentUser().info;
  }

  resolve(route: ActivatedRouteSnapshot): Observable<Object | JsonResponse> {
    if (route.params && route.params.codCotacao) {
      return this.cotacoesService.getCotacao(
        route.params.codCotacao,
        route.params.idEmpresa
      );
    }

    // É implementado o método "of" para manter a tipagem de retorno com Observable.
    return of({
      success: true,
      mensagem: null,
      data: {
        cargo: this.user.nane_cargo,
        codVendedor: this.user.idVendedor,
        nomeVendedor: this.user.nomeCompleto,
        tipoCotacao: null,
        codSituacao: null,
        codCliente: null,
        codContato: null,
        codEndereco: null,
        codEmpresa: null,
        codDeposito: null,
        notaFiscalMae: null,
        codFormaPagamento: null,
        duplicatasSomenteCarteira: false,
        dataEntrega: null,
        dataEncerramento: null,
        dataValidade: null,
        dataLancamento: this.dateService.convert2PhpDate(new Date()),
        codFormaContato: null,
        codOrigemContato: null,
        observacoes: null,
        freteConta: null,
        codTransportadora: null,
        dadosAdicionais: null,
        carrinho: [],
      },
    });
  }
}
