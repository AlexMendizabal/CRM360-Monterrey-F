import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

// Interfaces
import { SituacaoProposta } from './models/situacao-proposta';

@Injectable({
  providedIn: 'root',
})
export class ComercialCadastrosSituacaoPropostaService {
  private readonly API = `http://127.0.0.1:8000/comercial/cadastros/situacao-proposta`;

  constructor(protected http: HttpClient) {}

  getListaSituacaoProposta(params?: any): Observable<any> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/lista`, { params: httpParams })
      .pipe(take(1));
  }

  getListaSituacaoPropostaTid(): Observable<any> {
    return this.http.get(`${this.API}/tid/lista`).pipe(take(1));
  }

  getAlteracoes(codSituacaoProposta: number): Observable<any> {
    return this.http
      .get(`${this.API}/alteracoes/${codSituacaoProposta}`)
      .pipe(take(1));
  }

  getDetalhes(codSituacaoProposta: number): Observable<any> {
    return this.http
      .get(`${this.API}/detalhes/${codSituacaoProposta}`)
      .pipe(take(1));
  }

  private saveSituacaoProposta(situacaoProposta: SituacaoProposta) {
    return this.http.post(`${this.API}/salvar`, situacaoProposta).pipe(take(1));
  }

  private updateSituacaoProposta(situacaoProposta: SituacaoProposta) {
    return this.http
      .put(`${this.API}/atualizar`, situacaoProposta)
      .pipe(take(1));
  }

  save(situacaoProposta: SituacaoProposta): Observable<any> {
    if (situacaoProposta.codSituacaoProposta !== null) {
      return this.updateSituacaoProposta(situacaoProposta);
    }

    return this.saveSituacaoProposta(situacaoProposta);
  }

  activateSituacaoProposta(codigo: number): Observable<any> {
    return this.http.post(`${this.API}/ativar`, codigo).pipe(take(1));
  }

  inactivateSituacaoProposta(codigo: number): Observable<any> {
    return this.http.post(`${this.API}/inativar`, codigo).pipe(take(1));
  }
}
