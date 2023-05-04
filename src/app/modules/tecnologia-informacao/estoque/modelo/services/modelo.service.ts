//angular
import { Injectable } from '@angular/core';

// services
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ITecnologiaInformacaoEstoqueModelo } from '../models/modelo';

@Injectable({
  providedIn: 'root',
})
export class TecnologiaInformacaoEstoqueModeloService {
  private readonly API = environment.API;

  constructor(private http: HttpClient) {}

  getModelos(params?) {
    return this.http.get(
      `${this.API}/tecnologia-informacao/estoque/produtos/modelos`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  getModelo(id) {
    return this.http.get(
      `${this.API}/tecnologia-informacao/estoque/produtos/modelos/${id}`,
      {
        observe: 'response',
      }
    );
  }

  postModelo(modelo: ITecnologiaInformacaoEstoqueModelo) {
    return this.http.post(
      `${this.API}/tecnologia-informacao/estoque/produtos/modelos`,
      modelo,
      {
        observe: 'response',
      }
    );
  }
}
