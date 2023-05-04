//angular
import { Injectable } from '@angular/core';

// services
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ILogisticaYmsAssociacaoMateriais } from '../models/associacao-materiais';

@Injectable({
  providedIn: 'root',
})
export class LogisticaYmsAssociacaoMateriaisService {
  private readonly API = environment.API;

  constructor(private http: HttpClient) {}


  getAssociacaoMateriais(params?) {
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

  postAssociacaoMateriais(associacao: ILogisticaYmsAssociacaoMateriais) {
    return this.http.post(
      `${this.API}/logistica/yms/setores/materiais`,
      associacao,
      {
        observe: 'response',
      }
    );
  }
}
