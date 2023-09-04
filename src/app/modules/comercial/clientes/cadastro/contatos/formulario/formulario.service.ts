import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ComercialClientesCadastroContatosFormularioService {
  private readonly API = `http://23.254.204.187/api/comercial/clientes/cadastro/formulario/contatos`;

  constructor(protected http: HttpClient) {}

  loadDepencies() {
    let funcoes = this.getFuncoes();
    let setores = this.getSetores();
    // let timesFutebol = this.getTimesFutebol();

    return forkJoin([funcoes, setores]).pipe(take(1));
  }

  getFuncoes() {
    return this.http.get(`${this.API}/funcoes`).pipe(take(1));
  }

  getSetores() {
    return this.http.get(`${this.API}/setores`).pipe(take(1));
  }

  getTimesFutebol() {
    return this.http.get(`${this.API}/times-futebol`).pipe(take(1));
  }
}
