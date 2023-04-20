import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams } from '@angular/common/http';

import { environment } from 'src/environments/environment';

import { IMoeda } from 'src/app/models/moeda';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MoedasService {

  private api = environment.API;

  constructor(
    private http: HttpClient
  ) { }

  getMoedas(params?: Partial<IMoeda>): Observable<HttpResponse<IMoeda[]>> {

    const _params: HttpParams = params as HttpParams;

    return this.http.get<IMoeda[]>(`${this.api}/servicos/moedas`, {
      params: _params,
      observe: "response"
    })
  }
}
