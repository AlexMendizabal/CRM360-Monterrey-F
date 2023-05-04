import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

// Services
import { ComercialDisponibilidadeMaterialService } from '../disponibilidade-material.service';
import { AuthService } from 'src/app/shared/services/core/auth.service';
import { DateService } from 'src/app/shared/services/core/date.service';

@Injectable({
  providedIn: 'root'
})
export class ComercialDisponibilidadeMaterialFormularioResolverGuard
  implements Resolve<any> {
  constructor(
    private disponibilidadeMaterialService: ComercialDisponibilidadeMaterialService,
    private authService: AuthService,
    private dateService: DateService
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    if (route.params && route.params['codigo']) {
      return this.disponibilidadeMaterialService.getSolicitacao(
        route.params['codigo']
      );
    }

    const codMaterial =
      route.params && route.params['codMaterial']
        ? route.params['codMaterial']
        : null;

    // É implementado o método "of" para manter a tipagem de retorno com Observable.
    return of({
      success: true,
      data: {
        codigo: null,
        codMaterial: codMaterial,
        codEmpresa: null,
        codDeposito: null,
        codUsuarioRequisicao: this.authService.getCurrentUser()['info'][
          'idVendedor'
        ],
        codCliente: null,
        qtdeMinima: 0,
        qtdeMaxima: 0,
        dataInicialParametrizacao: new Date(),
        dataFinalParametrizacao: this.dateService.getLastDayMonth()
      }
    });
  }
}
