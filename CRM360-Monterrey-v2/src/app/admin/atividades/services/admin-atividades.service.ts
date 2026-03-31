import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdminAtividadesService {
  private http = inject(HttpClient);
  private readonly API = '/api';

  getAtividades(params: any = {}) {
    return this.http.get<any>(`${this.API}/core/atividades`, {
      params,
      observe: 'response'
    });
  }

  postAtividade(atividade: any) {
    return this.http.post<any>(`${this.API}/core/atividades`, atividade, {
      observe: 'response'
    });
  }

  getTipoAtividade() {
    return this.http.get<any>(`${this.API}/core/atividades/tipos`, {
      observe: 'response'
    });
  }
}
