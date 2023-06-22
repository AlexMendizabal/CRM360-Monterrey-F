import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ControladoriaBancosService {
  private readonly BASE_URL: string = `http://127.0.0.1:8000`;
  constructor(private http: HttpClient) {}

  getBancos(param) {
    return this.http.get(
      `${this.BASE_URL}/controladoria/lancamentos-fluxo-caixa/bancos`,
      {
        params: param,
        observe: 'response',
      }
    );
  }

  putBancos(params) {
    if (params.COD_BANCO != undefined) {
      return this.http.put(
        `${this.BASE_URL}/controladoria/lancamentos-fluxo-caixa/bancos`,
        params,
        { observe: 'response' }
      );
    } else {
      return this.http.post(
        `${this.BASE_URL}/controladoria/lancamentos-fluxo-caixa/bancos`,
        params,
        { observe: 'response' }
      );
    }
  }
}
