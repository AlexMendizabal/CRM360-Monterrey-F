import { JsonResponse } from 'src/app/models/json-response';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { take } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

// Interfaces
import { TipoComissionamento } from './models/tipo-comissionamento';

@Injectable({
  providedIn: 'root'
})
export class ComercialCadastrosTipoComissionamentoService {
  private readonly API = `http://127.0.0.1:8000/comercial/cadastros/tipo-comissionamento`;

  constructor(protected http: HttpClient) {}

  getTipoComissionamento(params?: any): Observable<any> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/lista`, { params: httpParams })
      .pipe(take(1));
  }

  getAlteracoes(codTipoComissionamento: number): Observable<any> {
    return this.http
      .get(`${this.API}/alteracoes/${codTipoComissionamento}`)
      .pipe(take(1));
  }

  getDetalhes(codTipoComissionamento: number): Observable<any> {
    return this.http
      .get(`${this.API}/detalhes/${codTipoComissionamento}`)
      .pipe(take(1));
  }

  getDetailTipoComissionamento(codTipoComissionamento: number): Observable<any> {
    return this.http
      .get(`${this.API}/faixa-percentual/${codTipoComissionamento}`)
      .pipe(take(1));
  }

  getFilterValues(): Observable<Object | JsonResponse> {
    let linhas = this.getLinhas();
    let classes = this.getClasses(null);

    return forkJoin([
      linhas,
      classes,
    ]).pipe(take(1));
  }


  getLinhas(): Observable<any> {
    return this.http
      .get(`${this.API}/linhas`)
      .pipe(take(1));
  }

  getClasses(params: any): Observable<Object> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/classes`, {
        params: httpParams,
      })
      .pipe(take(1));
  }

  private saveTipoComissionamento(codTipoComissionamento) {
    return this.http.post(`${this.API}/salvar`, codTipoComissionamento).pipe(take(1));
  }

  private updateTipoComissionamento(codTipoComissionamento) {
    return this.http.put(`${this.API}/atualizar`, codTipoComissionamento).pipe(take(1));
  }

  save(codTipoComissionamento): Observable<any> {
    if (codTipoComissionamento.codTipoComissionamento !== null) {
      return this.updateTipoComissionamento(codTipoComissionamento);
    }

    return this.saveTipoComissionamento(codTipoComissionamento);
  }

  deleteFaixa(params: any): Observable<Object> {
    return this.http
      .put(`${this.API}/delete`, params)
      .pipe(take(1));
  }

  activateTipoComissionamento(codTipoComissionamento: number): Observable<any> {
    return this.http.post(`${this.API}/ativar`, codTipoComissionamento).pipe(take(1));
  }

  inactivateTipoComissionamento(codTipoComissionamento: number): Observable<any> {
    return this.http.post(`${this.API}/inativar`, codTipoComissionamento).pipe(take(1));
  }
}
