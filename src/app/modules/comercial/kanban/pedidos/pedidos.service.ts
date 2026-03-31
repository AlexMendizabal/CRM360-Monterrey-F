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
export class ComercialKanbanPedidosService {
  private readonly API = `https://crm360.monterrey.com.bo/api/comercial/kanban/pedidos`;

  constructor(
    protected http: HttpClient,
    private comercialService: ComercialService,
  ) {}

  getListaKanban(params: any = []): Observable<any> {
    let httpParams = new HttpParams();
    for (let param in params) {
    httpParams = httpParams.append(param, params[param]);    }
    return this.http.get(`${this.API}/lista`, { params: httpParams })
    .pipe(
      take(1),
      retry(2)
      );
  }

  getCards(params): Observable<Object | JsonResponse> {
    let emAberto = this.getAberto(params);
    let transferidos = this.getTransferidos(params);
    let emLiberacao = this.getEmLiberacao(params);
    let aguardandoFaturamento = this.getAguardandoFaturamento(params);
    let aguardandoEntrega = this.getAguardandoEntrega(params);

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
    return this.http.get(`${this.API}/aberto`, { params: httpParams })
    .pipe(
      take(1),
      retry(2)
      );
  }

  getTransferidos(params: any = []): Observable<any> {

    let httpParams = new HttpParams();
    for (let param in params) {
    httpParams = httpParams.append(param, params[param]);    }
    return this.http.get(`${this.API}/transferidos`, { params: httpParams })
    .pipe(
      take(1),
      retry(2)
      );
  }

  getAguardandoFaturamento(params: any = []): Observable<any> {

    let httpParams = new HttpParams();
    for (let param in params) {
    httpParams = httpParams.append(param, params[param]);    }
    return this.http.get(`${this.API}/aguardando-faturamento`, { params: httpParams })
    .pipe(
      take(1),
      retry(2)
      );
  }

  getEmLiberacao(params: any = []): Observable<any> {

    let httpParams = new HttpParams();
    for (let param in params) {
    httpParams = httpParams.append(param, params[param]);    }
    return this.http.get(`${this.API}/em-liberacao`, { params: httpParams })
    .pipe(
      take(1),
      retry(2)
      );
  }

  getAguardandoEntrega(params: any = []): Observable<any> {

    let httpParams = new HttpParams();
    for (let param in params) {
    httpParams = httpParams.append(param, params[param]);    }
    return this.http.get(`${this.API}/aguardando-entrega`, { params: httpParams })
    .pipe(
      take(1),
      retry(2)
      );
  }

}
