//angular
import { Injectable } from '@angular/core';

// services
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ITecnologiaInformacaoTipoMovimentacoes } from './../models/tipoMovimentacoes';

@Injectable({
  providedIn: 'root',
})
export class TecnologiaInformacaoEstoqueTipoMovimentacoesService {
  private readonly API = environment.API;

  constructor(private http: HttpClient) {}

  getTipoMovimentacoes(params?) {
    return this.http.get(
      `${this.API}/tecnologia-informacao/estoque/tipo-movimentacao`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  postTipoMovimentacoes(
    tipoMovimentacoes: ITecnologiaInformacaoTipoMovimentacoes
  ) {
    return this.http.post(
      `${this.API}/tecnologia-informacao/estoque/tipo-movimentacao`,
      tipoMovimentacoes,
      {
        observe: 'response',
      }
    );
  }
}
