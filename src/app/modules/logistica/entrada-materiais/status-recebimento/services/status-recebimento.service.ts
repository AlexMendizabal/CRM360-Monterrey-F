//angular
import { Injectable } from '@angular/core';

// services
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ILogisticaEntradaMateriaisStatusRecebimento } from '../models/statusRecebimento';

@Injectable({
  providedIn: 'root',
})
export class LogisticaEntradaMateriaisStatusRecebimentoService {
  private readonly API = environment.API;

  constructor(private http: HttpClient) {}


  getStatusRecebimento(params?) {
    return this.http.get(
      `${this.API}/logistica/entrada-materiais/notas-fiscais/status`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  getHistorico(params?) {
    return this.http.get(
      `${this.API}/logistica/entrada-materiais/notas-fiscais/status/historico`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  postStatusRecebimento(notas: ILogisticaEntradaMateriaisStatusRecebimento) {
    return this.http.post(
      `${this.API}/logistica/entrada-materiais/notas-fiscais/status`,
      notas,
      {
        observe: 'response',
      }
    );
  }
}
