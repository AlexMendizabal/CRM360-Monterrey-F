//angular
import { Injectable } from '@angular/core';

// services
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ILogisticaEntradaMateriaisParecer } from '../models/parecer';

@Injectable({
  providedIn: 'root',
})
export class LogisticaEntradaMateriaisParecerService {
  private readonly API = environment.API;

  constructor(private http: HttpClient) {}


  getParecer(params?) {
    return this.http.get(
      `${this.API}/logistica/entrada-materiais/ficha-nao-conformidade/ocorrencias/parecer`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  postParecer(parecer: ILogisticaEntradaMateriaisParecer) {
    return this.http.post(
      `${this.API}/logistica/entrada-materiais/ficha-nao-conformidade/ocorrencias/parecer`,
      parecer,
      {
        observe: 'response',
      }
    );
  }
}
