import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LogisticaTipoVeiculoService {
  private readonly API = `https://23.254.204.187/api`;

  constructor(private http: HttpClient) { }

  getTipoVeiculos(params?) {
    return this.http.get(`${this.API}/logistica/tipo-veiculo`, {
      params: params,
      observe: 'response',
    });
  }

  postTipoVeiculo(params) {
    return this.http.post(`${this.API}/logistica/tipo-veiculo`, params, {
      observe: 'response',
    });
  }
}
