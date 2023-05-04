// angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// services
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LogisticaEntregaDesmembramentoService {

  private readonly API = environment.API;

  constructor(
    private http: HttpClient
  ) {}

  getProdutos(params) {
    return this.http.get(`${this.API}/logistica/pedidos/produtos`, {
      params: params,
      observe: "response"
    })
  }

  getTipoOperacao(params) {
    return this.http.get(`${this.API}/logistica/pedidos/tipo-operacao`, {
      params: params,
      observe: "response"
    })
  }

  post(params) {
    return this.http.post(`${this.API}/logistica/pedidos/desmembramento`, params, {
      observe: "response"
    });
  }

  put(params){
    return this.http.put(`${this.API}/logistica/pedidos/desmembramento`, params, {
      observe: "response"
    });
  }


}
