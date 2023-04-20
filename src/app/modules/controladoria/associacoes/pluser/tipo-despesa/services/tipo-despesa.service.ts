import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ControladoriaAssociacoesPluserTipoDespesaService {

  private readonly API = environment.API;

  constructor(private http: HttpClient) { }

  getTipoDespesa(params?) {
    return this.http.get(`${this.API}/tid-software/tipo-despesa`, {
      params: params,
      observe: "response"
    })
  }

  getGrupoDespesa(params?) {
    return this.http.get(`${this.API}/tid-software/grupo-despesa`, {
      params: params,
      observe: "response"
    })
  }

  getClasseDespesa(params?) {
    return this.http.get(`${this.API}/tid-software/classe-despesa`, {
      params: params,
      observe: "response"
    })
  }

  getAssociacoes(params?) {
    return this.http.get(`${this.API}/controladoria/pluser/associacoes/tid-tipo-despesa/tms-plano-conta`, {
      params: params,
      observe: "response"
    })
  }

  postAssociacao(params) {
    return this.http.post(`${this.API}/controladoria/pluser/associacoes/tid-tipo-despesa/tms-plano-conta`, params, {
      observe: "response"
    })
  }

}
