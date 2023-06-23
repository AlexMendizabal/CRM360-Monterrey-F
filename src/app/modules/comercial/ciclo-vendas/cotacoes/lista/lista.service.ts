import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, BehaviorSubject } from 'rxjs';

import { environment } from 'src/environments/environment';

// Services
import { ComercialService } from '../../../comercial.service';
import { ComercialCadastrosSituacaoPropostaService } from '../../../cadastros/situacao-proposta/situacao-proposta.service';
import { ComercialCadastrosPropostasAssociacaoSituacoesPropostaService } from '../../../cadastros/propostas/associacao-situacoes-proposta/associacao-situacoes-proposta.service';

// Interfaces
import { JsonResponse } from 'src/app/models/json-response';
import { ComercialTidSoftwareService } from '../../../tid-software/tid-software.service';

@Injectable({
  providedIn: 'root',
})
export class ComercialCicloVendasCotacoesListaService {
  private readonly API = `http://127.0.0.1:8000/comercial/ciclo-vendas/cotacoes`;

  private onChangeClienteCotacao = new BehaviorSubject([]);
  clienteCotacao = this.onChangeClienteCotacao.asObservable();

  private onTransfereFaturamento = new BehaviorSubject([]);
  transfereFaturamento = this.onTransfereFaturamento.asObservable();

  private onCotacaoDuplicada = new BehaviorSubject([]);
  cotacaoDuplicada = this.onCotacaoDuplicada.asObservable();

  private onCotacaoDesdobrada = new BehaviorSubject([]);
  cotacaoDesdobrada = this.onCotacaoDesdobrada.asObservable();

  private onChangeEmpresaCotacao = new BehaviorSubject([]);
  empresaCotacao = this.onChangeEmpresaCotacao.asObservable();

  constructor(
    protected http: HttpClient,
    private comercialService: ComercialService,
    private tidService: ComercialTidSoftwareService,
    private situacoesService: ComercialCadastrosSituacaoPropostaService,
    private associacaoSituacoesPropostaService: ComercialCadastrosPropostasAssociacaoSituacoesPropostaService
  ) {}

  loadDependencies(): Observable<Array<Object | JsonResponse>> {
    const situacoes = this.situacoesService.getListaSituacaoProposta(null);
    const empresas = this.tidService.getEmpresas('vendas');
    const depositos = this.comercialService.getDepositos(null);
    // const empresas = this.comercialService.getEmpresas({ idEmpresa: [4,18,55,79,77], tipo: 'search' });
    // const depositos = this.comercialService.getDepositos({ idDeposito: [1,18,60,79,77], tipo: 'ssv' });
    const associacoes = this.associacaoSituacoesPropostaService.getListaAssociacoes(
      {
        codSituacao: 1,
      }
    );
    return forkJoin([situacoes, empresas, depositos, associacoes]);
  }

  updateClienteCotacao([selectedCliente, cotacao]) {
    this.onChangeClienteCotacao.next([selectedCliente, cotacao]);
  }

  updateTransfereFaturamento([cotacao]) {
    this.onTransfereFaturamento.next([cotacao]);
  }

  updateCotacaoDuplicada([nrProposta, codVendedor, cotacao]) {
    this.onCotacaoDuplicada.next([nrProposta, codVendedor, cotacao]);
  }

  updateCotacaoDesdobrada([nrProposta, cotacao, materiais]) {
    this.onCotacaoDesdobrada.next([nrProposta, cotacao, materiais]);
  }

  updateEmpresaCotacao([selectedEmpresa, selectedDeposito, nrProposta]) {
    this.onChangeEmpresaCotacao.next([
      selectedEmpresa,
      selectedDeposito,
      nrProposta,
    ]);
  }
}
