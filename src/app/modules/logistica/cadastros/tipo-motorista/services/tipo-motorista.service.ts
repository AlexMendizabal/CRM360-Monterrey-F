import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LogisticaTipoMotoristaService {
  private readonly API = `https://crm360.monterrey.com.bo/api`;

  constructor(private http: HttpClient) {}

  getTipoMotoristas(params?) {
    return this.http.get(`${this.API}/logistica/tipo-motorista`, {
      params: params,
      observe: 'response',
    });
  }

  postTipoMotorista(params) {
    return this.http.post(`${this.API}/logistica/tipo-motorista`, params, {
      observe: 'response',
    });
  }
}
