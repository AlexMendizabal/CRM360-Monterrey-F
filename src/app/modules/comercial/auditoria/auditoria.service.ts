import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { take, retry } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialAuditoriaService {
  private readonly API = `http://127.0.0.1:8000/comercial/auditoria/enderecos-entrega`;

  constructor(protected http: HttpClient) {}

  getListaEnderecosEntrega(params: any): Observable<any> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/lista`, { params: httpParams })
      .pipe(take(1));
  }

  aprovaReprovaEndereco(record: any) {
    return this.http
      .put(`${this.API}/aprova-reprova-endereco`, record)
      .pipe(take(1));
  }

  getAnexos(codEndereco: number): Observable<Object | JsonResponse> {
    return this.http.get(`${this.API}/anexos/${codEndereco}`).pipe(take(1));
  }

  getUltimaCompra(codCliente: number): Observable<any> {
    return this.http
      .get(`${this.API}/ultima-compra/${codCliente}`)
      .pipe(take(1));
  }

  getExcecao(): Observable<any> {
    return this.http.get(`${this.API}/excecoes`)
    .pipe(
      take(1),
      retry(2)
      );
  }

  getAnexosAprovacao(codEndereco: number): Observable<any> {
    return this.http
      .get(`${this.API}/anexo/documentos/${codEndereco}`)
      .pipe(take(1));
  }

  postAnexosAprovacao(params, codEndereco: number): Observable<any> {
    return this.http.post(
      `${this.API}/anexo/documentos/salvar?codEndereco=${codEndereco}`,
      params
    ).pipe(take(1));
  }

  deleteAnexoAprovacao(codAnexo: number): Observable<any> {
    let params = {
      codAnexo: codAnexo,
    };

    return this.http
      .put(`${this.API}/anexo/documentos/excluir`, params)
      .pipe(take(1));
  }

  getCliente(codCliente){
    return this.http.get(`http://23.254.204.187/comercial/clientes/detalhes/${codCliente}`).pipe(take(1));
  }
}
