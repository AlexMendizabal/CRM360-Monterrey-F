import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

// Interfaces
import { Escritorio } from './models/escritorio';

@Injectable({
  providedIn: 'root'
})
export class ComercialCadastrosEscritorioService {
  private readonly API = `https://crm360.monterrey.com.bo/api/comercial/cadastros/escritorio`;

  constructor(protected http: HttpClient) {}

  getListaEscritorios(params?: any): Observable<any> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/lista`, { params: httpParams })
      .pipe(take(1));
  }

  getAlteracoes(codEscritorio: number): Observable<any> {
    return this.http
      .get(`${this.API}/alteracoes/${codEscritorio}`)
      .pipe(take(1));
  }

  getDetalhes(codEscritorio: number): Observable<any> {
    return this.http.get(`${this.API}/detalhes/${codEscritorio}`).pipe(take(1));
  }

  private saveEscritorio(escritorio: Escritorio) {
    return this.http.post(`${this.API}/salvar`, escritorio).pipe(take(1));
  }

  private updateEscritorio(escritorio: Escritorio) {
    return this.http.put(`${this.API}/atualizar`, escritorio).pipe(take(1));
  }

  save(escritorio: Escritorio): Observable<any> {
    if (escritorio.codEscritorio !== null) {
      return this.updateEscritorio(escritorio);
    }

    return this.saveEscritorio(escritorio);
  }

  activateEscritorio(codEscritorio: number): Observable<any> {
    return this.http.post(`${this.API}/ativar`, codEscritorio).pipe(take(1));
  }

  inactivateEscritorio(codEscritorio: number): Observable<any> {
    return this.http.post(`${this.API}/inativar`, codEscritorio).pipe(take(1));
  }
}
