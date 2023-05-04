import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';

import { IAdminEmpresa } from './empresa';

@Injectable({
  providedIn: 'root'
})
export class AdminEmpresasService {

  private readonly API = environment.API;

  constructor(
    private http: HttpClient
  ) { }

  getEmpresas(params?) {
    return this.http.get(`${this.API}/core/empresas`, {
      params: params,
      observe: "response"
    })
  }

  save(params: IAdminEmpresa) {
    return this.http.post(`${this.API}/core/empresas`, params, {
      observe: "response"
    })
  }

}
