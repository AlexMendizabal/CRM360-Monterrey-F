import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { take, retry } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialGestaoContratosComerciaisService {
  private readonly API = `https://crm360.monterrey.com.bo/api/comercial/gestao/contratos-comerciais`;

  constructor(protected http: HttpClient) {}

  getListaContratos(params: any): Observable<any> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/lista`, { params: httpParams })
      .pipe(take(1));
  }

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

   getDetailPanel(codContrato: number): Observable<Object | JsonResponse> {
    return this.http.get(`${this.API}/detail-panel/${codContrato}`).pipe(take(1));
  }

  getDetalhes(codContrato: number): Observable<Object | JsonResponse> {
    return this.http.get(`${this.API}/detalhes/${codContrato}`).pipe(take(1));
  }

  aprovaReprovaEndereco(record: any) {
    return this.http
      .put(`${this.API}/aprova-reprova-endereco`, record)
      .pipe(take(1));
  }

  getUltimaCompra(codCliente: number): Observable<any> {
    return this.http
      .get(`${this.API}/ultima-compra/${codCliente}`)
      .pipe(take(1));
  }

  private saveContrato(record: any): Observable<Object | JsonResponse> {
    return this.http.post(`${this.API}/save`, record).pipe(take(1));
  }

  private updateContrato(record: any): Observable<Object | JsonResponse> {
    return this.http
      .put(`${this.API}/atualizar`, record)
      .pipe(take(1));
  }

  save(record: any, action: string): Observable<Object | JsonResponse> {

    if (action === 'update') {

      return this.updateContrato(record);
    }

    return this.saveContrato(record);

  }

  getSituacao(): Observable<any> {
    return this.http
      .get(`${this.API}/situacao`)
      .pipe(take(1));
  }

  getTiposFrete(): Observable<any> {
    return this.http
      .get(`${this.API}/tipos-frete`)
      .pipe(take(1));
  }

  getTipoServico(): Observable<any> {
    return this.http
      .get(`${this.API}/tipo-servico`)
      .pipe(take(1));
  }

  postAprovacao(params: any): Observable<Object | JsonResponse> {
    return this.http
      .post(`${this.API}/aprovar`, params)
      .pipe(take(1), retry(2));
  }

  postReprovacao(params: any): Observable<Object | JsonResponse> {
    return this.http
      .post(`${this.API}/reprovar`, params)
      .pipe(take(1), retry(2));
  }

  getAnexos(codContrato: number): Observable<any> {
    return this.http
      .get(`${this.API}/anexo/documentos/${codContrato}`)
      .pipe(take(1));
  }

  postAnexos(params, codContrato: number): Observable<any> {
    return this.http.post(
      `${this.API}/anexo/documentos/salvar?codContrato=${codContrato}`,
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

  getMateriais(params: any = []): Observable<Object | JsonResponse> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/materiais`, { params: httpParams })
      .pipe(take(1), retry(2));
  }
}
