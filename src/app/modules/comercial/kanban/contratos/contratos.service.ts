import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { take, retry } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

// Services
import { ComercialService } from 'src/app/modules/comercial/comercial.service';

// Interfaces
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialKanbanContratosService {
  private readonly API = `http://23.254.204.187/api/comercial/kanban/contratos/`;

  constructor(
    protected http: HttpClient,
    private comercialService: ComercialService,
  ) {}

  getCards(params): Observable<Object | JsonResponse> {
    let contratos = this.getContratos(params);
    let faturados = this.getFaturados(params);
    let pendentes = this.getPendentes(params);

    return forkJoin([
      contratos,
      faturados,
      pendentes

    ]).pipe(take(1));
  }

  getContratos(params: any = []): Observable<any> {

    let httpParams = new HttpParams();
    for (let param in params) {
    httpParams = httpParams.append(param, params[param]);    }
    return this.http.get(`${this.API}/contratos-vigentes`, { params: httpParams })
    .pipe(
      take(1),
      retry(2)
      );
  }

  getFaturados(params: any = []): Observable<any> {

    let httpParams = new HttpParams();
    for (let param in params) {
    httpParams = httpParams.append(param, params[param]);    }
    return this.http.get(`${this.API}/quantidade-faturada`, { params: httpParams })
    .pipe(
      take(1),
      retry(2)
      );
  }

  getPendentes(params: any = []): Observable<any> {

    let httpParams = new HttpParams();
    for (let param in params) {
    httpParams = httpParams.append(param, params[param]);    }
    return this.http.get(`${this.API}/quantidade-pendente`, { params: httpParams })
    .pipe(
      take(1),
      retry(2)
      );
  }



}
