//angular
import { Injectable } from '@angular/core';

// services
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ITecnologiaInformacaoNivelEstoque } from '../models/nivelEstoque';

@Injectable({
  providedIn: 'root',
})
export class TecnologiaInformacaoEstoqueNivelEstoqueService {
  private readonly API = environment.API;

  constructor(private http: HttpClient) {}


  getNiveisEstoque(params?) {
    return this.http.get(`${this.API}/tecnologia-informacao/estoque/niveis`, {
      params: params,
      observe: 'response',
    });
  }
  getNivelEstoque(id: number) {
    return this.http.get(`${this.API}/tecnologia-informacao/estoque/niveis/${id}`, {
      observe: 'response',
    });
  }


  postNiveisEstoque(produtos: ITecnologiaInformacaoNivelEstoque) {
    return this.http.post(
      `${this.API}/tecnologia-informacao/estoque/niveis`,
      produtos,
      {
        observe: 'response',
      }
    );
  }
}
