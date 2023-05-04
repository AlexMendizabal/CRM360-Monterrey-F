import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AbastecimentoCadastrosNivelEstoqueDepositoNewService {

  private readonly BASE_URL = environment.API;

  constructor(
    private httpClient: HttpClient
  ) { }
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

  getMateriais(idClasses, idTipoMaterial, idSituacao) : Observable<any> {
    if (!idClasses)
      idClasses = "";
    if (!idTipoMaterial)
      idTipoMaterial = "";

    return this.httpClient.get(`${this.BASE_URL}/common/v2/materiais`, {
      params: {
        ID_CLAS: idClasses.toString(),
        ID_APOI_TIPO_MATE: idTipoMaterial.toString(),
        IN_STAT: idSituacao
      },
      observe: "response"
    });
  }

  getTiposMateriais(idSituacao) : Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/common/v2/tipos-material`, {
      params: {
        IN_STAT: idSituacao
      },
      observe: "response"
    });
  }

  getDepositosAssociados(idSituacao, idClasse, idTipoMaterial) {
    return this.httpClient.get(`${this.BASE_URL}/abastecimento/cadastros/depositos-associados-materiais`, {
      params: {
        IN_STAT: idSituacao,
        ID_CLAS: idClasse,
        ID_APOI_TIPO_MATE: idTipoMaterial
      },
      observe: "response"
    });
  }

  getNiveisEstoque(params) : Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/abastecimento/cadastros/nivel-estoque-materiais`,
    {
      params: {
        ID_MATE:params["ID_MATE"].toString(),
        ID_LINH:params["ID_LINH"].toString(),
        ID_SUB_LINH:params["ID_SUB_LINH"].toString(),
        ID_CLAS:params["ID_CLAS"].toString(),
        ID_APOI_TIPO_MATE:params["ID_APOI_TIPO_MATE"].toString(),
        SITU_CADA_NIVE_ESTO:params["SITU_CADA_NIVE_ESTO"],
        IN_GERA_RELA:params["IN_GERA_RELA"],
        ID_USUA:params["ID_USUA"]
      },
      observe: "response"
    })
    .pipe(take(1))
  }

  getNiveisEstoqueUnidades(params) : Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/abastecimento/cadastros/nivel-estoque-material-depositos`,
    {
      params,
      observe: "response"
    })
    .pipe(take(1))
  }

  postNivelEstoque(record) : Observable<any> {
    return this.httpClient.post(`${this.BASE_URL}/abastecimento/cadastros/nivel-estoque-material-depositos`,
      record
    )
    .pipe(take(1))
  }

  updateNivelEstoque(record) : Observable<any> {
    return this.httpClient.post(`${this.BASE_URL}/abastecimento/cadastros/deposito-associado-material-alterar`,
      record
    )
    .pipe(take(1))
  }

  deleteNivelEstoque(record) : Observable<any> {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: record
    };
    return this.httpClient.delete(`${this.BASE_URL}/abastecimento/cadastros/nivel-estoque-material-deposito`,
    options
    )
  }
  
  getLogs(params) : Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/abastecimento/cadastros/nivel-estoque-material-deposito-auditoria`,
    {
      params,
      observe: "response"
    })
    .pipe(take(1))
  }
}
