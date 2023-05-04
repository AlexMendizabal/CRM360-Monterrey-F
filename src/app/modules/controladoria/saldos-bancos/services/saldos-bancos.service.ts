import { Injectable, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ControladoriaSaldosBancosService {
  private readonly BASE_URL: string = `https://crm360.monterrey.com.bo/api`;

  private modalEmitter: EventEmitter<any> = new EventEmitter();
  private detailPanelEmitter: EventEmitter<string> = new EventEmitter();

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

  getBancos() {
    return this.http.get(
      `${this.BASE_URL}/controladoria/lancamentos-fluxo-caixa/bancos`,
      {
        observe: 'response',
      }
    );
  }

  getLista(params) {
    return this.http.get(
      `${this.BASE_URL}/controladoria/lancamentos/lancamentos-bancos-saldos/saldo-bancos`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  postCadastrar(param) {
    if (param.ID_BANC_SALD == undefined) {
      return this.http.post(
        `${this.BASE_URL}/controladoria/lancamentos/lancamentos-bancos-saldos/lancamentos`,
        param,
        { observe: 'response' }
      );
    } else {
      return this.http.put(
        `${this.BASE_URL}/controladoria/lancamentos/lancamentos-bancos-saldos/lancamentos`,
        param,
        { observe: 'response' }
      );
    }
  }

  getLog(params) {
    return this.http.get(
      `${this.BASE_URL}/controladoria/lancamentos-bancos-saldos/logs`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  setStateModal(params = { state: true, template: undefined, data: [] }): void {
    return this.modalEmitter.emit(params);
  }

  getStateModal() {
    return this.modalEmitter;
  }

  setDetailPanel(value: string) {
    return this.detailPanelEmitter.emit(value);
  }

  getDetailPanel() {
    return this.detailPanelEmitter;
  }
}
