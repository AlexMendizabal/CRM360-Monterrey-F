import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LogisticaSteellogService {

  private readonly API = `https://crm360.monterrey.com.bo/api`;

  constructor(private http: HttpClient) { }

  getTipoTransporte(params?) {
    return this.http.get(`${this.API}/logistica/steellog/tipo-transporte`, {
      params: params,
      observe: "response"
    });
  }

  getEmpresas(params?) {
    return this.http.get(`${this.API}/logistica/steellog/empresas`, {
      params: params,
      observe: "response"
    });
  }

}
