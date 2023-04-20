import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AbastecimentoMonitoresAnaliseComprasMultiVisoesService {

  private readonly BASE_URL = environment.API;

  constructor(
    private httpClient: HttpClient
  ) { }

  getDepositosAssociados(idLinhas, idClasses,idTipoMaterial,idSituacao): Observable<any> {
    let linhas;
    if (!idLinhas)
     linhas = null;
    else
    linhas = idLinhas.toString()
    if (!idClasses)
      idClasses = "";
    if (!idTipoMaterial)
      idTipoMaterial = "";

    return this.httpClient.get(`${this.BASE_URL}/abastecimento/cadastros/depositos-associados-materiais`, {
      params:{
        ID_CLAS: idClasses.toString(),
        ID_LINH: linhas,
        ID_APOI_TIPO_MATE: idTipoMaterial.toString(),
        IN_STAT: idSituacao,
        IN_SELE_COMB:"1"
      },
      observe: "response"
    });
  }

  getDepositos(idsEmpresa, idSituacao) {
    if(!idsEmpresa)
      idsEmpresa = "";

    return this.httpClient.get(`${this.BASE_URL}/common/v2/depositos`, {
      params: {
        ID_EMPR: idsEmpresa.toString(),
        IN_STAT: idSituacao
      },
      observe: "response"
    });
  }

  getFiltroNivelCritico(): Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/abastecimento/cadastros/niveis-criticos`,
    {
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

  getTiposNiveisEstoque(idSituacao) {
    return this.httpClient.get(`${this.BASE_URL}/common/v2/tipos-niveis-estoque`, {
      params: {
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

  getInfAdicionais() : Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/common/v2/informacoes-adicionais-atividade/1`, {
      observe: "response"
    });
  }
}
