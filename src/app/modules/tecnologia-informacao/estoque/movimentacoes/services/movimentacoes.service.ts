//angular
import { Injectable } from '@angular/core';

// services
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ITecnologiaInformacaoMovimentacoes } from '../models/movimentacoes';

@Injectable({
  providedIn: 'root',
})
export class TecnologiaInformacaoEstoqueMovimentacoesService {
  private readonly API = environment.API;

  constructor(private http: HttpClient) {}

  //-----------------------------------MOVIMENTACÃO--------------------------\\

  getMovimentacoes(params?) {
    return this.http.get(
      `${this.API}/tecnologia-informacao/estoque/movimentacoes`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  postMovimentacoes(item: ITecnologiaInformacaoMovimentacoes) {
    return this.http.post(
      `${this.API}/tecnologia-informacao/estoque/movimentacoes`,
      item,
      {
        observe: 'response',
      }
    );
  }


}
