import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

// Interfaces
import { ITiposFrete } from './models/tipos-frete';

@Injectable({
  providedIn: 'root',
})
export class ComercialCadastrosTiposFreteService {
  private readonly API = `http://127.0.0.1:8000/comercial/cadastros/tipos-frete`;

  constructor(protected http: HttpClient) {}

  getListaTiposFrete(params?: any): Observable<any> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/lista`, { params: httpParams })
      .pipe(take(1));
  }

  getDetalhes(codigo: number): Observable<any> {
    return this.http.get(`${this.API}/detalhes/${codigo}`).pipe(take(1));
  }

  private saveTipoFrete(tipoFrete: ITiposFrete) {
    return this.http.post(`${this.API}/salvar`, tipoFrete).pipe(take(1));
  }

  private updateTipoFrete(tipoFrete: ITiposFrete) {
    return this.http.put(`${this.API}/atualizar`, tipoFrete).pipe(take(1));
  }

  save(tipoFrete: ITiposFrete): Observable<any> {
    if (tipoFrete.codigo !== null) {
      return this.updateTipoFrete(tipoFrete);
    }

    return this.saveTipoFrete(tipoFrete);
  }

  activateTipoFrete(codigo: number): Observable<any> {
    return this.http.post(`${this.API}/ativar`, codigo).pipe(take(1));
  }

  inactivateTipoFrete(codigo: number): Observable<any> {
    return this.http.post(`${this.API}/inativar`, codigo).pipe(take(1));
  }
}
