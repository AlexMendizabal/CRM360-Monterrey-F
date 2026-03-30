import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { take, tap, retry } from 'rxjs/operators';

import { JsonResponse } from './../../../../../models/json-response';
import { environment } from './../../../../../../environments/environment';

import { representantes, dadosBancarios } from './models/representantes';

@Injectable({
  providedIn: 'root',
})
export class ComercialComissoesRepresentantesProgramacaoPagamentosService {
  private readonly API = `https://crm360.monterrey.com.bo/api/comercial/comissoes/representantes/programacao-pagamentos`;

  constructor(protected http: HttpClient) {}

  getListaProgramacao(params: any = []): Observable<any> {

    let httpParams = new HttpParams();
    for (let param in params) {
    httpParams = httpParams.append(param, params[param]);    }
    return this.http.get(`${this.API}/lista`, { params: httpParams })
    .pipe(
      take(1),
      retry(2)
      );
  }

  getSituacao(): Observable<any> {
    return this.http.get(`${this.API}/situacao`)
    .pipe(
      take(1),
      retry(2)
      );
  }

  getAssociacoesDetails(
    codRepresentante: number,
    params?: any
  ): Observable<Object | JsonResponse> {
    let httpParams = new HttpParams();
    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }
    return this.http
      .get(`${this.API}/conta/${codRepresentante}`, { params: httpParams })
      .pipe(take(1), retry(2));
  }

  postProgramacaoPagamento(params): Observable<Object | JsonResponse> {
    return this.http
      .post(`${this.API}/programacao-datas/salvar`, params)
      .pipe(
        take(1)
        );
  }

  postPagamento(params): Observable<Object | JsonResponse> {
    return this.http
      .post(`${this.API}/pagamento/salvar`, params)
      .pipe(
        take(1)
        );
  }

}
