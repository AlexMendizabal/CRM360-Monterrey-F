import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LogisticaSenhasService {

  private readonly API = environment.API;
  
  constructor(
    private http: HttpClient
  ) {

  }

  getSenhas(params?){
    return this.http.get(`${this.API}/logistica/senhas`, {
      params: params,
      observe: "response"
    })
  }

  postSenha(params){
    return this.http.post(`${this.API}/logistica/senhas`, params, {
      observe: "response"
    })
  }
}
