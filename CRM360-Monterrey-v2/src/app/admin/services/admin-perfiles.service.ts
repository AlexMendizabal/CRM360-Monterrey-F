import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdminPerfilesService {
  private http = inject(HttpClient);
  private readonly API = '/api';

  getPerfiles(params: any = {}) {
    return this.http.get<any>(`${this.API}/core/perfis`, {
      params,
      observe: 'response'
    });
  }

  postPerfil(params: any) {
    return this.http.post<any>(`${this.API}/core/perfis`, params, {
      observe: 'response'
    });
  }


  postAtividadesAssociadas(params: any) {
    return this.http.post<any>(`${this.API}/core/perfis/atividades`, params, {
      observe: 'response'
    });
  }
}
