//angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

//interfaces
import { IAdminDepartamento } from './departamento';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminDepartamentosService {

  private readonly API = environment.API;

  constructor(
    private http: HttpClient
  ) { }

  getDepartamentos(params?) {
    return this.http.get(`${this.API}/core/departamentos`, {
      params: params,
      observe: "response"
    })
  }

  save(params: IAdminDepartamento) {
    return this.http.post(`${this.API}/core/departamento`, params, {
      observe: "response"
    })
  }

}
