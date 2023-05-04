import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { IAdminSubModulo } from '../models/submodulo';

@Injectable({
  providedIn: 'root'
})
export class AdminSubModulosService {

  private readonly API = environment.API;

  constructor(private http: HttpClient) { }

  getSubModulos(submodulo = {}) {
    return this.http.get<IAdminSubModulo[]>(`${this.API}/core/submodulos`, {
      params: submodulo,
      observe: "response"
    });
  }

  getSubModulo(id: any) {
    return this.http.get<IAdminSubModulo[]>(`${this.API}/core/submodulos/${id}`, {
      observe: "response"
    });
  }

  postSubModulo(subModulo) {
    return this.http.post<IAdminSubModulo>(`${this.API}/core/submodulos`,
      subModulo,
      { observe: "response" }
    );
  }
}
