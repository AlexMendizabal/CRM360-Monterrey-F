import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AbastecimentoCadastrosManutencaoMateriaisService {
  
  private readonly BASE_URL = environment.API;
  
  constructor(
    private httpClient: HttpClient
  ) { }

  getTiposMateriais(params: any) : Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/common/v2/tipos-material`, {
      params: {
        IN_STAT: params['IN_STAT']
      },
      observe: "response"
    });
  }

  getLinhas(params: any): Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/common/v2/linhas`, {
      params: {
        IN_STAT: params['IN_STAT']
      },
      observe: "response"
    });
  }

  getSubLinhas(params: any): Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/common/v2/sub-linhas`,{
      params: {
        ID_LINH: params['ID_LINH'].toString(),
        IN_STAT:params['IN_STAT']
      },
      observe: "response"
    });
  }

  getClasses(params): Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/common/v2/classes`, {
      params: {
        ID_LINH: params['ID_LINH'].toString(),
        ID_SUB_LINH: params['ID_SUB_LINH'].toString(),
        IN_STAT: params['IN_STAT']
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
}
