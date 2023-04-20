//angular
import { Injectable } from '@angular/core';

// services
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ILogisticaEntradaMateriaisFichaConformidade } from '../models/fichaConformidade';

@Injectable({
  providedIn: 'root',
})
export class LogisticaEntradaMateriaisFichaConformidadeService {
  private readonly API = environment.API;

  constructor(private http: HttpClient) {}

// -------------------FICHAS DE NÃO CONFORMIDADE------------------
  getFichasConformidade(params?) {
    return this.http.get(
      `${this.API}/logistica/entrada-materiais/ficha-nao-conformidade`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  getRelatorio(params?) {
    return this.http.get(
      `${this.API}/logistica/entrada-materiais/ficha-nao-conformidade/relatorio`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  postFichasConformidade(params: ILogisticaEntradaMateriaisFichaConformidade) {
    return this.http.post(
      `${this.API}/logistica/entrada-materiais/ficha-nao-conformidade`,
      params,
      {
        observe: 'response',
      }
    );
  }

  getNotasFiscaisMateriais(params?) {
    return this.http.get(
      `${this.API}/logistica/entrada-materiais/notas-fiscais/materiais`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  getExport(params?) {
    return this.http.get(
      `${this.API}/logistica/entrada-materiais/ficha-nao-conformidade/relatorio`,
      {
        params: params,
        observe: 'response',
      }
    );
  }



  // -------------------DOCUMENTOS  DA FICHA ------------------
  getDocumento(params) {
    return this.http.get(`${this.API}/logistica/entrada-materiais/ficha-nao-conformidade/documentos`, {
      params: params,
      observe: 'response',
    });
  }


  postDocumento(params, ID_LOGI_ENMA_FHNC: number) {
    return this.http.post(
      `${this.API}/logistica/entrada-materiais/ficha-nao-conformidade/documentos?ID_LOGI_ENMA_FHNC=${ID_LOGI_ENMA_FHNC}`,
      params,
      {
        observe: 'response',
      }
    );
  }

  putDocumento(params) {
    return this.http.put(
      `${this.API}/logistica/entrada-materiais/ficha-nao-conformidade/documentos`,
      params,
      {
        observe: 'response',
      }
    );
  }
  
// -------------------DOCUMENTOS  DA OCORRENCIA ------------------
  getDocumentoOcorrencia(params) {
    return this.http.get(`${this.API}/logistica/entrada-materiais/ficha-nao-conformidade/ocorrencias/documentos`, {
      params: params,
      observe: 'response',
    });
  }


  postDocumentoOcorrencia(params, ID_LOGI_ENMA_FHNC_OCOR: number) {
    return this.http.post(
      `${this.API}/logistica/entrada-materiais/ficha-nao-conformidade/ocorrencias/documentos?ID_LOGI_ENMA_FHNC_OCOR=${ID_LOGI_ENMA_FHNC_OCOR}`,
      params,
      {
        observe: 'response',
      }
    );
  }

  putDocumentoOcorrencia(params) {
    return this.http.put(
      `${this.API}/logistica/entrada-materiais/ficha-nao-conformidade/ocorrencias/documentos`,
      params,
      {
        observe: 'response',
      }
    );
  }

  // -------------------MATERIAIS------------------
  getFormMaterial(params?) {
    return this.http.get(
      `${this.API}/logistica/entrada-materiais/ficha-nao-conformidade/materiais`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  postMateriais(notas) {
    return this.http.post(
      `${this.API}/logistica/entrada-materiais/ficha-nao-conformidade/materiais`,
      notas,
      {
        observe: 'response',
      }
    );
  }


  // -------------------OCORRENCIAS------------------
  getOcorrencias(params?) {
    return this.http.get(
      `${this.API}/logistica/entrada-materiais/ficha-nao-conformidade/ocorrencias`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  postOcorrencias(params: ILogisticaEntradaMateriaisFichaConformidade) {
    return this.http.post(
      `${this.API}/logistica/entrada-materiais/ficha-nao-conformidade/ocorrencias`,
      params,
      {
        observe: 'response',
      }
    );
  }


  // -------------------RESPONSÁVEIS------------------
  postResponsaveis(params: ILogisticaEntradaMateriaisFichaConformidade) {
    return this.http.post(
      `${this.API}/logistica/entrada-materiais/ficha-nao-conformidade/ocorrencias/responsaveis`,
      params,
      {
        observe: 'response',
      }
    );
  }

  getResponsaveisOcorrencia(params) {
    return this.http.get(`${this.API}/logistica/entrada-materiais/ficha-nao-conformidade/ocorrencias/responsaveis`, {
      params: params,
      observe: 'response',
    });
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
      `${this.API}/logistica/entrada-materiais/ficha-nao-conformidade/responsaveis`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  
}
