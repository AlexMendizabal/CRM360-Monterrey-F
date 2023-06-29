
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LogisticaDashboardFaturamentoFinanceiroService {
  private readonly API = `http://127.0.0.1:8000/api`;

  constructor(private http: HttpClient) { }

  getFaturamentoClientes(params?) {
    return this.http.get(`${this.API}/logistica/indicadores/faturamento/clientes`, {
      params: params,
      observe: 'response',
    });
  }

  getFaturamentoMensal(params?) {
    return this.http.get(`${this.API}/logistica/indicadores/faturamento/mensal`, {
      params: params,
      observe: 'response',
    });
  }

  getProjetos(params?) {
    return this.http.get(`${this.API}/logistica/indicadores/faturamento/clientes/projetos`, {
      params: params,
      observe: 'response',
    });
  }

  getFaturamentoProjetos(params?) {
    return this.http.get(`${this.API}/logistica/indicadores/faturamento/projetos`, {
      params: params,
      observe: 'response',
    });
  }

  getFaturamentoCteComplementar(params?) {
    return this.http.get(`${this.API}/logistica/indicadores/faturamento/complementares`, {
      params: params,
      observe: 'response',
    });
  }
}


