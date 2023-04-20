//angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminPrestadorServicoService {

  private readonly API = environment.API;

  constructor(
    private http: HttpClient
  ) { }

  postPrestadorServico(params) {
    return this.http.post(`${this.API}/core/prestador-servico/colaborador`, params, {
      observe: "response"
    });
  }

}
