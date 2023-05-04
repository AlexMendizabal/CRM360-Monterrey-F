import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

// Interfaces
import { ISituacaoContratos } from './models/situacoes-contratos-comerciais';

@Injectable({
  providedIn: 'root',
})
export class ComercialCadastrosContratosComerciaisSituacoesContratosComerciaisService {
  private readonly API = `https://crm360.monterrey.com.bo/api/comercial/cadastros/contratos-comerciais/situacoes-contratos-comerciais`;

  constructor(protected http: HttpClient) {}

  getListaSituacoesContratosComerciais(params: any): Observable<any> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/lista`, { params: httpParams })
      .pipe(take(1));
  }

  getAlteracoes(codSituacaoContrato: number): Observable<any> {
    return this.http
      .get(`${this.API}/alteracoes/${codSituacaoContrato}`)
      .pipe(take(1));
  }

  getDetalhes(codSituacaoContrato: number): Observable<any> {
    return this.http
      .get(`${this.API}/detalhes/${codSituacaoContrato}`)
      .pipe(take(1));
  }

  private saveSituacaoContratoComercial(situacaoContrato: ISituacaoContratos) {
    return this.http.post(`${this.API}/salvar`, situacaoContrato).pipe(take(1));
  }

  private updateSituacaoContratoComercial(
    situacaoContrato: ISituacaoContratos
  ) {
    return this.http
      .put(`${this.API}/atualizar`, situacaoContrato)
      .pipe(take(1));
  }

  save(situacaoContrato: ISituacaoContratos): Observable<any> {
    if (situacaoContrato.codSituacao !== null) {
      return this.updateSituacaoContratoComercial(situacaoContrato);
    }

    return this.saveSituacaoContratoComercial(situacaoContrato);
  }

  activateSituacaoContratoComercial(codigo: number): Observable<any> {
    return this.http.post(`${this.API}/ativar`, codigo).pipe(take(1));
  }

  inactivateSituacaoContratoComercial(codigo: number): Observable<any> {
    return this.http.post(`${this.API}/inativar`, codigo).pipe(take(1));
  }
}
