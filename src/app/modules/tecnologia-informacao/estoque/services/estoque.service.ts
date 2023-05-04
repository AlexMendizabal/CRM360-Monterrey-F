//angular
import { Injectable } from '@angular/core';

// services
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class TecnologiaInformacaoEstoqueService {
  private readonly API = environment.API;

  constructor(private http: HttpClient) {}

  getEmpresas(params?) {
    return this.http.get(`${this.API}/common/v2/empresas`, {
      params: params,
      observe: 'response',
    });
  }
  
  getEstoque(params?) {
    return this.http.get(
      `${this.API}/tecnologia-informacao/estoque`,
      {
        params: params,
        observe: 'response',
      }
    );
    
  }

  getEstoqueItens(params?) {
    return this.http.get(
      `${this.API}/tecnologia-informacao/estoque/itens`,
      {
        params: params,
        observe: 'response',
      }
    );
  }
}
