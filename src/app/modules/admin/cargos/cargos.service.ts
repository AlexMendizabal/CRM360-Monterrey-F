//angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';

//intefaces
import { IAdminCargo } from './cargo';

@Injectable({
  providedIn: 'root'
})
export class AdminCargosService {

  private readonly API = environment.API;

  constructor(
    private http: HttpClient
  ) { }

  getCargos(params?) {
    return this.http.get(`${this.API}/core/cargos`, {
      params: params,
      observe: "response"
    })
  }

  save(params: IAdminCargo) {
    return this.http.post(`${this.API}/core/cargo`, params, {
      observe: "response"
    })
  }

}
