import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LogisticaEntregaRavexService {

  private API = environment.API;

  constructor(
    private http: HttpClient
  ) { }

  getViagens(params){
    return this.http.get(`${this.API}/logistica/integracoes/ravex/viagem-faturada`, {
      params: params,
      observe: "response"
    });
  }

  postViagem(params){
    return this.http.post(`${this.API}/logistica/integracoes/ravex/viagem-faturada`, params, {
      observe: "response"
    });
  }

  getEntregas(params){
    return this.http.get(`${this.API}/logistica/integracoes/ravex/entregas`, {
      params: params,
      observe: "response"
    });
  }

  postEntregas(params){
    return this.http.post(`${this.API}/logistica/integracoes/ravex/entrega`, params, {
      observe: "response"
    });
  }

  postNotasFiscais(params){
    return this.http.post(`${this.API}/logistica/integracoes/ravex/notas-fiscais`, params, {
      observe: "response"
    });
  }
}
