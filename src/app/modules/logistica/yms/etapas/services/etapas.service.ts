//angular
import { Injectable } from '@angular/core';

// services
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ILogisticaYmsEtapas } from '../models/etapas';

@Injectable({
  providedIn: 'root',
})
export class LogisticaYmsEtapasService {
  private readonly API = environment.API;

  constructor(private http: HttpClient) {}


  getEtapas(params?) {
    return this.http.get(
      `${this.API}/logistica/yms/etapas`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  getEtapa(id: number) {
    return this.http.get(
      `${this.API}/logistica/yms/etapas/${id}`,
      {
        observe: 'response',
      }
    );
  }

  postEtapas(etapas: ILogisticaYmsEtapas) {
    return this.http.post(
      `${this.API}/logistica/yms/etapas`,
      etapas,
      {
        observe: 'response',
      }
    );
  }

  getSetoresAssociados(params?) {
    return this.http.get(
      `${this.API}/logistica/yms/etapas/setores`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  getSetores(params?) {
    return this.http.get(
      `${this.API}/logistica/yms/setores`,
      {
        params: params,
        observe: 'response',
      }
    );
  }


  deleteAssociacoes(params) {
    return this.http.delete(
      `${this.API}/logistica/yms/etapas/setores`,
      {
        params: params,
        observe: 'response',
      }
    );
  }


  postSetoresAssociados(associacao) {
    return this.http.post(
      `${this.API}/logistica/yms/etapas/setores`,
      associacao,
      {
        observe: 'response',
      }
    );
  }
}
