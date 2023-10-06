import { Injectable, EventEmitter, TemplateRef } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ControladoriaFluxoCaixaService {
  private readonly BASE_URL: string = `http://23.254.204.187/api/api`;

  private modalEmitter: EventEmitter<any> = new EventEmitter();
  private detailPanelEmitter: EventEmitter<string> = new EventEmitter();

  constructor(private http: HttpClient) {}

  getTipos() {
    return this.http.get(
      `${this.BASE_URL}/controladoria/lancamentos-fluxo-caixa/tipo`
    );
  }

  getFluxoCaixa(params) {
    return this.http.get(
      `${this.BASE_URL}/controladoria/lancamentos-fluxo-caixa/fluxo-caixa`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  getLog(params) {
    return this.http.get(
      `${this.BASE_URL}/controladoria/lancamentos-fluxo-caixa/logs`,
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

  postCadastrar(param) {
    if (!param.COD_LANCAMENTO) {
      return this.http.post(
        `${this.BASE_URL}/controladoria/lancamentos-fluxo-caixa/fluxo-caixa`,
        param,
        { observe: 'response' }
      );
    }
    return this.http.put(
      `${this.BASE_URL}/controladoria/lancamentos-fluxo-caixa/fluxo-caixa`,
      param,
      { observe: 'response' }
    );
  }
}
