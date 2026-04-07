import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { take, retry } from 'rxjs/operators';
// Interfaces
import { JsonResponse } from 'src/app/models/json-response';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OfertasService {

  private readonly API = `${environment.API}/comercial/ciclo-vendas/cotacoes`;
  constructor(
    protected http: HttpClient,
  ) { }

  getListaOfertas(params: any): Observable<Object | JsonResponse> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }
    return this.http
      .get(`${this.API}/lista`, { params: httpParams })
      .pipe(take(1), retry(2));
  }

  getCotacao(
    codCotacao: number,
    idEmpresa: number
  ): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/${codCotacao}/${idEmpresa}`)
      .pipe(take(1), retry(2));
  }
  getPermissoesAcesso(): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/permissoes-acesso`)
      .pipe(take(1), retry(2));
  }

  deleteMaterialCotacao(params: any): Observable<Object | JsonResponse> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .delete(`${this.API}/materiais/excluir`, { params: httpParams })
      .pipe(take(1), retry(2));
  }

}
