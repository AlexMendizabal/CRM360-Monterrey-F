import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LogisticaRegioesEntregaService {

  API = environment.API;

  constructor(
    private http: HttpClient
  ) { }

  postRegiaoEntrega(params){
    return this.http.post(`${this.API}/logistica/regioes-entrega`, params, {
      observe: "response"
    })
  }

  getRegioesEntrega(params?){
    return this.http.get(`${this.API}/logistica/regioes-entrega`, {
      params: params,
      observe: "response"
    })
  }

  getRegiaoEntrega(id){
    return this.http.get(`${this.API}/logistica/regioes-entrega/${id}`, {
      observe: "response"
    })
  }
}
