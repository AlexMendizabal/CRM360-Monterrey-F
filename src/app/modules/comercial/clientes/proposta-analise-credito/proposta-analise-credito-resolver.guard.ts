import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

// Services
import { ComercialClientesService } from 'src/app/modules/comercial/services/clientes.service';

@Injectable({
  providedIn: 'root'
})
export class ComercialClientesPropostaAnaliseCreditoResolverGuard
  implements Resolve<any> {
  constructor(private clienteService: ComercialClientesService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    if (route.params && route.params['id']) {
      return this.clienteService.getPropostaAnaliseCredito(route.params['id']);
    }

    return of({
      result: {
        razaoSocial: null,
        codCliente: null,
        codSAP: null,
        limiteCredito: null,
        setorAtividade: null,
        nomeVendedor: null,
        telefoneVendedor: null,
        nomeEscritorio: null
      }
    });
  }
}
