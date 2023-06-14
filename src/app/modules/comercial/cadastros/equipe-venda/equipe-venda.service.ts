import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

// Interfaces
import { EquipeVenda } from './models/equipe-venda';

@Injectable({
  providedIn: 'root'
})
export class ComercialCadastrosEquipeVendaService {
  private readonly API = `http://127.0.0.1:8000/comercial/cadastros/equipe-venda`;

  constructor(protected http: HttpClient) {}

  getListaEquipesVenda(params?: any): Observable<any> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/lista`, { params: httpParams })
      .pipe(take(1));
  }

  getAlteracoes(codEquipeVenda: number): Observable<any> {
    return this.http
      .get(`${this.API}/alteracoes/${codEquipeVenda}`)
      .pipe(take(1));
  }

  getDetalhes(codEquipeVenda: number): Observable<any> {
    return this.http
      .get(`${this.API}/detalhes/${codEquipeVenda}`)
      .pipe(take(1));
  }

  private saveEquipeVenda(equipeVenda: EquipeVenda) {
    return this.http.post(`${this.API}/salvar`, equipeVenda).pipe(take(1));
  }

  private updateEquipeVenda(equipeVenda: EquipeVenda) {
    return this.http.put(`${this.API}/atualizar`, equipeVenda).pipe(take(1));
  }

  save(equipeVenda: EquipeVenda): Observable<any> {
    if (equipeVenda.codEquipeVenda !== null) {
      return this.updateEquipeVenda(equipeVenda);
    }

    return this.saveEquipeVenda(equipeVenda);
  }

  activateEquipeVenda(codigo: number): Observable<any> {
    return this.http.post(`${this.API}/ativar`, codigo).pipe(take(1));
  }

  inactivateEquipeVenda(codigo: number): Observable<any> {
    return this.http.post(`${this.API}/inativar`, codigo).pipe(take(1));
  }

  getListaEquipesERP(): Observable<any> {
    return this.http.get(`${this.API}/erp/lista`).pipe(take(1));
  }
}
