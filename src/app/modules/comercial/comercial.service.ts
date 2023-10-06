import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { take, retry } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

// Interfaces
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialService {
  private readonly API = `http://23.254.204.187/api/comercial`;

  constructor(protected http: HttpClient) {}

  getEmpresas(params?: any): Observable<Object> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/empresas`, {
        params: httpParams,
      })
      .pipe(take(1), retry(2));
  }

  getDepositos(params: any): Observable<Object> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/depositos`, {
        params: httpParams,
      })
      .pipe(take(1), retry(2));
  }

  getLinhas(params: any): Observable<Object> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/linhas`, {
        params: httpParams,
      })
      .pipe(take(1), retry(2));
  }

  getClasses(params: any): Observable<Object> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/classes`, {
        params: httpParams,
      })
      .pipe(take(1), retry(2));
  }

  getMateriais(params: any = []): Observable<Object | JsonResponse> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/materiais`, { params: httpParams })
      .pipe(take(1), retry(2));
  }

  getPerfil(): Observable<Object> {
    return this.http.get(`${this.API}/perfil`).pipe(take(1), retry(2));
  }

  getEscritorios(): Observable<Object> {
    return this.http.get(`${this.API}/escritorios`).pipe(take(1), retry(2));
  }
}
