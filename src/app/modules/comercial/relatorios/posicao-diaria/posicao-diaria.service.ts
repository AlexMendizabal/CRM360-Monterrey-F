import { Injectable } from '@angular/core';
import { take, retry } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';

// Interfaces
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialRelatoriosPosicaoDiariaService {
  private readonly API = `https://crm360.monterrey.com.bo/api/comercial/relatorios/posicao-diaria`;

  constructor(protected http: HttpClient) {}

  getPerfis(): Observable<Object | JsonResponse> {
    return this.http.get(`${this.API}/perfis`).pipe(take(1), retry(2));
  }

  getListaManetoni(data: any): Observable<Object | JsonResponse> {
    return this.http.get(`${this.API}/lista/${data}`).pipe(take(1), retry(2));
  }

  getListaDBA(data: any): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/lista-dba/${data}`)
      .pipe(take(1), retry(2));
  }

  getDetalhesManetoni(params: any): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/detalhes/${params.data}/${params.ordem}`)
      .pipe(take(1), retry(2));
  }

  postRitmoEditado(params: any): Observable<Object | JsonResponse> {
    return this.http.post(`${this.API}/salvar`, params).pipe(take(1), retry(2));
  }
}
