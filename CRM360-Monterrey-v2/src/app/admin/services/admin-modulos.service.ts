import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdminModulosService {
  private http = inject(HttpClient);
  private readonly API = '/api';

  getModulos(params: any = {}) {
    return this.http.get<any>(`${this.API}/core/modulos`, {
      params,
      observe: 'response'
    });
  }

  postModulo(params: any) {
    return this.http.post<any>(`${this.API}/core/modulos`, params, {
      observe: 'response'
    });
  }
}
