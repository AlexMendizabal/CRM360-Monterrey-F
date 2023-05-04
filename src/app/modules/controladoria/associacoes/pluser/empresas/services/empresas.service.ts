import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ControladoriaAssociacoesPluserCentroCustoEmpresasService {

  private readonly API = environment.API;

  constructor(private http: HttpClient) { }

  getEmpresas(params?) {
    return this.http.get(`${this.API}/tid-software/empresas`, {
      params: params,
      observe: "response"
    })
  }

  getAssociacoes(params?) {
    return this.http.get(`${this.API}/controladoria/pluser/associacoes/tid-empresa/tms-centro-custo-veiculo`, {
      params: params,
      observe: "response"
    })
  }

  postAssociacao(params) {
    return this.http.post(`${this.API}/controladoria/pluser/associacoes/tid-empresa/tms-centro-custo-veiculo`, params, {
      observe: "response"
    })
  }
}
