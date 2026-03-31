import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { take, retry } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

// Services
import { ComercialService } from '../comercial.service';

// Interfaces
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialComissoesService {
  private readonly API = `https://crm360.monterrey.com.bo/api/comercial/kanban`;

  constructor(
    protected http: HttpClient,
    private comercialService: ComercialService,
  ) {}

  getCards(params): Observable<Object | JsonResponse> {
    let emAberto = this.getAberto(params);
    let transferidos = this.getTransferidos(params);
    let emLiberacao = this.getLiberacao(params);
    let aguardandoFaturamento = this.getFaturamento(params);
    let aguardandoEntrega = this.getEntrega(params);

    return forkJoin([
      emAberto,
      transferidos,
      emLiberacao,
      aguardandoFaturamento,
      aguardandoEntrega
    ]).pipe(take(1));
  }

  getAberto(params: any = []): Observable<any> {

    let httpParams = new HttpParams();
    for (let param in params) {
    httpParams = httpParams.append(param, params[param]);    }
    return this.http.get(`${this.API}/lista/aberto`, { params: httpParams })
    .pipe(
      take(1),
      retry(2)
      );
  }

  getTransferidos(params: any = []): Observable<any> {

    let httpParams = new HttpParams();
    for (let param in params) {
    httpParams = httpParams.append(param, params[param]);    }
    return this.http.get(`${this.API}/lista/transferidos`, { params: httpParams })
    .pipe(
      take(1),
      retry(2)
      );
  }

  getLiberacao(params: any = []): Observable<any> {

    let httpParams = new HttpParams();
    for (let param in params) {
    httpParams = httpParams.append(param, params[param]);    }
    return this.http.get(`${this.API}/lista/liberacao`, { params: httpParams })
    .pipe(
      take(1),
      retry(2)
      );
  }

  getFaturamento(params: any = []): Observable<any> {

    let httpParams = new HttpParams();
    for (let param in params) {
    httpParams = httpParams.append(param, params[param]);    }
    return this.http.get(`${this.API}/lista/faturamento`, { params: httpParams })
    .pipe(
      take(1),
      retry(2)
      );
  }

  getEntrega(params: any = []): Observable<any> {

    let httpParams = new HttpParams();
    for (let param in params) {
    httpParams = httpParams.append(param, params[param]);    }
    return this.http.get(`${this.API}/lista/entrega`, { params: httpParams })
    .pipe(
      take(1),
      retry(2)
      );
  }

}
