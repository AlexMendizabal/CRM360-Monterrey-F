import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

// Interfaces
import { Concorrente } from './models/concorrente';

@Injectable({
  providedIn: 'root'
})
export class ComercialCadastrosConcorrenteService {
  private readonly API = `http://23.254.204.187/api/comercial/cadastros/concorrentes`;

  constructor(protected http: HttpClient) {}

  getListaConcorrentes(params: any): Observable<any> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/lista`, { params: httpParams })
      .pipe(take(1));
  }

  getConcorrente(codConcorrenteTid: number): Observable<any> {
    return this.http
      .get(`${this.API}/detalhes/${codConcorrenteTid}`)
      .pipe(take(1));
  }

  getAlteracoes(codCnae: number): Observable<any> {
    return this.http.get(`${this.API}/alteracoes/${codCnae}`).pipe(take(1));
  }

  private saveConcorrente(record: any) {
    return this.http.post(`${this.API}/salvar`, record).pipe(take(1));
  }

  private updateConcorrente(record: any) {
    return this.http.put(`${this.API}/atualizar`, record).pipe(take(1));
  }

  save(record: Concorrente): Observable<any> {
    if (record.codConcorrenteTid !== null) {
      return this.updateConcorrente(record);
    }

    return this.saveConcorrente(record);
  }

  activateConcorrente(codigo: number): Observable<any> {
    return this.http.post(`${this.API}/ativar`, codigo).pipe(take(1));
  }

  inactivateConcorrente(codigo: number): Observable<any> {
    return this.http.post(`${this.API}/inativar`, codigo).pipe(take(1));
  }
}
