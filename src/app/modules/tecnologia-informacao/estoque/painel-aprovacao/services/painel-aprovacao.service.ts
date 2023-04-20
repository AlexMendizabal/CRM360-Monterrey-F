//angular
import { Injectable } from '@angular/core';

// services
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ITecnologiaInformacaoEstoquePainelAprovacao } from '../models/painel-aprovacao';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TecnologiaInformacaoEstoquePainelAprovacaoService {
  private readonly API = environment.API;

  constructor(private http: HttpClient) {}

  getAprovacoes(params?) {
    return this.http.get(
      `${this.API}/tecnologia-informacao/estoque/movimentacoes/aprovacoes`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  postAprovacoes(aprovacao: ITecnologiaInformacaoEstoquePainelAprovacao) {
    return this.http.post(
      `${this.API}/tecnologia-informacao/estoque/movimentacoes/aprovacoes`,
      aprovacao,
      {
        observe: 'response',
      }
    );
  }
}
