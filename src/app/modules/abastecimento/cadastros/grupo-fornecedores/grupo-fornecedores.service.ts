import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AbastecimentoCadastrosGrupoFornecedoresService {

  private readonly BASE_URL = environment.API;

  constructor(
    private httpClient: HttpClient
  ) { }

  getFornecedores(params) : Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/common/v2/fornecedores`,{
      params: {
        IN_STAT: params
      },
      observe: "response"
    });
  }

  getIntegradoresPedidos(params) : Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/common/v2/integradores-pedidos`, {
      params: {
        IN_STAT: params
      },
      observe: "response"
    });
  }

  getGrupoFornecedoresFiltro(params) : Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/abastecimento/cadastros/associacao-grupo-fornecedores-integrador-pedidos`, {
      params: {
        ID_APOI_INTE_PEDI: params
      },
      observe: "response"
    })
    .pipe(take(1))
  }

  getGrupoFornecedores(params) : Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/abastecimento/cadastros/grupo-fornecedores`, {
      params: {
        ID_GRUP_FORN: params['ID_GRUP_FORN'].toString(),
        NM_GRUP_FORN: params['NM_GRUP_FORN'],
        IN_STAT: params['IN_STAT'],
        NR_PAGE_INIC:	params['NR_PAGE_INIC'],
        TT_REGI_PAGI:	params['TT_REGI_PAGI'],
        ORDE_BY: params['ORDE_BY'],
        ORDE_TYPE: params['ORDE_TYPE']
      },
      observe: "response"
    })
    .pipe(take(1))
  }

  postGrupoFornecedores(record) : Observable<any> {
    return this.httpClient.post(`${this.BASE_URL}/abastecimento/cadastros/grupo-fornecedores`, 
      record
    )
    .pipe(take(1))
  }

  getAssociacaoGrupoFornecedoresIntPed(params) : Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/abastecimento/cadastros/associacao-grupo-fornecedores-integrador-pedidos`, {
      params: {
        ID_ASSO_GRUP_FORN_INTE_PEDI: params['ID_ASSO_GRUP_FORN_INTE_PEDI'].toString(),
        ID_APOI_INTE_PEDI: params['ID_APOI_INTE_PEDI'],
        ID_GRUP_FORN: params['ID_GRUP_FORN'],
        ID_FORN: params['ID_FORN'],
        IN_STAT: params['IN_STAT'],
        NR_PAGE_INIC:	params['NR_PAGE_INIC'],
        TT_REGI_PAGI:	params['TT_REGI_PAGI'],
        ORDE_BY: params['ORDE_BY'],
        ORDE_TYPE: params['ORDE_TYPE']
      },
      observe: "response"
    })
    .pipe(take(1))
  }

  postAssociacaoGrupoFornecedoresIntPed(record) : Observable<any> {
    return this.httpClient.post(`${this.BASE_URL}/abastecimento/cadastros/associacao-grupo-fornecedores-integrador-pedidos`, 
      record
    )
    .pipe(take(1))
  }

  deleteAssociacaoGrupoFornecedoresIntPed(record) : Observable<any> {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: record
    };
    return this.httpClient.delete(`${this.BASE_URL}/abastecimento/cadastros/associacao-grupo-fornecedores-integrador-pedidos`,
    options
    )
  }

  getAssociacaoGrupoFornecedorFornecedores(params) : Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/abastecimento/cadastros/associacao-grupo-fornecedor-fornecedores`, {
      params: {
        ID_ASSO_GRUP_FORN_FORN: params['ID_ASSO_GRUP_FORN_FORN'].toString(),
        ID_INTE_PEDI: params['ID_INTE_PEDI'],
        ID_GRUP_FORN: params['ID_GRUP_FORN'],
        ID_FORN: params['ID_FORN'],
        IN_STAT: params['IN_STAT'],
        NR_PAGE_INIC:	params['NR_PAGE_INIC'],
        TT_REGI_PAGI:	params['TT_REGI_PAGI'],
        ORDE_BY: params['ORDE_BY'],
        ORDE_TYPE: params['ORDE_TYPE'],
        IN_GERA_RELA_EXCE: params['IN_GERA_RELA_EXCE'],
        ID_USUA: params['ID_USUA']
      },
      observe: "response"
    })
    .pipe(take(1))
  }

  getAssociacaoGrupoFornecedorFornecedoresFiltro(params) : Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/abastecimento/cadastros/associacao-grupo-fornecedor-fornecedores`, {
      params: {
        ID_GRUP_FORN: params
      },
      observe: "response"
    })
    .pipe(take(1))
  }

  postAssociacaoGrupoFornecedorFornecedores(record) : Observable<any> {
    return this.httpClient.post(`${this.BASE_URL}/abastecimento/cadastros/associacao-grupo-fornecedor-fornecedores`, 
      record
    )
    .pipe(take(1))
  }

  deleteAssociacaoGrupoFornecedorFornecedores(record) : Observable<any> {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: record
    };
    return this.httpClient.delete(`${this.BASE_URL}/abastecimento/cadastros/associacao-grupo-fornecedor-fornecedor`,
    options
    )
  }

}
