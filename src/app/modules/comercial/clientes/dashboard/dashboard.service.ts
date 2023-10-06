import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ComercialClientesDashboardService {
  private readonly API = `http://23.254.204.187/api/comercial/clientes/dashboard`;

  constructor(protected http: HttpClient) {}

  getPermissaoAcesso(id: any) {
    return this.http.get(`${this.API}/permissao-acesso/${id}`).pipe(take(1));
  }

  getFaturamentoGrafico(id: any) {
    return this.http.get(`${this.API}/faturamento/grafico/${id}`).pipe(take(1));
  }

  getFaturamentoAnalitico(id: any) {
    return this.http
      .get(`${this.API}/faturamento/analitico/${id}`)
      .pipe(take(1));
  }

  getFaturamentoMaisComprados(id: any) {
    return this.http
      .get(`${this.API}/faturamento/mais-comprados/${id}`)
      .pipe(take(1));
  }

  getFaturamentoComparativo(id: any) {
    return this.http
      .get(`${this.API}/faturamento/comparativo/${id}`)
      .pipe(take(1));
  }

  getPropostasGrafico(id: any) {
    return this.http.get(`${this.API}/propostas/grafico/${id}`).pipe(take(1));
  }

  getPropostasAnalitico(id: any) {
    return this.http.get(`${this.API}/propostas/analitico/${id}`).pipe(take(1));
  }

  getDuplicatasAtraso(id: any) {
    return this.http.get(`${this.API}/duplicatas-atraso/${id}`).pipe(take(1));
  }

  getNotasDebito(id: any) {
    return this.http.get(`${this.API}/notas-debito/${id}`).pipe(take(1));
  }

  getCreditoDisponivel(id: any) {
    return this.http.get(`${this.API}/credito-disponivel/${id}`).pipe(take(1));
  }

  getDuplicatasVencer(id: any) {
    return this.http.get(`${this.API}/duplicatas-vencer/${id}`).pipe(take(1));
  }

  getUltimaCompra(id: any) {
    return this.http.get(`${this.API}/ultima-compra/${id}`).pipe(take(1));
  }

  getUltimosPrecos(id: any) {
    return this.http.get(`${this.API}/ultimos-precos/${id}`).pipe(take(1));
  }

  getRegistroOcorrencias(id: any) {
    return this.http
      .get(`${this.API}/registro-ocorrencias/${id}`)
      .pipe(take(1));
  }
}
