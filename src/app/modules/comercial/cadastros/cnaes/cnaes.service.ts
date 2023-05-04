import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

// Interfaces
import { ICnae } from './models/cnaes';

@Injectable({
  providedIn: 'root',
})
export class ComercialCadastrosCnaesService {
  private readonly API = `https://crm360.monterrey.com.bo/api/comercial/cadastros/cnaes`;

  constructor(protected http: HttpClient) {}

  getListaCnaes(params: any): Observable<any> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/lista`, { params: httpParams })
      .pipe(take(1));
  }

  getAlteracoes(codCnae: number): Observable<any> {
    return this.http.get(`${this.API}/alteracoes/${codCnae}`).pipe(take(1));
  }

  getDetalhes(codCnae: number): Observable<any> {
    return this.http.get(`${this.API}/detalhes/${codCnae}`).pipe(take(1));
  }

  private saveCnae(cnae: ICnae) {
    return this.http.post(`${this.API}/salvar`, cnae).pipe(take(1));
  }

  private updateCnae(cnae: ICnae) {
    return this.http.put(`${this.API}/atualizar`, cnae).pipe(take(1));
  }

  save(cnae: ICnae): Observable<any> {
    if (cnae.codigo !== null) {
      return this.updateCnae(cnae);
    }

    return this.saveCnae(cnae);
  }

  activateCnae(codigo: number): Observable<any> {
    return this.http.post(`${this.API}/ativar`, codigo).pipe(take(1));
  }

  inactivateCnae(codigo: number): Observable<any> {
    return this.http.post(`${this.API}/inativar`, codigo).pipe(take(1));
  }
}
