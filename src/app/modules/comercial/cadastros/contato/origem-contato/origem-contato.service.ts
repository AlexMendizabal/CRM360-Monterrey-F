import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

// Interfaces
import { OrigemContato } from './models/origem-contato';

@Injectable({
  providedIn: 'root',
})
export class ComercialCadastrosContatoOrigemContatoService {
  private readonly API = `http://23.254.204.187/api/comercial/cadastros/contato/origem-contato`;

  constructor(protected http: HttpClient) {}

  getListaOrigemContato(params: any): Observable<any> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/lista`, { params: httpParams })
      .pipe(take(1));
  }

  getAlteracoes(codOrigemContato: number): Observable<any> {
    return this.http
      .get(`${this.API}/alteracoes/${codOrigemContato}`)
      .pipe(take(1));
  }

  getOrigemContato(codOrigemContato: number): Observable<any> {
    return this.http
      .get(`${this.API}/detalhes/${codOrigemContato}`)
      .pipe(take(1));
  }

  private saveOrigemContato(record: any) {
    return this.http.post(`${this.API}/salvar`, record).pipe(take(1));
  }

  private updateOrigemContato(record: any) {
    return this.http.put(`${this.API}/atualizar`, record).pipe(take(1));
  }

  save(record: OrigemContato): Observable<any> {
    if (record.codOrigemContato !== null) {
      return this.updateOrigemContato(record);
    }

    return this.saveOrigemContato(record);
  }

  deleteOrigemContato(codOrigemContato: number): Observable<any> {
    return this.http
      .delete(`${this.API}/excluir/${codOrigemContato}`)
      .pipe(take(1));
  }

  activateOrigemContato(codOrigemContato: number): Observable<any> {
    return this.http.post(`${this.API}/ativar`, codOrigemContato).pipe(take(1));
  }

  inactivateOrigemContato(codOrigemContato: number): Observable<any> {
    return this.http
      .post(`${this.API}/inativar`, codOrigemContato)
      .pipe(take(1));
  }

  getListaOrigemERP(): Observable<any> {
    return this.http.get(`${this.API}/erp/lista`).pipe(take(1));
  }
}
