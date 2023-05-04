import { ILogisticaYmsTiposCircuito } from './../../tipos-circuito/models/tipos-circuito';
//angular
import { Injectable } from '@angular/core';

// services
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ILogisticaYmsSetores } from '../models/setores';

@Injectable({
  providedIn: 'root',
})
export class LogisticaYmsSetoresService {
  private readonly API = environment.API;

  constructor(private http: HttpClient) {}


  getSetores(params?) {
    return this.http.get(
      `${this.API}/logistica/yms/setores`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  getSetor(id: string) {
    return this.http.get(
      `${this.API}/logistica/yms/setores/${id}`,
      {
        observe: 'response',
      }
    );
  }

  postSetores(setores: ILogisticaYmsSetores) {
    return this.http.post(
      `${this.API}/logistica/yms/setores`,
      setores,
      {
        observe: 'response',
      }
    );
  }


  postIntervalos(params: ILogisticaYmsTiposCircuito) {
    return this.http.post(
      `${this.API}/logistica/yms/setores/intervalos`,
      params,
      {
        observe: 'response',
      }
    );
  }

  getIntervalos(params?) {
    return this.http.get(
      `${this.API}/logistica/yms/setores/intervalos`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  getMateriaisAssociados(params?) {
    return this.http.get(
      `${this.API}/logistica/yms/setores/materiais`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  getMateriais(params?) {
    return this.http.get(
      `${this.API}/common/v2/materiais`,
      {
        params: params,
        observe: 'response',
      }
    );
  }


  deleteAssociacoes(params) {
    return this.http.delete(
      `${this.API}/logistica/yms/setores/materiais`,
      {
        params: params,
        observe: 'response',
      }
    );
  }


  postMateriaisAssociados(associacao) {
    return this.http.post(
      `${this.API}/logistica/yms/setores/materiais`,
      associacao,
      {
        observe: 'response',
      }
    );
  }

}
