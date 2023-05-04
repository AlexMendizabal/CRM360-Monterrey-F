
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

// Services
import { ComercialComissoesVendedoresInternosGestaoComissionamentosService } from './../gestao-comissionamentos.service';

@Injectable({
  providedIn: 'root',
})
export class ComercialComissoesVendedoresInternosGestaoComissionamentosFormularioResolverGuard
  implements Resolve<any> {
  constructor( private gestaoComissionamentosService: ComercialComissoesVendedoresInternosGestaoComissionamentosService

  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    if (route.params && route.params.id) {
      return this.gestaoComissionamentosService.getDetalhes(route.params.id);

    }

    // É implementado o método "of" para manter a tipagem de retorno com Observable.
    return of({
      success: true,
      mensagem: null,
      data: {
        codRepresentante: null,
        codSituacao: 0,
        nome: null,
        endereco: null,
        bairro: null,
        cep: null,
        cidade: null,
        uf: null,
        cpf: null,
        rg: null,
        comissao: null,
        sap: null,
        codRH: null,
        telefone: null,
        celular: null,
        email: null,
        banco: null,
        tipo: null,
        agencia: null,
        titular: null,
        contaCorrente: null,
        dtInicio: null,
        dtRenovacao: null,
        dtVigencia: null,
        tipoComissao: null,
        nomeEmpresa: null,
        cnpj: null,
        ie: null,
        im: null,
        grupos: []
      },
    });
  }
}
