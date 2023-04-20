import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LogisticaPrazoEntregaService {

  API = environment.API;

  constructor(
    private http: HttpClient
  ) { }

  postPrazoEntrega(params){
    return this.http.post(`${this.API}/logistica/prazos-entrega`, params, {
      observe: "response"
    })
  }

  getPrazosEntrega(params?){
    return this.http.get(`${this.API}/logistica/prazos-entrega`, {
      params: params,
      observe: "response"
    })
  }

  getPrazoEntrega(id){
    return this.http.get(`${this.API}/logistica/prazos-entrega/${id}`, {
      observe: "response"
    })
  }
}
