import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';

import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AbastecimentoCadastrosVinculoMaterialDepositoNewService {

  private readonly BASE_URL = environment.API;

  constructor(
    private httpClient: HttpClient
  ) { }

  getTiposMateriais(idSituacao) : Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/common/v2/tipos-material`, {
      params: {
        IN_STAT: idSituacao
      },
      observe: "response"
    });
  }

  getLinhas(idSituacao) : Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/common/v2/linhas`,{
      params: {
        IN_STAT: idSituacao
      },
      observe: "response"
    });
  }

  getSubLinhas(descricaoLinhas,idSituacao) {
    return this.httpClient.get(`${this.BASE_URL}/common/v2/sub-linhas`,{
      params: {
        ID_LINH: descricaoLinhas.toString(),
        IN_STAT:idSituacao
      },
      observe: "response"
    });
  }

  getClasses(descricaoLinhas, idSubLinha, idSituacao) : Observable<any> {
    if (!idSubLinha)
      idSubLinha = "";
    return this.httpClient.get(`${this.BASE_URL}/common/v2/classes`, {
      params: {
        ID_LINH: descricaoLinhas.toString(),
        ID_SUB_LINH: idSubLinha,
        IN_STAT: idSituacao
      },
      observe: "response"
    });
  }

  getDepositos(idSituacao, idEmpresa) {
    return this.httpClient.get(`${this.BASE_URL}/common/v2/depositos`, {
      params: {
        IN_STAT: idSituacao,
        ID_EMPR: idEmpresa.toString()
      },
      observe: "response"
    });
  }

  getEmpresas(idSituacao) {
    return this.httpClient.get(`${this.BASE_URL}/common/v2/empresas`, {
      params: {
        IN_STAT: idSituacao
      },
      observe: "response"
    });
  }

  getMaterialDepositosDetalhes(params) : Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/abastecimento/cadastros/depositos-associados-materiais`, {
      params,
      observe: "response"
    })
    .pipe(take(1))
  }

  getMateDispAssociacao(): Observable<any>  {
    return this.httpClient.get(`${this.BASE_URL}/abastecimento/cadastros/materiais-disponiveis-associacao-depositos`, {
      params: {
        ID_SITU_MATE: "1",
      },
      observe: "response"
    });;
  }
  
  getMaterialDepositos(params): Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/abastecimento/cadastros/materiais-disponiveis-associacao-depositos`, {
      params: {
        ID_DEPO:params["ID_DEPO"],
        ID_APOI_TIPO_MATE:params["ID_APOI_TIPO_MATE"].toString(),
        ID_LINH:params["ID_LINH"].toString(),
        ID_SUB_LINH:params["ID_SUB_LINH"].toString(),
        ID_CLAS:params["ID_CLAS"].toString(),
        ID_SITU_MATE:params["ID_SITU_MATE"]
      },
      observe: "response"
    })
      .pipe(take(1))
  }

  postMaterialDeposito(record): Observable<any> {
    return this.httpClient.post(`${this.BASE_URL}/abastecimento/cadastros/deposito-associado-material`,
      record
    )
      .pipe(take(1))
  }

  updateMaterialDeposito(record) : Observable<any> {
    return this.httpClient.post(`${this.BASE_URL}/abastecimento/cadastros/deposito-associado-material-alterar`,
      record
    )
    .pipe(take(1))
  }

  deleteMaterialDeposito(record): Observable<any> {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: record
    };
    return this.httpClient.delete(`${this.BASE_URL}/abastecimento/cadastros/deposito-associado-material`,
      options
    )
  }

  getLogs(params): Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/abastecimento/cadastros/depositos-associados-materiais-auditoria`, {
      params,
      observe: "response"
    })
      .pipe(take(1))
  }

}
