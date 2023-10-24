import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

// Interfaces
import { DiaNaoUtil } from './models/dia-nao-util';

@Injectable({
  providedIn: 'root'
})
export class ComercialCadastrosDiaNaoUtilService {
  private readonly API = `http://127.0.0.1:8000/comercial/cadastros/dias-nao-uteis`;

  constructor(protected http: HttpClient) {}

  getListaDiasNaoUteis(params: any): Observable<any> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/lista`, { params: httpParams })
      .pipe(take(1));
  }

  getAlteracoes(codigo: number): Observable<any> {
    return this.http.get(`${this.API}/alteracoes/${codigo}`).pipe(take(1));
  }

  getDetalhes(codigo: number): Observable<any> {
    return this.http.get(`${this.API}/detalhes/${codigo}`).pipe(take(1));
  }

  private saveDiaNaoUtil(record: DiaNaoUtil) {
    return this.http.post(`${this.API}/salvar`, record).pipe(take(1));
  }

  private updateDiaNaoUtil(record: DiaNaoUtil) {
    return this.http.put(`${this.API}/atualizar`, record).pipe(take(1));
  }

  save(record: DiaNaoUtil): Observable<any> {
    if (record.codigo !== null) {
      return this.updateDiaNaoUtil(record);
    }

    return this.saveDiaNaoUtil(record);
  }

  activateDiaNaoUtil(codigo: number): Observable<any> {
    return this.http.post(`${this.API}/ativar`, codigo).pipe(take(1));
  }

  inactivateDiaNaoUtil(codigo: number): Observable<any> {
    return this.http.post(`${this.API}/inativar`, codigo).pipe(take(1));
  }
}
