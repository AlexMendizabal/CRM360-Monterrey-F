//angular
import { Injectable } from '@angular/core';

// services
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ILogisticaYmsTiposEtapa } from '../models/tipos-etapa';

@Injectable({
  providedIn: 'root',
})
export class LogisticaYmsTiposEtapaService {
  private readonly API = environment.API;

  constructor(private http: HttpClient) {}


  getTiposEtapa(params?) {
    return this.http.get(
      `${this.API}/logistica/yms/etapas/tipo`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  getTipo(id: string) {
    return this.http.get(
      `${this.API}/logistica/yms/etapas/tipo/${id}`,
      {
        observe: 'response',
      }
    );
  }

  postTiposEtapa(tipo: ILogisticaYmsTiposEtapa) {
    return this.http.post(
      `${this.API}/logistica/yms/etapas/tipo`,
      tipo,
      {
        observe: 'response',
      }
    );
  }
}
