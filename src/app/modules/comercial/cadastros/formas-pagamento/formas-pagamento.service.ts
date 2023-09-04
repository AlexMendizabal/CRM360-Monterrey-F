import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

// Interfaces
import { FormasPagamento } from './models/formas-pagamento';

@Injectable({
  providedIn: 'root',
})
export class ComercialCadastrosFormasPagamentoService {
  private readonly API = `http://23.254.204.187/api/comercial/cadastros/formas-pagamento`;

  constructor(protected http: HttpClient) {}

  getListaFormasPagamento(params?: any): Observable<any> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/lista`, { params: httpParams })
      .pipe(take(1));
  }

  getAlteracoes(codFormaPagamento: number): Observable<any> {
    return this.http
      .get(`${this.API}/alteracoes/${codFormaPagamento}`)
      .pipe(take(1));
  }

  getDetalhes(codFormaPagamento: number): Observable<any> {
    return this.http
      .get(`${this.API}/detalhes/${codFormaPagamento}`)
      .pipe(take(1));
  }

  private saveFormasPagamento(formaPagamento: FormasPagamento) {
    return this.http.post(`${this.API}/salvar`, formaPagamento).pipe(take(1));
  }

  private updateFormasPagamento(formaPagamento: FormasPagamento) {
    return this.http.put(`${this.API}/atualizar`, formaPagamento).pipe(take(1));
  }

  save(formaPagamento: FormasPagamento): Observable<any> {
    if (formaPagamento.codFormaPagamento !== null) {
      return this.updateFormasPagamento(formaPagamento);
    }

    return this.saveFormasPagamento(formaPagamento);
  }

  activateFormasPagamento(codigo: number): Observable<any> {
    return this.http.post(`${this.API}/ativar`, codigo).pipe(take(1));
  }

  inactivateFormasPagamento(codigo: number): Observable<any> {
    return this.http.post(`${this.API}/inativar`, codigo).pipe(take(1));
  }

  getListaFormasERP(): Observable<any> {
    return this.http.get(`${this.API}/erp/lista`).pipe(take(1));
  }
}
