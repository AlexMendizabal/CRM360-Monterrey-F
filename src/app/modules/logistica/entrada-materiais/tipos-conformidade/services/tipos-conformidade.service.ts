//angular
import { Injectable } from '@angular/core';

// services
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ILogisticaEntradaMateriaisTiposConformidade } from '../models/tiposConformidade';

@Injectable({
  providedIn: 'root',
})
export class LogisticaEntradaMateriaisTiposConformidadeService {
  private readonly API = environment.API;

  constructor(private http: HttpClient) {}


  getTiposConformidade(params?) {
    return this.http.get(
      `${this.API}/logistica/entrada-materiais/ficha-nao-conformidade/tipo`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  postTiposConformidade(params: ILogisticaEntradaMateriaisTiposConformidade) {
    return this.http.post(
      `${this.API}/logistica/entrada-materiais/ficha-nao-conformidade/tipo`,
      params,
      {
        observe: 'response',
      }
    );
  }

  postResponsaveis(params: ILogisticaEntradaMateriaisTiposConformidade) {
    return this.http.post(
      `${this.API}/logistica/entrada-materiais/ficha-nao-conformidade/tipo/responsaveis`,
      params,
      {
        observe: 'response',
      }
    );
  }

  getUsuarios(params?) {
    return this.http.get(
      `${this.API}/core/mtcorp/usuarios`,
      {
        params: params,
        observe: 'response',
      }
    );
  }
  getResponsaveis(params?) {
    return this.http.get(
      `${this.API}/logistica/entrada-materiais/ficha-nao-conformidade/tipo/responsaveis`,
      {
        params: params,
        observe: 'response',
      }
    );
  }
}
