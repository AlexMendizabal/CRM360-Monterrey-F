import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LogisticaVeiculoService {
  private readonly API = `https://crm360.monterrey.com.bo/api`;

  constructor(private http: HttpClient) { }

  getVeiculos(params?) {
    return this.http.get(`${this.API}/logistica/veiculos`, {
      params: params,
      observe: 'response',
    });
  }

  postVeiculo(params) {
    return this.http.post(`${this.API}/logistica/veiculo`, params, {
      observe: 'response',
    });
  }
}
