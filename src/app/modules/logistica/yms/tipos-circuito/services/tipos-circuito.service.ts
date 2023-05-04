//angular
import { Injectable } from '@angular/core';

// services
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ILogisticaYmsTiposCircuito } from '../models/tipos-circuito';

@Injectable({
  providedIn: 'root',
})
export class LogisticaYmsTiposCircuitoService {
  private readonly API = environment.API;

  constructor(private http: HttpClient) {}


  getTiposCircuito(params?) {
    return this.http.get(
      `${this.API}/logistica/yms/circuitos/tipo`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  postTiposCircuito(tipo: ILogisticaYmsTiposCircuito) {
    return this.http.post(
      `${this.API}/logistica/yms/circuitos/tipo`,
      tipo,
      {
        observe: 'response',
      }
    );
  }
}
