import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ControladoriaEmpresasService {
  private readonly BASE_URL: string = `http://23.254.204.187/api/api`;
  constructor(private http: HttpClient) {}

  getEmpresas(param) {
    return this.http.get(
      `${this.BASE_URL}/controladoria/lancamentos-fluxo-caixa/empresas`,
      {
        params: param,
        observe: 'response',
      }
    );
  }

  putEmpresas(params) {
    if (params.COD_EMPR != undefined) {
      return this.http.put(
        `${this.BASE_URL}/controladoria/lancamentos-fluxo-caixa/empresas`,
        params,
        { observe: 'response' }
      );
    } else {
      return this.http.post(
        `${this.BASE_URL}/controladoria/lancamentos-fluxo-caixa/empresas`,
        params,
        { observe: 'response' }
      );
    }
  }
}
