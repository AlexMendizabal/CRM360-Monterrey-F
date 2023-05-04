//angular
import { Injectable } from '@angular/core';

// services
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ITecnologiaInformacaoTipoProduto } from '../models/tipoProduto';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TecnologiaInformacaoEstoqueTipoProdutosService {
  private readonly API = environment.API;

  constructor(private http: HttpClient) {}

  getTiposProduto(params?) {
    return this.http.get(
      `${this.API}/tecnologia-informacao/estoque/produtos/tipos`,
      {
        params: params,
        observe: 'response',
      }
    );
  }
  getTipoProduto(id: number) {
    return this.http.get(`${this.API}/tecnologia-informacao/estoque/produtos/tipos/${id}`, {
      observe: 'response',
    });
  }


  postTipoProduto(tipoProduto: ITecnologiaInformacaoTipoProduto) {
    return this.http.post(
      `${this.API}/tecnologia-informacao/estoque/produtos/tipos`,
      tipoProduto,
      {
        observe: 'response',
      }
    );
  }
}
