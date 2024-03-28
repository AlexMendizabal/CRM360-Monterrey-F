import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminUsuariosService {

  private readonly API = environment.API;

  constructor(
    private http: HttpClient
  ) { }

  getUsuarios(usuario = {}) {
    return this.http.get(`${this.API}/core/usuarios`, {
      params: usuario,
      observe: "response"
    });
  }

  getCargos(){
    return this.http.get(`${this.API}/core/usuarios/cargos`, {});
  }

  getDepartamentos(){
    return this.http.get(`${this.API}/core/usuarios/departamentos`, {});
  }

  postUsuario(usuario) {
    return this.http.post(`${this.API}/core/usuarios`,
      usuario,
      { observe: "response" }
    );
  }

  postPerfilAssociado(usuario) {
    return this.http.post(`${this.API}/core/usuarios/perfis`,
      usuario,
      { observe: "response" }
    );
  }

  sincronizaAD() {
    return this.http.get(`${this.API}/core/usuarios/ad/sincronismo`, {
      observe: "response"
    });
  }

}
