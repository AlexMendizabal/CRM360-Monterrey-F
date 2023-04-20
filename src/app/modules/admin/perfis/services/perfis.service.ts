import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';

import { IAdminPeril } from '../models/perfil';
import { event } from '../models/event';

@Injectable({
  providedIn: 'root'
})
export class AdminPerfisService {

  private readonly API: string = environment.API;

  event: EventEmitter<Partial<event>> = new EventEmitter<Partial<event>>();

  constructor(
    private http: HttpClient
  ) { }

  getPerfil(perfil = {}) {
    return this.http.get<IAdminPeril>(`${this.API}/core/perfis`, {
      params: perfil,
      observe: "response"
    })
  }

  getPerfis(params?) {
    return this.http.get<IAdminPeril>(`${this.API}/core/perfis`, {
      params: params,
      observe: "response"
    })
  }

  postPerfil(perfil) {
    return this.http.post(`${this.API}/core/perfis`,
      perfil,
      { observe: "response" }
    )
  }

  getAtividadesAssociadas(params?) {
    return this.http.get<IAdminPeril>(`${this.API}/core/perfis/atividades`, {
      params: params,
      observe: "response"
    })
  }

  postAtividadesAssociadas(params) {
    return this.http.post(`${this.API}/core/perfis/atividades`,
      params,
      { observe: "response" }
    )
  }

}
