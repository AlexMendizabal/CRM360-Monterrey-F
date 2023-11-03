import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { take } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ComercialClientesHistoricoFinanceiroService {
  private readonly API = `http://23.254.204.187/api/comercial/clientes/historico-financeiro`;

  constructor(protected http: HttpClient) {}

  getPermissaoAcesso(id: any) {
    return this.http.get(`${this.API}/permissao-acesso/${id}`).pipe(take(1));
  }

  getResumoSintetico(id: any, grupoEconomico: any) {
    let httpParams = new HttpParams().set('grupoEconomico', grupoEconomico);

    return this.http
      .get(`${this.API}/resumo/sintetico/${id}`, { params: httpParams })
      .pipe(take(1));
  }

  getGrupoEconomico(id: any) {
    return this.http.get(`${this.API}/grupo-economico/${id}`).pipe(take(1));
  }

  getResumoPedidos(id: any, grupoEconomico: any) {
    let httpParams = new HttpParams().set('grupoEconomico', grupoEconomico);

    return this.http
      .get(`${this.API}/resumo/pedidos/${id}`, { params: httpParams })
      .pipe(take(1));
  }

  getDetalhesPedidos(id: any, grupoEconomico: any) {
    let httpParams = new HttpParams().set('grupoEconomico', grupoEconomico);

    return this.http
      .get(`${this.API}/detalhes/pedidos/${id}`, { params: httpParams })
      .pipe(take(1));
  }

  getMateriaisDuplicata(params: any) {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/materiais-duplicata`, {
        params: httpParams
      })
      .pipe(take(1));
  }

  getAcumulosMensais(id: any) {
    return this.http.get(`${this.API}/acumulos-mensais/${id}`).pipe(take(1));
  }

  getNotasPromissorias(id: any) {
    return this.http.get(`${this.API}/notas-promissorias/${id}`).pipe(take(1));
  }

  getDebitos(id: any) {
    return this.http.get(`${this.API}/debitos/${id}`).pipe(take(1));
  }

  getCorteDobra(id: any) {
    return this.http.get(`${this.API}/corte-dobra/${id}`).pipe(take(1));
  }
}
