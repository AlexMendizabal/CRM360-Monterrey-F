import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LogisticaPeacaoService {

  private readonly api = environment.API;

  constructor(
    private http: HttpClient
  ) { }

  get(params?) {
    return this.http.get(`${this.api}/logistica/peacao`, {
      params: params,
      observe: "response"
    })
  }

  post(params) {
    return this.http.post(`${this.api}/logistica/peacao`, params,
      { observe: "response" })
  }

  delete(id) {
    return this.http.delete(`${this.api}/logistica/peacao/${id}`,
      { observe: "response" })
  }
}
