import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

// Services
import { ComercialClientesService } from 'src/app/modules/comercial/services/clientes.service';

@Injectable({
  providedIn: 'root',
})
export class ComercialClientesCadastroEnderecosResolverGuard
  implements Resolve<any> {
  constructor(private clienteService: ComercialClientesService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    if (
      route.params &&
      route.parent.parent.params['id'] &&
      route.params['idEndereco'] &&
      route.params['idSituacao']
    ) {
      return this.clienteService.getEndereco(
        route.parent.parent.params['id'],
        route.params['idEndereco'],
        route.params['idSituacao']
      );
    }

    return of({
      responseCode: 200,
      result: {
        id: null,
        cep: null,
        endereco: null,
        situacao: 1,
        status: 2,
        numero: null,
        complemento: null,
        referencia: null,
        bairro: null,
        cidade: null,
        uf: null,
        principal: false,
        cobranca: false,
        entrega: false,
        idAtuacaoComercial: null,
        titulo: null,
        idRegiaoEntrega: null,
        idTipoDescarga: null,
        idModoDescarga: null,
        idTipoMaterial: null,
        diasEntrega: {
          segunda: {
            id: 1,
            checked: 0,
            minimo: null,
            maximo: null,
          },
          terca: {
            id: 2,
            checked: 0,
            minimo: null,
            maximo: null,
          },
          quarta: {
            id: 3,
            checked: 0,
            minimo: null,
            maximo: null,
          },
          quinta: {
            id: 4,
            checked: 0,
            minimo: null,
            maximo: null,
          },
          sexta: {
            id: 5,
            checked: 0,
            minimo: null,
            maximo: null,
          },
          sabado: {
            id: 6,
            checked: 0,
            minimo: null,
            maximo: null,
          },
          domingo: {
            id: 7,
            checked: 0,
            minimo: null,
            maximo: null,
          },
        },
        tiposVeiculos: [],
        dadosEspeciais: [],
      },
    });
  }
}
