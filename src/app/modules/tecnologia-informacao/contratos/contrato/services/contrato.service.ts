//angular
import { Injectable } from '@angular/core';

// services
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ITecnologiaInformacaoContrato } from '../models/contrato';

@Injectable({
  providedIn: 'root',
})
export class TecnologiaInformacaoCadastroContratoService {
  private readonly API = environment.API;

  constructor(private http: HttpClient) {}

  //-----------------------------------ITENS--------------------------\\

  getContrato(params?) {
    return this.http.get(`${this.API}/tecnologia-informacao/contratos`, {
      params: params,
      observe: 'response',
    });
  }

  postContrato(contrato) {
    return this.http.post(
      `${this.API}/tecnologia-informacao/contrato`,
      contrato,
      {
        observe: 'response',
      }
    );
  }

  //-----------------------------------Docuementos--------------------------\\
  getDocumento(params) {
    return this.http.get(
      `${this.API}/tecnologia-informacao/contratos/documentos`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  postDocumento(params, ID_TECN_INFO_CONT: number) {
    return this.http.post(
      `${this.API}/tecnologia-informacao/contrato/documento?ID_TECN_INFO_CONT=${ID_TECN_INFO_CONT}`,
      params,
      {
        observe: 'response',
      }
    );
  }

  putDocumento(params) {
    return this.http.put(
      `${this.API}/tecnologia-informacao/contrato/documento`,
      params,
      {
        observe: 'response',
      }
    );
  }
  //------------------------------------  EMPRESAS ------------------------------//

  getEmpresas(params?) {
    return this.http.get(`${this.API}/tecnologia-informacao/empresas`, {
      params: params,
      observe: 'response',
    });
  }

  getEmpresasAssoc(params?) {
    return this.http.get(
      `${this.API}/tecnologia-informacao/contratos/empresas`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  postEmpresas(params) {
    return this.http.post(
      `${this.API}/tecnologia-informacao/contratos/empresas`,
      params,
      {
        observe: 'response',
      }
    );
  }

  getIndices(params?) {
    return this.http.get(`${this.API}/servicos/indices`, {
      params: params,
      observe: 'response',
    });
  }
}
