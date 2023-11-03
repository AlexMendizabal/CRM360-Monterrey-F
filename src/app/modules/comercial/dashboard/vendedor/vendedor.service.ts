import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ComercialDashboardVendedorService {
  private readonly API = `http://23.254.204.187/api/comercial/dashboard/vendedor`;

  constructor(protected http: HttpClient) {}

  getDesempenhoToneladas(escritorio: number, vendedor: number) {
    return this.http
      .get(`${this.API}/desempenho/toneladas/${escritorio}/${vendedor}`)
      .pipe(take(1));
  }

  getDesempenhoLinhas(escritorio: number, vendedor: number) {
    return this.http
      .get(`${this.API}/desempenho/linhas/${escritorio}/${vendedor}`)
      .pipe(take(1));
  }

  getConcentracaoVendas(vendedor: number) {
    return this.http
      .get(`${this.API}/concentracao-vendas/${vendedor}`)
      .pipe(take(1));
  }

  getMetas(escritorio: number, vendedor: number) {
    return this.http
      .get(`${this.API}/metas/${escritorio}/${vendedor}`)
      .pipe(take(1));
  }

  getClientes(escritorio: number, vendedor: number) {
    return this.http
      .get(`${this.API}/carteira-clientes/${escritorio}/${vendedor}`)
      .pipe(take(1));
  }

  getRegistroOcorrencias(escritorio: number, vendedor: number) {
    return this.http
      .get(`${this.API}/registro-ocorrencias/${escritorio}/${vendedor}`)
      .pipe(take(1));
  }

  getFinanceiroInadimplentes(escritorio: number, vendedor: number) {
    return this.http
      .get(`${this.API}/financeiro/inadimplentes/${escritorio}/${vendedor}`)
      .pipe(take(1));
  }

  getValorRepresentante(vendedor: number) {
    return this.http
      .get(`${this.API}/financeiro/representantes/${vendedor}`)
      .pipe(take(1));
  }

  getFinanceiroNotasDebito(escritorio: number, vendedor: number) {
    return this.http
      .get(`${this.API}/financeiro/notas-debito/${escritorio}/${vendedor}`)
      .pipe(take(1));
  }
}
