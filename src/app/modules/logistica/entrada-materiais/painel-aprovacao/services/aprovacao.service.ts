//angular
import { Injectable } from '@angular/core';

// services
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ILogisticaEntradaMateriaisPainelAprovacoes } from '../models/aprovacoes';

@Injectable({
  providedIn: 'root',
})
export class LogisticaEntradaMateriaisPainelAprovacoesService {
  private readonly API = environment.API;

  constructor(private http: HttpClient) {}


  getSolicitacoes(params?) {
    return this.http.get(
      `${this.API}/logistica/entrada-materiais/aprovacoes`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  postSolicitacoes(aprovacao: ILogisticaEntradaMateriaisPainelAprovacoes) {
    return this.http.post(
      `${this.API}/logistica/entrada-materiais/aprovacoes`,
      aprovacao,
      {
        observe: 'response',
      }
    );
  }

}
