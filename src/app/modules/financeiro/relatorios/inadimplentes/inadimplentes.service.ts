import { Injectable } from '@angular/core';
import { take, retry } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';

// Interfaces
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class FinanceiroRelatoriosInadimplentesService {
  private readonly API = `http://23.254.204.187/api/financeiro/relatorios/inadimplentes`;

  constructor(protected http: HttpClient) {}

  getLista(): Observable<Object | JsonResponse> {
    return this.http.get(`${this.API}/lista`).pipe(take(1), retry(2));
  }

  getDetalheEscritorio(
    codEscritorio: number
  ): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/escritorio/${codEscritorio}`)
      .pipe(take(1), retry(2));
  }
}
