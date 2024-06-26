import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LogisticaTransportadorasService {

  private readonly API = `https://23.254.204.187/api`;

  constructor(private http: HttpClient) { }

  getTransportadoras(params?) {
    return this.http.get(`${this.API}/logistica/transportadoras`, {
      params: params,
      observe: 'response',
    });
  }

  getTransportadora(id: number) {
    return this.http.get(`${this.API}/logistica/transportadoras/${id}`, {
      observe: 'response',
    });
  }

  postTransportadora(params) {
    return this.http.post(`${this.API}/logistica/transportadoras`, params, {
      observe: 'response',
    });
  }
}
