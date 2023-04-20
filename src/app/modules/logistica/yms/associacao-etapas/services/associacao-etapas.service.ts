//angular
import { Injectable } from '@angular/core';

// services
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ILogisticaYmsAssociacaoEtapas } from '../models/associacao-etapas';

@Injectable({
  providedIn: 'root',
})
export class LogisticaYmsAssociacaoEtapasService {
  private readonly API = environment.API;

  constructor(private http: HttpClient) {}


  getAssociacaoEtapas(params?) {
    return this.http.get(
      `${this.API}/logistica/yms/setores/etapas`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  getEtapas(params?) {
    return this.http.get(
      `${this.API}/logistica/yms/etapas`,
      {
        params: params,
        observe: 'response',
      }
    );
  }


  deleteAssociacoes(params) {
    return this.http.delete(
      `${this.API}/logistica/yms/setores/etapas`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  postAssociacaoEtapas(associacao: ILogisticaYmsAssociacaoEtapas) {
    return this.http.post(
      `${this.API}/logistica/yms/setores/etapas`,
      associacao,
      {
        observe: 'response',
      }
    );
  }
}
