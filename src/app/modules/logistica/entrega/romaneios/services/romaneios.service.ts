import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';

import { ILogisticaEntregaRomaneio } from '../models/romaneio';

@Injectable({
  providedIn: 'root'
})
export class LogisticaEntregaRomaneiosService {

  private readonly BASE_URL: string = `http://127.0.0.1:8000`;

  private downloadEmmiter: EventEmitter<ILogisticaEntregaRomaneio> = new EventEmitter();

  constructor(private http: HttpClient) { }

  getEmpresas() {
    return this.http.get(`${this.BASE_URL}/common/empresas`);
  }

  getRomaneio(params) {
    return this.http.get(`${this.BASE_URL}/logistica/painel-romaneios/romaneios`, {
      params: params,
      observe: "response"
    });
  }

  sincronizarRomaneiosFusion(){
    return this.http.post(
      `${this.BASE_URL}/logistica/integracoes/fusion/romaneios`,{},
      { observe: 'response' }
    );
  }

  enviarRomaneioParaFaturamento(params: ILogisticaEntregaRomaneio) {
    return this.http.post(
      `${this.BASE_URL}/logistica/painel-romaneios/romaneio/faturamento`,
      params,
      { observe: 'response' }
    );
  }

  finalizarRomnaneio(params){
    return this.http.post(
      `${this.BASE_URL}/logistica/painel-romaneios/finaliza-romaneio`,
      params,
      { observe: 'response' }
    );
  }

  postRomaneio(params: ILogisticaEntregaRomaneio) {
    return this.http.put(
      `${this.BASE_URL}/logistica/painel-romaneios/status-romaneio`,
      params,
      { observe: 'response' }
    );
  }

  putRomaneio(params) {
    return this.http.put(
      `${this.BASE_URL}/logistica/integracoes/fusion/romaneios`,
      params,
      { observe: 'response' }
    );
  }

  getPedidos(params) {
    return this.http.get(
      `${this.BASE_URL}/logistica/painel-romaneios/romaneios/pedidos`,
      {
        params: params,
        observe: 'response'
      }
    );
  }

  getMateriais(params){
    return this.http.get(
      `${this.BASE_URL}/logistica/painel-romaneios/romaneios/pedidos/materiais`,
      {
        params: params,
        observe: 'response'
      }
    );
  }

  getCtes(params){
    return this.http.get(
      `${this.BASE_URL}/logistica/painel-romaneios/ctes`,
      {
        params: params,
        observe: 'response'
      }
    );
  }

  download(romaneio: ILogisticaEntregaRomaneio){
    return this.downloadEmmiter.emit(romaneio);
  }

  onDownloadEmmiter(){
    return this.downloadEmmiter;
  }

  getEntregas(params){
    return this.http.get(
      `${this.BASE_URL}/logistica/painel-romaneios/entregas`,
      {
        params: params,
        observe: 'response'
      }
    );
  }

  getRelatorios(params){
    return this.http.get(
      `${this.BASE_URL}/logistica/painel-romaneios/relatorios`,
      {
        params: params,
        observe: 'response'
      }
    );
  }

}
