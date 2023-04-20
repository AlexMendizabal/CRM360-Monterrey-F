import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class AbastecimentoCadastrosIntegradorDepositosService {

  private readonly BASE_URL = environment.API;

  constructor(
    private httpClient: HttpClient
  ) { }

  getDepositos(idSituacao) {
    return this.httpClient.get(`${this.BASE_URL}/common/v2/depositos`, {
      params: {
        IN_STAT: idSituacao
      },
      observe: "response"
    });
  }

  getIntegradorDepositos(params) : Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/abastecimento/cadastros/associacao-integrador-pedidos-depositos`,
    {
      params: {
        ID_APOI_INTE_PEDI: params['ID_APOI_INTE_PEDI']
      },
      observe: "response"
    })
    .pipe(take(1))
  }

  getIntegradoresPedidosFiltro(params) : Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/common/v2/integradores-pedidos`, {
      params: {
        IN_STAT: params
      },
      observe: "response"
    });
  }

  getIntegradoresPedidos(params) : Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/common/v2/integradores-pedidos`, {
      params: {
        IN_STAT: params['IN_STAT'],
        ID: params['ID_APOI_INTE_PEDI']
      },
      observe: "response"
    });
  }

  postIntegradorDepositos(record) : Observable<any> {
    return this.httpClient.post(`${this.BASE_URL}/abastecimento/cadastros/associacao-integrador-pedidos-depositos`,
      record
    )
    .pipe(take(1))
  }

  deleteIntegradorDepositos(record) : Observable<any> {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: record
    };
    return this.httpClient.delete(`${this.BASE_URL}/abastecimento/cadastros/associacao-integrador-pedidos-deposito`,
    options
    )
  }

}
