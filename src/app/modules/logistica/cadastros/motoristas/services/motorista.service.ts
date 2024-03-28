import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LogisticaMotoristaService {
  private readonly API = `https://23.254.204.187/api`;

  constructor(private http: HttpClient) { }

  getMotoristas(params?) {
    return this.http.get(`${this.API}/logistica/motoristas`, {
      params: params,
      observe: 'response',
    });
  }

  postMotorista(params) {
    return this.http.post(`${this.API}/logistica/motorista`, params, {
      observe: 'response',
    });
  }
}
