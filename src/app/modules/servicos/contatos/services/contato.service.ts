import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContatoService {

  private readonly API = environment.API;

  constructor(
    private http: HttpClient
  ) { }

  get(params?) {
    return this.http.get(`${this.API}/servicos/contatos`, {
      observe: "response",
      params: params
    })
  }
}
