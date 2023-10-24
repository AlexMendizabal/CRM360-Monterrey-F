import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

// Interfaces
import { Transportadora } from './models/transportadora';

@Injectable({
  providedIn: 'root'
})
export class ComercialCadastrosTransportadoraService {
  private readonly API = `http://127.0.0.1:8000/comercial/cadastros/transportadora`;

  constructor(protected http: HttpClient) {}

  getListaTransportadoras(params: any): Observable<any> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/lista`, { params: httpParams })
      .pipe(take(1));
  }

  getTransportadora(id: number): Observable<any> {
    return this.http.get(`${this.API}/editar/${id}`).pipe(take(1));
  }

  postTransportadora(record: any): Observable<any> {
    return this.http.post(`${this.API}/salvar`, record).pipe(take(1));
  }

  deleteTransportadora(transportadora: Transportadora): Observable<any> {
    return this.http
      .delete(`${this.API}/excluir/${transportadora.codTransportadoraTid}`)
      .pipe(take(1));
  }

  deleteContato(codTransportdora: number, id: number): Observable<any> {
    return this.http
      .delete(`${this.API}/contato/excluir/${codTransportdora}/${id}`)
      .pipe(take(1));
  }
}
