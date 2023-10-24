import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { take } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GenericService {
  private readonly API = `http://127.0.0.1:8000/common`;

  constructor(protected http: HttpClient) {}

  getEscritorios() {
    return this.http.get(`${this.API}/escritorios`).pipe(take(1));
  }

  getLinhas() {
    return this.http.get(`${this.API}/linhas`).pipe(take(1));
  }

  getEmpresas() {
    return this.http.get(`${this.API}/empresas`).pipe(take(1));
  }

  getDepositos(idEmpresa: number) {
    return this.http.get(`${this.API}/depositos/${idEmpresa}`);
  }

  getClasses(linha: any) {
    return this.http.get(`${this.API}/classes/${linha}`).pipe(take(1));
  }

  getMateriais(params: any = []) {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/materiais`, { params: httpParams })
      .pipe(take(1));
  }

  getSituacoes() {
    return this.http.get(`${this.API}/situacoes`).pipe(take(1));
  }

  getFiltros() {
    let materiais = this.getMateriais();
    let linhas = this.getLinhas();
    let empresas = this.getEmpresas();

    return forkJoin([materiais, linhas, empresas]).pipe(take(1));
  }
}
