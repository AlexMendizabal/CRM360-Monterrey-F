//angular
import { Injectable } from '@angular/core';

// services
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ITecnologiaInformacaoEstoqueProduto } from '../models/produto';

@Injectable({
  providedIn: 'root',
})
export class TecnologiaInformacaoEstoqueProdutosService {
  private readonly API = environment.API;

  constructor(private http: HttpClient) {}

  getProdutos(params?) {
    return this.http.get(`${this.API}/tecnologia-informacao/estoque/produtos`, {
      params: params,
      observe: 'response',
    });
  }

  getProduto(id: number) {
    return this.http.get(`${this.API}/tecnologia-informacao/estoque/produtos/${id}`, {
      observe: 'response',
    });
  }

  postProdutos(item: ITecnologiaInformacaoEstoqueProduto) {
    return this.http.post(
      `${this.API}/tecnologia-informacao/estoque/produtos`,
      item,
      {
        observe: 'response',
      }
    );
  }
}
