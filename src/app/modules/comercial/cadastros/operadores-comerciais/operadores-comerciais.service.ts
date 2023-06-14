import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

// Interfaces
import { OperadorComercial } from './models/operador-comercial';

@Injectable({
  providedIn: 'root'
})
export class ComercialCadastrosOperadorComercialService {
  private readonly API = `http://127.0.0.1:8000/comercial/cadastros/operador-comercial`;

  constructor(protected http: HttpClient) {}

  getListaOperadoresComerciais(params: any): Observable<any> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/lista`, { params: httpParams })
      .pipe(take(1));
  }

  getDetalhes(codOperador: number): Observable<any> {
    return this.http.get(`${this.API}/detalhes/${codOperador}`).pipe(take(1));
  }

  private saveOperadorComercial(operadorComercial: OperadorComercial) {
    return this.http
      .post(`${this.API}/salvar`, operadorComercial)
      .pipe(take(1));
  }

  private updateOperadorComercial(operadorComercial: OperadorComercial) {
    return this.http
      .put(`${this.API}/atualizar`, operadorComercial)
      .pipe(take(1));
  }

  save(operadorComercial: OperadorComercial): Observable<any> {
    if (operadorComercial.codOperador !== null) {
      return this.updateOperadorComercial(operadorComercial);
    }

    return this.saveOperadorComercial(operadorComercial);
  }

  activateOperadorComercial(codOperador: number): Observable<any> {
    return this.http.post(`${this.API}/ativar`, codOperador).pipe(take(1));
  }

  inactivateOperadorComercial(codOperador: number): Observable<any> {
    return this.http.post(`${this.API}/inativar`, codOperador).pipe(take(1));
  }

  getAssociacoesOperadores(codOperador: number): Observable<any> {
    return this.http
      .get(`${this.API}/associacoes/${codOperador}`)
      .pipe(take(1));
  }

  getHistoricoAssociacoes(codOperador: number): Observable<any> {
    return this.http
      .get(`${this.API}/historico-associacoes/${codOperador}`)
      .pipe(take(1));
  }

  postAssociacaoOperador(params: any) {
    return this.http
      .post(`${this.API}/salvar-associacao`, params)
      .pipe(take(1));
  }

  deleteAssociacaoOperador(params: any): Observable<any> {
    return this.http
      .post(`${this.API}/excluir-associacao`, params)
      .pipe(take(1));
  }
}
