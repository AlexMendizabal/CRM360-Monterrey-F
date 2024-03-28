import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LogisticaDashboardConferenciaCteService {
  private readonly API = `https://23.254.204.187/api`;

  constructor(private http: HttpClient) { }

  getConferencia(params?) {
    return this.http.get(`${this.API}/logistica/indicadores/conferencia-cte`, {
      params: params,
      observe: 'response',
    });
  }

  getRelatorio(params){
    return this.http.get(`${this.API}/logistica/indicadores/conferencia-cte/relatorio`, {
      params: params,
      observe: 'response',
    });
  }
}
