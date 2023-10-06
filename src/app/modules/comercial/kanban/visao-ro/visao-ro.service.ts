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
export class ComercialKanbanVisaoRoService {
  private readonly API = `http://23.254.204.187/api/comercial/kanban/visao-ro`;

  constructor(
    protected http: HttpClient,
    private comercialService: ComercialService,
  ) {}

  getCards(params): Observable<Object | JsonResponse> {
    let abertas = this.getAbertas(params);
    let fechadas = this.getFechadas(params);
    return forkJoin([
      abertas,
      fechadas

    ]).pipe(take(1));
  }

  private getAbertas(params: any = []): Observable<any> {

    let httpParams = new HttpParams();
    for (let param in params) {
    httpParams = httpParams.append(param, params[param]);    }
    return this.http.get(`${this.API}/abertas`, { params: httpParams })
    .pipe(
      take(1),
      retry(2)
      );
  }

  private getFechadas(params: any = []): Observable<any> {

    let httpParams = new HttpParams();
    for (let param in params) {
    httpParams = httpParams.append(param, params[param]);    }
    return this.http.get(`${this.API}/fechadas`, { params: httpParams })
    .pipe(
      take(1),
      retry(2)
      );
  }

}
