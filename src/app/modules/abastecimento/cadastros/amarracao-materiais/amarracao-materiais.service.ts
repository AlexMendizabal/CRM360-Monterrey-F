import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AbastecimentoCadastrosAmarracaoMateriaisService {

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

  getMateriais(params): Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/common/v2/materiais`, {
      params: {
        ID_CLAS: params['idClasses'].toString(),
        ID_APOI_TIPO_MATE: params['idTipoMaterial'].toString(),
        IN_STAT: params['idSituacao']
      },
       observe: "response"
    });
  }
  
}
