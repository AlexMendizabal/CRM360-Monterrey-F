import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

// Services
import { ComercialClientesService } from 'src/app/modules/comercial/services/clientes.service';

// Interfaces
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialClientesCadastroContatosResolverGuard
  implements Resolve<any> {
  constructor(private clienteService: ComercialClientesService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<Object | JsonResponse> {
    if (
      route.params &&
      route.parent.parent.params.id &&
      route.params.idContato
    ) {
      return this.clienteService.getContato(
        route.parent.parent.params.id,
        route.params.idContato
      );
    }

    return of({
      success: true,
      mensagem: null,
      data: {
        id: null,
        nomeCompleto: null,
        idGenero: null,
        idFuncao: null,
        idSetor: null,
        dataAniversario: null,
        idTimeFutebol: null,
        idEstadoCivil: null,
        linkedin: null,
        facebook: null,
        instagram: null,
        hobbies: null,
        qtdeFilhos: null,
        filhos: [],
        observacoes: null,
        contatos: [],
      },
    });
  }
}
