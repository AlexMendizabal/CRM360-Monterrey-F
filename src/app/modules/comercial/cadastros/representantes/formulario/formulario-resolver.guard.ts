import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

// Services
import { ComercialCadastrosRepresentantesService } from './../representantes.service';

@Injectable({
  providedIn: 'root',
})
export class ComercialCadastrosRepresentantesFormularioResolverGuard
  implements Resolve<any> {
  constructor( private representantesService: ComercialCadastrosRepresentantesService

  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    if (route.params && route.params.id) {
      return this.representantesService.getDetalhes(route.params.id);
    }

    // É implementado o método "of" para manter a tipagem de retorno com Observable.
    return of({
      success: true,
      mensagem: null,
      data: [
        {
          codSituacao: '',
          tipoPagamentoComissao: null,
          emiteNotaFiscal: null,
          recebeEmailInativacaoCliente: null,
          codEquipe: null,
          codEmpresa: null,
          nrMatricula: null,
          nome: null,
          razaoSocial: null,
          endereco: null,
          // nrEndereco: null,
          // complemento: null,
          nomeBairro: null,
          cep: null,
          nomeCidade: null,
          uf: null,
          cnpj: null,
          ie: null,
          im: null,
          telefone: null,
          celular: null,
          email: null,
          dataInicialContrato: null,
          dataFinalContrato: null,
          // dataRenovacaoContrato: null,
          nomeFantasiaRepresentacao: null,
          razaoSocialRepresentacao: null,
          cnpjEmpresaRepresentacao: null,
          ieEmpresaRepresentacao: null,
          imEmpresaRepresentacao: null,
          nomeTitularConta: null,
          tipoConta: null,
          nomeBanco: null,
          agencia: null,
          contaCorrente: null,
      }
    ],
    });
  }
}
