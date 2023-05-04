//angular
import { Injectable } from '@angular/core';

// services
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ITecnologiaInformacaoOcorrencia } from '../models/ocorrencia';

@Injectable({
  providedIn: 'root',
})
export class TecnologiaInformacaoCadastroOcorrenciaService {
  private readonly API = environment.API;

  constructor(private http: HttpClient) {}

  getOcorrencia(params?) {
    return this.http.get(`${this.API}/tecnologia-informacao/ocorrencias`, {
      params: params,
      observe: 'response',
    });
  }

  postOcorrencia(ocorrencia: ITecnologiaInformacaoOcorrencia) {
    return this.http.post(
      `${this.API}/tecnologia-informacao/ocorrencias`,
      ocorrencia,
      {
        observe: 'response',
      }
    );
  }

  getResponsaveis(params?) {
    return this.http.get(
      `${this.API}/tecnologia-informacao/ocorrencias/responsaveis`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  postResponsaveis(params: ITecnologiaInformacaoOcorrencia) {
    return this.http.post(
      `${this.API}/tecnologia-informacao/ocorrencias/responsaveis`,
      params,
      {
        observe: 'response',
      }
    );
  }

  getDocumento(params) {
    return this.http.get(`${this.API}/tecnologia-informacao/ocorrencias/documentos`, {
      params: params,
      observe: 'response',
    });
  }


  postDocumento(params, ID_TEIN_OCOR: number) {
    return this.http.post(
      `${this.API}/tecnologia-informacao/ocorrencias/documentos?ID_TEIN_OCOR=${ID_TEIN_OCOR}`,
      params,
      {
        observe: 'response',
      }
    );
  }

  putDocumento(params) {
    return this.http.put(
      `${this.API}/tecnologia-informacao/ocorrencias/documentos`,
      params,
      {
        observe: 'response',
      }
    );
  }

  getParecer(params?) {
    return this.http.get(`${this.API}/tecnologia-informacao/ocorrencias/parecer`, {
      params: params,
      observe: 'response',
    });
  }

  postParecer(parecer: ITecnologiaInformacaoOcorrencia) {
    return this.http.post(
      `${this.API}/tecnologia-informacao/ocorrencias/parecer`,
      parecer,
      {
        observe: 'response',
      }
    );
  }

  getDocumentoParecer(params) {
    return this.http.get(`${this.API}/tecnologia-informacao/ocorrencias/documentos`, {
      params: params,
      observe: 'response',
    });
  }


  postDocumentoParecer(documento, params: any) {
    return this.http.post(
      `${this.API}/tecnologia-informacao/ocorrencias/documentos?ID_TEIN_OCOR=${params.ID_TEIN_OCOR}&ID_TEIN_OCPR=${params.ID_TEIN_OCPR}`,
      documento,
      {
        observe: 'response',
      }
    );
  }

  putDocumentoParecer(params) {
    return this.http.put(
      `${this.API}/tecnologia-informacao/ocorrencias/parecer/documentos`,
      params,
      {
        observe: 'response',
      }
    );
  }
  
  getResponsaveisParecer(params) {
    return this.http.get(`${this.API}/tecnologia-informacao/ocorrencias/responsaveis`, {
      params: params,
      observe: 'response',
    });
  }
}
