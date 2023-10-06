import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

// Interfaces
import { TitulosAgenda } from './models/titulos-agenda';

@Injectable({
  providedIn: 'root',
})
export class ComercialCadastrosTitulosAgendaService {
  private readonly API = `http://23.254.204.187/api/comercial/cadastros/titulos-agenda`;

  constructor(protected http: HttpClient) {}

  getListaTitulosAgenda(params: any): Observable<any> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/lista`, { params: httpParams })
      .pipe(take(1));
  }


  getDetalhes(codTitulo: number): Observable<any> {
    return this.http
      .get(`${this.API}/detalhes/${codTitulo}`)
      .pipe(take(1));
  }

  private saveTitulosAgenda(titulosAgenda: TitulosAgenda) {
    return this.http.post(`${this.API}/salvar`, titulosAgenda).pipe(take(1));
  }

  private updateTitulosAgenda(titulosAgenda: TitulosAgenda) {
    return this.http.put(`${this.API}/atualizar`, titulosAgenda).pipe(take(1));
  }

  save(titulosAgenda: TitulosAgenda): Observable<any> {
    if (titulosAgenda.codTitulo !== null) {
      return this.updateTitulosAgenda(titulosAgenda);
    }

    return this.saveTitulosAgenda(titulosAgenda);
  }

  activateTitulosAgenda(codigo: number): Observable<any> {
    return this.http.post(`${this.API}/ativar`, codigo).pipe(take(1));
  }

  inactivateTitulosAgenda(codigo: number): Observable<any> {
    return this.http.post(`${this.API}/inativar`, codigo).pipe(take(1));
  }
}
