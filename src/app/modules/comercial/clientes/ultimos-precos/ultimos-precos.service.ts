import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ComercialClientesUltimosPrecosService {
  private readonly API = `https://crm360.monterrey.com.bo/api/comercial/clientes/ultimos-precos`;

  constructor(protected http: HttpClient) {}

  getListaUltimosPrecos(params: any): Observable<any> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/lista`, { params: httpParams })
      .pipe(take(1));
  }
}
