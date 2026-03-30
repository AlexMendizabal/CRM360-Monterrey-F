import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

// Interfaces
import { TipoOperador } from './models/tipo-operador';

@Injectable({
  providedIn: 'root'
})
export class ComercialCadastrosTipoOperadorService {
  private readonly API = `https://crm360.monterrey.com.bo/api/comercial/cadastros/tipo-operador`;

  constructor(protected http: HttpClient) {}

  getListaTipoOperador(params: any): Observable<any> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/lista`, { params: httpParams })
      .pipe(take(1));
  }

  getAlteracoes(codTipoOperador: number): Observable<any> {
    return this.http
      .get(`${this.API}/alteracoes/${codTipoOperador}`)
      .pipe(take(1));
  }

  getDetalhes(codTipoOperador: number): Observable<any> {
    return this.http
      .get(`${this.API}/detalhes/${codTipoOperador}`)
      .pipe(take(1));
  }

  private saveTipoOperador(tipoOperador: TipoOperador) {
    return this.http.post(`${this.API}/salvar`, tipoOperador).pipe(take(1));
  }

  private updateTipoOperador(tipoOperador: TipoOperador) {
    return this.http.put(`${this.API}/atualizar`, tipoOperador).pipe(take(1));
  }

  save(tipoOperador: TipoOperador): Observable<any> {
    if (tipoOperador.codTipoOperador !== null) {
      return this.updateTipoOperador(tipoOperador);
    }

    return this.saveTipoOperador(tipoOperador);
  }

  activateTipoOperador(codTipoOperador: number): Observable<any> {
    return this.http.post(`${this.API}/ativar`, codTipoOperador).pipe(take(1));
  }

  inactivateTipoOperador(codTipoOperador: number): Observable<any> {
    return this.http
      .post(`${this.API}/inativar`, codTipoOperador)
      .pipe(take(1));
  }
}
