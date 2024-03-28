import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { take, tap, retry } from 'rxjs/operators';

import { setRepresentantes } from './models/representantes';

import { environment } from './../../../../../environments/environment';
import { JsonResponse } from './../../../../models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialCadastrosRepresentantesService {
  private readonly API = `http://23.254.204.187/api/comercial/cadastros/representantes`;

  constructor(protected http: HttpClient) {}

  getListaRepresentantes(params: any = []): Observable<any> {
    let httpParams = new HttpParams();
    for (let param in params) {
    httpParams = httpParams.append(param, params[param]);    }
    return this.http.get(`${this.API}/lista`, { params: httpParams })
    .pipe(
      take(1),
      retry(2)
      );
  }

  private saveERP(record: any): Observable<Object | JsonResponse> {
    return this.http.post(`${this.API}/save`, record).pipe(take(1));
  }

  private updateERP(record: any): Observable<Object | JsonResponse> {
    return this.http
      .put(`${this.API}/update`, record)
      .pipe(take(1));
  }

  save(record: any, action: string): Observable<Object | JsonResponse> {
    //console.log(record)
    if (action === 'update') {
      //console.log(record)
      return this.updateERP(record);
    }

    return this.saveERP(record);

  }

  getDetalhes(codRepresentante: number): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/detalhes/${codRepresentante}`)
      .pipe(
        take(1),
        retry(2)
        );
  }

  getTipoComissionamento() {
    return this.http.get(`${this.API}/tipo-comissionamento`).pipe(take(1), retry(2));
  }

  getBancos() {
    return this.http.get(`${this.API}/bancos`).pipe(take(1), retry(2));
  }

  getTipoVendedor() {
    return this.http.get(`${this.API}/tipo-vendedor`).pipe(take(1), retry(2));
  }

  activateERP(codERP: number): Observable<Object | JsonResponse> {
    return this.http
      .post(`${this.API}/ativar`, codERP)
      .pipe(take(1), retry(2));
  }

  inactivateERP(codERP: number): Observable<Object | JsonResponse> {
    return this.http.post(`${this.API}/inativar`, codERP).pipe(take(1));
  }

  getAnexos(codRepresentante: number): Observable<any> {
    return this.http
      .get(`${this.API}/anexo/documentos/${codRepresentante}`)
      .pipe(take(1));
  }

  postAnexos(params, codRepresentante: number): Observable<any> {
    return this.http.post(
      `${this.API}/anexo/documentos/salvar?codRepresentante=${codRepresentante}`,
      params
    ).pipe(take(1));
  }

  deleteAnexo(codAnexo: number): Observable<any> {
    let params = {
      codAnexo: codAnexo,
    };

    return this.http
      .put(`${this.API}/anexo/documentos/excluir`, params)
      .pipe(take(1));
  }

}
