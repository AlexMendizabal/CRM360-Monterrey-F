import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

// Interfaces
import { MotivoAssociacao } from './models/motivo-associacao';

@Injectable({
  providedIn: 'root'
})
export class ComercialCadastrosMotivoAssociacaoService {
  private readonly API = `http://127.0.0.1:8000/comercial/cadastros/motivo-associacao`;

  constructor(protected http: HttpClient) {}

  getListaMotivosAssociacao(params: any): Observable<any> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/lista`, { params: httpParams })
      .pipe(take(1));
  }

  getAlteracoes(codMotivoAssociacao: number): Observable<any> {
    return this.http
      .get(`${this.API}/alteracoes/${codMotivoAssociacao}`)
      .pipe(take(1));
  }

  getDetalhes(codMotivoAssociacao: number): Observable<any> {
    return this.http
      .get(`${this.API}/detalhes/${codMotivoAssociacao}`)
      .pipe(take(1));
  }

  private saveMotivoAssociacao(motivoAssociacao: MotivoAssociacao) {
    return this.http.post(`${this.API}/salvar`, motivoAssociacao).pipe(take(1));
  }

  private updateMotivoAssociacao(motivoAssociacao: MotivoAssociacao) {
    return this.http
      .put(`${this.API}/atualizar`, motivoAssociacao)
      .pipe(take(1));
  }

  save(motivoAssociacao: MotivoAssociacao): Observable<any> {
    if (motivoAssociacao.codMotivoAssociacao !== null) {
      return this.updateMotivoAssociacao(motivoAssociacao);
    }

    return this.saveMotivoAssociacao(motivoAssociacao);
  }

  activateMotivoAssociacao(codigo: number): Observable<any> {
    return this.http.post(`${this.API}/ativar`, codigo).pipe(take(1));
  }

  inactivateMotivoAssociacao(codigo: number): Observable<any> {
    return this.http.post(`${this.API}/inativar`, codigo).pipe(take(1));
  }
}
