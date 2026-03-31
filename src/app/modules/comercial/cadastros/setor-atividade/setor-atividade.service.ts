import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

// Interfaces
import { SetorAtividade } from './models/setor-atividade';

@Injectable({
  providedIn: 'root',
})
export class ComercialCadastrosSetorAtividadeService {
  private readonly API = `https://crm360.monterrey.com.bo/api/comercial/cadastros/setor-atividade`;

  constructor(protected http: HttpClient) {}

  getListaSetorAtividade(params: any): Observable<any> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/lista`, { params: httpParams })
      .pipe(take(1));
  }

  getListaSetorAtividadeTid(): Observable<any> {
    return this.http.get(`${this.API}/tid/lista`).pipe(take(1));
  }

  getAlteracoes(codSetorAtividade: number): Observable<any> {
    return this.http
      .get(`${this.API}/alteracoes/${codSetorAtividade}`)
      .pipe(take(1));
  }

  getDetalhes(codSituacaoProposta: number): Observable<any> {
    return this.http
      .get(`${this.API}/detalhes/${codSituacaoProposta}`)
      .pipe(take(1));
  }

  private saveSetorAtividade(setorAtividade: SetorAtividade) {
    return this.http.post(`${this.API}/salvar`, setorAtividade).pipe(take(1));
  }

  private updateSetorAtividade(setorAtividade: SetorAtividade) {
    return this.http.put(`${this.API}/atualizar`, setorAtividade).pipe(take(1));
  }

  save(setorAtividade: SetorAtividade): Observable<any> {
    if (setorAtividade.codSetorAtividade !== null) {
      return this.updateSetorAtividade(setorAtividade);
    }

    return this.saveSetorAtividade(setorAtividade);
  }

  activateSetorAtividade(codigo: number): Observable<any> {
    return this.http.post(`${this.API}/ativar`, codigo).pipe(take(1));
  }

  inactivateSetorAtividade(codigo: number): Observable<any> {
    return this.http.post(`${this.API}/inativar`, codigo).pipe(take(1));
  }
}
