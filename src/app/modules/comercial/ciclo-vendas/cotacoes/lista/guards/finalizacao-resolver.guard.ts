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
export class ComercialCicloVendasCotacoesListaFinalizacaoResolverGuard
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
    if (route.params) {
      let date = new Date();
      let dataInicial = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 360);
      let dataFinal = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      return this.cotacoesService.getCotacoes(
        {
          nrPedido: route.params.codCotacao,
          codEmpresa: route.params.codEmpresa,
          pagina: 1,
          registros: 100,
          codVendedor: 0,
          codDeposito: null,
          dataInicial: this.dateService.convertToUrlDate(dataInicial),
          dataFinal: this.dateService.convertToUrlDate(dataFinal),
        },
      );
    }

    // É implementado o método "of" para manter a tipagem de retorno com Observable.
    return of({
      success: true,
      mensagem: null,
      data: {
        codVendedor: null,
        nrProposta: null,
      },
    });
  }
}
