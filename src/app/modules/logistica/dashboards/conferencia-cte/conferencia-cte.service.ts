import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LogisticaDashboardConferenciaCteService {
  private readonly API = `http://127.0.0.1:8000/api`;

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
