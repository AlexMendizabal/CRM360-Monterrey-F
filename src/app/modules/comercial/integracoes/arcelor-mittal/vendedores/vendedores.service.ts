import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { take, retry } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

// Interfaces
import { IVendedor } from './models/vendedor';
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialIntegracoesArcelorMittalVendedoresService {
  private readonly API = `http://23.254.204.187/api/comercial/integracoes/arcelor-mittal/vendedores`;

  constructor(protected http: HttpClient) {}

  /* getLista() {
    return this.http.get(`${this.API}/lista`).pipe(take(1));
  } */

  getLista(params: any): Observable<Object | JsonResponse> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/lista`, { params: httpParams })
      .pipe(take(1), retry(2));
  }

  getAssociacoes(idArcelorMittal: string) {
    return this.http
      .get(`${this.API}/associacoes/${idArcelorMittal}`)
      .pipe(take(1));
  }

  getVendedores() {
    return this.http.get(`${this.API}/vendedores`).pipe(take(1));
  }

  updateAssociacao(data: any) {
    return this.http.put(`${this.API}/salvar`, data).pipe(take(1));
  }
}
