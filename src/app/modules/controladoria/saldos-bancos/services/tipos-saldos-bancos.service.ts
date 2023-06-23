import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ControladoriaTiposSaldosBancosService {
  private readonly BASE_URL: string = `http://127.0.0.1:8000`;
  constructor(private http: HttpClient) {}

  getTipos(params) {
    return this.http.get(
      `${this.BASE_URL}/controladoria/lancamentos/lancamentos-bancos-saldos/tipos`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  putTiposLancamentos(params) {
    if (params.ID_BANC_TIPO != undefined) {
      return this.http.put(
        `${this.BASE_URL}/controladoria/lancamentos/lancamentos-bancos-saldos/tipos`,
        params,
        { observe: 'response' }
      );
    } else {
      return this.http.post(
        `${this.BASE_URL}/controladoria/lancamentos/lancamentos-bancos-saldos/tipos`,
        params,
        { observe: 'response' }
      );
    }
  }
}
