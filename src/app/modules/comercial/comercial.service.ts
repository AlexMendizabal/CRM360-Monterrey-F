import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { take, retry } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

// Interfaces
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialService {
  private readonly API = `http://23.254.204.187/api/comercial`;

  constructor(protected http: HttpClient) { }

  getEmpresas(params?: any): Observable<Object> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/empresas`, {
        params: httpParams,
      })
      .pipe(take(1), retry(2));
  }

  getDepositos(params: any): Observable<Object> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/depositos`, {
        params: httpParams,
      })
      .pipe(take(1), retry(2));
  }

  getAlmacen(params?: any): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/estoque`)
      .pipe(take(1), retry(2));
  }
  getLinhasId(id: any) {
    return this.http.get(`${this.API}/linhas/${id}`).pipe(take(1), retry(2));
  }

  getSublineasId(id: any) {
    return this.http.get(`${this.API}/sublineas/${id}`).pipe(take(1), retry(2));
  }

  sincronizarMateriales() {
    return this.http.get(`${this.API}/sincronizar`).pipe(take(1), retry(2));
  }
  getMateriales(params: any) {
    return this.http
      .get(
        `${this.API}/materiales`, {
        params: params,
      })
      .pipe(take(1), retry(2));
  }
  getMaterialesLista(params: any) {
    return this.http
      .get(
        `${this.API}/materiales/lista`, {
        params: params,
      })
      .pipe(take(1), retry(2));
  }
  getAlmacenesLista(params: any) {
    return this.http
      .get(
        `${this.API}/materiales/lista_almacen`, {
        params: params,
      })
      .pipe(take(1), retry(2));
  }



  getMaterialesOferta(params: any) {
    return this.http
      .get(
        `${this.API}/materiales_lista_precio`,  {
        params: params,
      })
      .pipe(take(1), retry(2));
  }
  getMaterialesOfertaVendedor(params: any) {
    return this.http
      .get(
        `${this.API}/materiales_lista_precio_vendedor`, {
        params: params,
      })
      .pipe(take(1), retry(2));
  }

  getUpSellService(params: any) {
    return this.http
      .get(
        `${this.API}/materiales_suplementarios`, {
        params: params,
      })
      .pipe(take(1), retry(2));
  }
  getLinhas(params: any): Observable<Object> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/linhas`, {
        params: httpParams,
      })
      .pipe(take(1), retry(2));
  }

  getClasses(params: any): Observable<Object> {
    let httpParams = new HttpParams();
    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/classes`, {
        params: httpParams,
      })
      .pipe(take(1), retry(2));
  }

  getGrupo(params: any){
    let httpParams = new HttpParams();
    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/grupos`, {
        params: httpParams,
      })
      .pipe(take(1), retry(2));
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

  getPerfil(): Observable<Object> {
    return this.http.get(`${this.API}/perfil`).pipe(take(1), retry(2));
  }

  getEscritorios(): Observable<Object> {
    return this.http.get(`${this.API}/escritorios`).pipe(take(1), retry(2));
  }
  getPresentacionMaterial(): Observable<Object> {
    return this.http
      .get(`${this.API}/presentacion_materiales`)
      .pipe(take(1), retry(2));
  }

  getCliente(codCliente) {
    return this.http.get(`${this.API}/clientes/detalhes/${codCliente}`).pipe(take(1));
  }

  getListarPrecios() {
    return this.http.get(`${this.API}/vendedor/lista_precio`)
      .pipe(take(1), retry(2));
  }

  getTodosVendedores() {
    return this.http.get(`${this.API}/vendedor/allvendedor`)
      .pipe(take(1), retry(2));
  }
  getCentrosLogisticos() {
    return this.http.get(`${this.API}/almacen/centros_logisticos`);
  }
}
