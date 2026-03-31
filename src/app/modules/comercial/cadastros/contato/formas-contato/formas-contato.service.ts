import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

// Interfaces
import { FormaContato } from './models/formas-contato';

@Injectable({
  providedIn: 'root',
})
export class ComercialCadastrosContatoFormasContatoService {
  private readonly API = `https://crm360.monterrey.com.bo/api/comercial/cadastros/contato/forma-contato`;

  constructor(protected http: HttpClient) {}

  getListaFormasContato(params: any): Observable<any> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/lista`, { params: httpParams })
      .pipe(take(1));
  }

  getAlteracoes(codFormaContato: number): Observable<any> {
    return this.http
      .get(`${this.API}/alteracoes/${codFormaContato}`)
      .pipe(take(1));
  }

  getFormaContato(codFormaContato: number): Observable<any> {
    return this.http
      .get(`${this.API}/detalhes/${codFormaContato}`)
      .pipe(take(1));
  }

  private saveFormaContato(record: any) {
    return this.http.post(`${this.API}/salvar`, record).pipe(take(1));
  }

  private updateFormaContato(record: any) {
    return this.http.put(`${this.API}/atualizar`, record).pipe(take(1));
  }

  save(record: FormaContato): Observable<any> {
    if (record.codFormaContato !== null) {
      return this.updateFormaContato(record);
    }

    return this.saveFormaContato(record);
  }

  deleteFormaContato(codFormaContato: number): Observable<any> {
    return this.http
      .delete(`${this.API}/excluir/${codFormaContato}`)
      .pipe(take(1));
  }

  activateFormaContato(codFormaContato: number): Observable<any> {
    return this.http.post(`${this.API}/ativar`, codFormaContato).pipe(take(1));
  }

  inactivateFormaContato(codFormaContato: number): Observable<any> {
    return this.http
      .post(`${this.API}/inativar`, codFormaContato)
      .pipe(take(1));
  }

  getListaFormasERP(): Observable<any> {
    return this.http.get(`${this.API}/erp/lista`).pipe(take(1));
  }
}
