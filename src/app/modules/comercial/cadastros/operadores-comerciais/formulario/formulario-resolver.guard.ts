import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

// Services
import { ComercialCadastrosOperadorComercialService } from '../operadores-comerciais.service';

@Injectable({
  providedIn: 'root'
})
export class ComercialCadastrosOperadorComercialFormularioResolverGuard
  implements Resolve<any> {
  constructor(
    private operadorComercialService: ComercialCadastrosOperadorComercialService
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    if (route.params && route.params.id) {
      return this.operadorComercialService.getDetalhes(route.params.id);
    }

    // É implementado o método "of" para manter a tipagem de retorno com Observable.
    return of({
      success: true,
      data: {
        codOperador: null,
        codSap: null,
        codMtcorp: null,
        nomeOperador: null,
        sobrenomeOperador: null,
        tipoOperador: null,
        codSituacao: null,
        codEquipe: null,
        codEscritorio: null,
        tipoPessoa: 'F',
        cpf: null,
        cnpj: null,
        ie: null,
        rg: null,
        telefone: null,
        whatsApp: null,
        email: null,
        cep: null,
        logradouro: null,
        numero: null,
        complemento: null,
        referencia: null,
        bairro: null,
        cidade: null,
        estado: null,
        banco: null,
        agencia: null,
        contaCorrente: null,
        dataInicioContrato: null,
        dataFinalContrato: null
      }
    });
  }
}
