import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LogisticaRelatoriosAmbService {
  private readonly API = `https://23.254.204.187/api`;

  constructor(private http: HttpClient) { }

  getRelatorioAmb(params?) {
    return this.http.get(`${this.API}/logistica/relatorios/amb`, {
      params: params,
      observe: 'response',
    });
  }
}
