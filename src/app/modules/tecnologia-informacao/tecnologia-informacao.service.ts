import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { take } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TecnologiaInformacaoService {
  private readonly API = `https://crm360.monterrey.com.bo/api/tecnologia-informacao`;

  constructor(protected http: HttpClient) {}

  getEmpresas(params: any) {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/empresas`, {
        params: httpParams,
      })
      .pipe(take(1));
  }

  getDepositos(params: any) {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/depositos`, {
        params: httpParams,
      })
      .pipe(take(1));
  }

  getLinhas(params: any) {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/linhas`, {
        params: httpParams,
      })
      .pipe(take(1));
  }

  getClasses(params: any) {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/classes`, {
        params: httpParams,
      })
      .pipe(take(1));
  }

  getMateriais(params: any = []) {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/materiais`, { params: httpParams })
      .pipe(take(1));
  }

  getPerfil() {
    return this.http.get(`${this.API}/perfil`).pipe(take(1));
  }

  getEscritorios() {
    return this.http.get(`${this.API}/escritorios`).pipe(take(1));
  }
}
