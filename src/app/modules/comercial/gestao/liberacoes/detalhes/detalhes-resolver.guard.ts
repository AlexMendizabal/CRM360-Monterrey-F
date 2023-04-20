import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

// Services
import { ComercialGestaoLiberacoesService } from '../services/liberacoes.service';

@Injectable({
  providedIn: 'root',
})
export class ComercialLiberacoesDetalhesResolverGuard implements Resolve<any> {
  constructor(private liberacoesService: ComercialGestaoLiberacoesService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
     if (route.params && route.params.id) {
      return this.liberacoesService.getDetalhes(
        route.params.id,
        route.params.empresa
      );
    }

    // É implementado o método "of" para manter a tipagem de retorno com Observable.
    return of({
      success: true,
      data: {
        idAprovacao: null,
        nomeVendedor: null,
        matrVendedor: null,
        gerenciaVendedor: null,
        idMotivoSolic: null,
        descMotivoSolic: null,
        tipoData: null,
        dataLancamento: null,
        statusItem: null, //Status do Item (Ativo/Inativo)
        dtSolic: null, // Data da Solicitação
        descSolic: null, // Descrição da solicitação
        codCli: null,
        razaoSocialCli: null,
        cnpjCli: null,
        dtInicial: null,
        dtFinal: null,
        dtAprov: null,
        descObs: null,
        matrUsuarioCad: null,
        dtPedido: null,
        nfPedido: null,
        formaPagtoPedido: null,
        enderecoPedido: null,
        depositoPedido: null,
        empresaPedido: null,
        situaPedido: null,
        numPedido: null,
        valorPedido: null,
        pesoPedido: null,
        linhaPredominante: null,
        descUsuarioCad: null,
        dtInclusao: null,
      },
    });
  }
}
