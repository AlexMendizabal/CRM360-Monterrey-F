import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdminUsuariosService {
  private http = inject(HttpClient);
  private readonly API = '/api'; // Configurado con el proxy local

  getUsuarios(params: any = {}) {
    return this.http.get<any>(`${this.API}/core/usuarios`, {
      params,
      observe: 'response'
    });
  }

  getCargos() {
    return this.http.get(`${this.API}/core/usuarios/cargos`);
  }

  getDepartamentos() {
    return this.http.get(`${this.API}/core/usuarios/departamentos`);
  }

  postUsuario(usuario: any) {
    return this.http.post(`${this.API}/core/usuarios`, usuario, { observe: 'response' });
  }

  postPerfilAssociado(usuario: any) {
    return this.http.post(`${this.API}/core/usuarios/perfis`, usuario, { observe: 'response' });
  }

  sincronizaAD() {
    return this.http.get(`${this.API}/core/usuarios/ad/sincronismo`, { observe: 'response' });
  }
}
