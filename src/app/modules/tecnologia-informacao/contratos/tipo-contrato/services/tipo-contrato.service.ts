//angular
import { Injectable } from '@angular/core';

// services
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ITecnologiaInformacaoTipoContrato } from '../models/tipoContrato';

@Injectable({
  providedIn: 'root',
})
export class TecnologiaInformacaoCadastroTipoContratoService {
  private readonly API = environment.API;

  constructor(private http: HttpClient) {}

  getTipoContrato(params?) {
    return this.http.get(
      `${this.API}/tecnologia-informacao/contrato/tipo-contrato`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  postTipoContrato(tipoContrato: ITecnologiaInformacaoTipoContrato) {
    return this.http.post(
      `${this.API}/tecnologia-informacao/contrato/tipo-contrato`,
      tipoContrato,
      {
        observe: 'response',
      }
    );
  }
}
