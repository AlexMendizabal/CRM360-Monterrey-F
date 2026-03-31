import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { take, retry } from 'rxjs/operators';

// Interfaces
import { JsonResponse } from 'src/app/models/json-response';
import { ICampanhas } from './models/campanhas';

@Injectable({
  providedIn: 'root'
})
export class ComercialCadastrosCampanhasService {
  private readonly API = `https://crm360.monterrey.com.bo/api/comercial/cadastros/campanhas`;

  constructor(
    protected http: HttpClient,
  ) { }

  getListaCampanhas(params: any): Observable<Object | JsonResponse> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }
    return this.http
      .get(`${this.API}/lista`, { params: httpParams })
      .pipe(take(1), retry(2));
  }
}
