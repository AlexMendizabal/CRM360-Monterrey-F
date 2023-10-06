import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { take, retry } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ComercialTidSoftwareService {
  private readonly API = `http://23.254.204.187/api/comercial/tid-software`;

  constructor(protected http: HttpClient) {}

  loadDependencies() {
    let empresas = this.getEmpresas('vendas');
    let linhas = this.getLinhas();
    let modulosVendas = this.getModulosVendas();
    let modulosProducaoTela = this.getModulosProducaoTela();

    return forkJoin([
      empresas,
      linhas,
      modulosVendas,
      modulosProducaoTela
    ]).pipe(take(1), retry(2));
  }

  getEmpresas(acao: any) {
    return this.http
      .get(`${this.API}/empresas/${acao}`)
      .pipe(take(1), retry(2));
  }

  getLinhas() {
    return this.http.get(`${this.API}/linhas`).pipe(take(1), retry(2));
  }

  getModulosVendas() {
    return this.http.get(`${this.API}/modulos/vendas`).pipe(take(1), retry(2));
  }

  getModulosProducaoTela() {
    return this.http
      .get(`${this.API}/modulos/producao-tela`)
      .pipe(take(1), retry(2));
  }

  postGerarAcesso(data: any) {
    return this.http
      .post(`${this.API}/gerar-acesso`, data)
      .pipe(take(1), retry(2));
  }
}
