import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, BehaviorSubject } from 'rxjs';

import { environment } from 'src/environments/environment';

// Services
import { ComercialCadastrosPropostasAssociacaoSituacoesPropostaService } from '../../../cadastros/propostas/associacao-situacoes-proposta/associacao-situacoes-proposta.service';

// Interfaces
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialCicloVendasAutorizacionesService {
  private readonly API = `http://127.0.0.1:8000/comercial/ciclo-vendas/pedidos-producao-telas`;

  private onChangeClienteCotacao = new BehaviorSubject([]);
  clienteCotacao = this.onChangeClienteCotacao.asObservable();

  private onCotacaoDuplicada = new BehaviorSubject([]);
  pedidoDuplicada = this.onCotacaoDuplicada.asObservable();

  private onCotacaoDesdobrada = new BehaviorSubject([]);
  pedidoDesdobrada = this.onCotacaoDesdobrada.asObservable();

  private onChangeEmpresaCotacao = new BehaviorSubject([]);
  empresaCotacao = this.onChangeEmpresaCotacao.asObservable();

  constructor(
    protected http: HttpClient,
    private associacaoSituacoesPropostaService: ComercialCadastrosPropostasAssociacaoSituacoesPropostaService
  ) {}

  loadDependencies(): Observable<Array<Object | JsonResponse>> {
    const associacoes = this.associacaoSituacoesPropostaService.getListaAssociacoes(
      {
        codSituacao: 1,
      }
    );

    return forkJoin([associacoes]);
  }

  updateClienteCotacao([selectedCliente, pedido]) {
    this.onChangeClienteCotacao.next([selectedCliente, pedido]);
  }

  updateCotacaoDuplicada([nrProposta, codVendedor, pedido]) {
    this.onCotacaoDuplicada.next([nrProposta, codVendedor, pedido]);
  }

  updateCotacaoDesdobrada([nrProposta, pedido, materiais]) {
    this.onCotacaoDesdobrada.next([nrProposta, pedido, materiais]);
  }

  updateEmpresaCotacao([selectedEmpresa, selectedDeposito, nrProposta]) {
    this.onChangeEmpresaCotacao.next([
      selectedEmpresa,
      selectedDeposito,
      nrProposta,
    ]);
  }
}
