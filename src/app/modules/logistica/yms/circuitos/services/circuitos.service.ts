//angular
import { Injectable } from '@angular/core';

// services
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ILogisticaYmsCircuitos } from '../models/circuitos';

@Injectable({
  providedIn: 'root',
})
export class LogisticaYmsCircuitosService {
  private readonly API = environment.API;

  constructor(private http: HttpClient) {}


  getCircuitos(params?) {
    return this.http.get(
      `${this.API}/logistica/yms/circuitos`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  getCircuito(id: number) {
    return this.http.get(
      `${this.API}/logistica/yms/circuitos/${id}`,
      {
        observe: 'response',
      }
    );
  }


  postCircuitos(circuitos: ILogisticaYmsCircuitos) {
    return this.http.post(
      `${this.API}/logistica/yms/circuitos`,
      circuitos,
      {
        observe: 'response',
      }
    );
  }

  getEtapasAssociados(params?) {
    return this.http.get(
      `${this.API}/logistica/yms/circuitos/etapas`,
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
      `${this.API}/logistica/yms/circuitos/etapas`,
      {
        params: params,
        observe: 'response',
      }
    );
  }


  postEtapasAssociados(associacao) {
    return this.http.post(
      `${this.API}/logistica/yms/circuitos/etapas`,
      associacao,
      {
        observe: 'response',
      }
    );
  }
}
