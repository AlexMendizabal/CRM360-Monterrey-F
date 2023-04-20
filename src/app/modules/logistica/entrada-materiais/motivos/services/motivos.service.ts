//angular
import { Injectable } from '@angular/core';

// services
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ILogisticaEntradaMateriaisMotivos } from '../models/motivos';

@Injectable({
  providedIn: 'root',
})
export class LogisticaEntradaMateriaisMotivosService {
  private readonly API = environment.API;

  constructor(private http: HttpClient) {}


  getMotivos(params?) {
    return this.http.get(
      `${this.API}/logistica/entrada-materiais/motivos`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  postMotivos(params: ILogisticaEntradaMateriaisMotivos) {
    return this.http.post(
      `${this.API}/logistica/entrada-materiais/motivos`,
      params,
      {
        observe: 'response',
      }
    );
  }
}
