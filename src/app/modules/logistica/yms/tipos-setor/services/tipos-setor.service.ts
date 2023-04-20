//angular
import { Injectable } from '@angular/core';

// services
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ILogisticaYmsTiposSetor } from '../models/tipos-setor';

@Injectable({
  providedIn: 'root',
})
export class LogisticaYmsTiposSetorService {
  private readonly API = environment.API;

  constructor(private http: HttpClient) {}


  getTiposSetor(params?) {
    return this.http.get(
      `${this.API}/logistica/yms/setores/tipo`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  getTipo(id: string) {
    return this.http.get(
      `${this.API}/logistica/yms/setores/tipo/${id}`,
      {
        observe: 'response',
      }
    );
  }

  postTiposSetor(tipo: ILogisticaYmsTiposSetor) {
    return this.http.post(
      `${this.API}/logistica/yms/setores/tipo`,
      tipo,
      {
        observe: 'response',
      }
    );
  }
}
