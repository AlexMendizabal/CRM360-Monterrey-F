import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ControladoriaTiposFluxoCaixaService {
  private readonly BASE_URL: string = `http://23.254.204.187/api/api`;
  constructor(private http: HttpClient) {}

  getTiposFluxoCaixa(param) {
    return this.http.get(
      `${this.BASE_URL}/controladoria/lancamentos-fluxo-caixa/tipos-fluxo-caixa`,
      {
        params: param,
        observe: 'response',
      }
    );
  }

  putTiposFluxoCaixa(params) {
    if (params.COD_TIPO_LANCAMENTO != undefined) {
      return this.http.put(
        `${this.BASE_URL}/controladoria/lancamentos-fluxo-caixa/tipos-fluxo-caixa`,
        params,
        { observe: 'response' }
      );
    } else {
      return this.http.post(
        `${this.BASE_URL}/controladoria/lancamentos-fluxo-caixa/tipos-fluxo-caixa`,
        params,
        { observe: 'response' }
      );
    }
  }
}
