import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

// Services
import { OfertasService } from '../../ofertas.service';
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
    private ofertaService: OfertasService,
    private authService: AuthService,
    private dateService: DateService
  ) {
    this.user = this.authService.getCurrentUser().info;
  }

  resolve(route: ActivatedRouteSnapshot): Observable<Object | JsonResponse> {
    if (route.params && route.params.codCotacao) {
      return this.ofertaService.getCotacao(
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
        codSituacao: null,
        codCliente: null,
        codContato: null,
        codEndereco: null,
        codEmpresa: null,
        codDeposito: null,
        codFormaContato: null,
        codOrigemContato: null,
        codFormaPagamento: null,
        codTransportadora: null,
        duplicatasSomenteCarteira: false,
        dataEntrega: null,
        dataEncerramento: null,
        dataValidade: null,
        dataLancamento: this.dateService.convert2PhpDate(new Date()),
        observacoes: null,
        freteConta: null,
        dadosAdicionais: null,
        notaFiscalMae: null,
        carrinho: [],
      },
    });
  }
}
