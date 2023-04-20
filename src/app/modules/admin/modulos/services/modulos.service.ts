import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { IAdminModulo } from '../models/modulo';

@Injectable({
  providedIn: 'root'
})
export class AdminModulosService {

  private readonly API = environment.API;

  constructor(private http: HttpClient) { }

  getModulos(modulo = {}) {
    return this.http.get<IAdminModulo[]>(`${this.API}/core/modulos`, {
      params: modulo,
      observe: "response"
    });
  }

  getModulosComAcesso(matricula) {
    return this.http.get<IAdminModulo[]>(`${this.API}/core/modulos/${matricula}`, {
      observe: "response"
    });
  }

  getModulo(id: any) {
    return this.http.get<IAdminModulo[]>(`${this.API}/core/modulo/${id}`, {
      observe: "response"
    });
  }

  postModulo(modulo) {
    return this.http.post<IAdminModulo>(`${this.API}/core/modulos`,
      modulo,
      { observe: "response" }
    );
  }
}
