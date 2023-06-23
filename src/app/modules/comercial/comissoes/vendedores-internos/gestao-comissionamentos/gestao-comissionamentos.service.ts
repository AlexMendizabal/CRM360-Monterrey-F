import { descricaoTabela } from './models/tabela-precos';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { take, tap, retry } from 'rxjs/operators';
import { JsonResponse } from './../../../../../models/json-response';
import { environment } from './../../../../../../environments/environment';



@Injectable({
  providedIn: 'root',
})
export class ComercialComissoesVendedoresInternosGestaoComissionamentosService {
  private readonly API = `https://crm360.monterrey.com.bo/api/comercial/comissoes/vendedores-internos/gestao-comissionamentos`;

  constructor(protected http: HttpClient) {}

  /* getComissionamentos(params: any = []): Observable<any> {

    let httpParams = new HttpParams();
    for (let param in params) {
    httpParams = httpParams.append(param, params[param]);    }
    return this.http.get(`${this.API}/lista`, { params: httpParams })
    .pipe(
      take(1),
      retry(2)
      );
  } */

  /* getModelo(params: any = []): Observable<any> {

    let httpParams = new HttpParams();
    for (let param in params) {
    httpParams = httpParams.append(param, params[param]);    }
    return this.http.get(`${this.API}/lista`, { params: httpParams })
    .pipe(
      take(1),
      retry(2)
      );
  } */

   getDetalhes(codRepresentante: number): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/detalhes/${codRepresentante}`)
      .pipe(
        take(1),
        retry(2)
        );
  }

  getPermissoesAcesso(): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/permissoes-acesso`)
      .pipe(take(1), retry(2));
  }


 /*  getAssociacoes(
    codRepresentante: number,
    params?: any
  ): Observable<Object | JsonResponse> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }
    return this.http
    .get(`${this.API}/detalhes/${codRepresentante}`, { params: httpParams })
    .pipe(take(1), retry(2));
  } */

}
