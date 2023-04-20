import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AbastecimentoCadastrosClassesMateriaisService {

  private readonly BASE_URL = environment.API;

  constructor(
    private httpClient: HttpClient
  ) { }

  getLinhas(params): Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/common/v2/linhas`,{
      params: {
        IN_STAT: params['idSituacao']
      },
      observe: "response"
    });
  }

  getSubLinhas(params): Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/common/v2/sub-linhas`,{
      params: {
        ID_LINH: params['descricaoLinhas'].toString(),
        IN_STAT:params['idSituacao']
      },
      observe: "response"
    });
  }

  getClasses(params): Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/common/v2/classes`, {
      params: {
        ID_LINH: params['descricaoLinhas'].toString(),
        ID_SUB_LINH: params['idSubLinha'].toString(),
        IN_STAT: params['idSituacao']
      },
      observe: "response"
    });
  }

  getClassesMateriais(_params): Observable<any> {
    const params = {
      ID_LINH: _params['ID_LINH'] ? _params['ID_LINH'].toString() : '',
      ID_SUB_LINH: _params['ID_SUB_LINH'] ? _params['ID_SUB_LINH'].toString() : '',
      ID_CLAS: _params['ID_CLAS'] ? _params['ID_CLAS'].toString() : '',
      IN_STAT: _params['IN_STAT'] ?? '',
      IN_GERA_RELA_EXCE: _params['IN_GERA_RELA_EXCE'] ?? '',
      ID_USUA: _params['ID_USUA'] ?? ''
    }

    return this.httpClient.get(`${this.BASE_URL}/common/v2/classes`, {
      params,
      observe: "response"
    });
  }

  getClassesMateriaisLogs(params): Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/abastecimento/cadastros/classes-auditoria`, {
      params,
      observe: "response"
    });
  }

  postClasses(record): Observable<any> {
    return this.httpClient.post(`${this.BASE_URL}/abastecimento/cadastros/classe-atualizar`,
      record
    )
  }
}
