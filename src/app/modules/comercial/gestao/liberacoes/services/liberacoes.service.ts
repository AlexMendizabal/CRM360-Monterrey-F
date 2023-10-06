//angular
import { Injectable } from '@angular/core';

// services
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { IComercialGestaoLiberacoes } from '../models/liberacoes';
import { Observable } from 'rxjs';
import { retry, take } from 'rxjs/operators';
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialGestaoLiberacoesService {
  private readonly API = `http://23.254.204.187/api/comercial/gestao/liberacoes`;

  constructor(protected http: HttpClient) {}

  getSolicitacoes(params: any): Observable<any> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/lista`, { params: httpParams })
      .pipe(take(1));
  }

  getDetalhes(nrPedido: number, codEmpresa: number): Observable<any> {
    return this.http
      .get(`${this.API}/detalhes/${nrPedido}/${codEmpresa}`)
      .pipe(take(1));
  }

  postSolicitacoes(liberacao: IComercialGestaoLiberacoes) {
    return this.http.post(
      `${this.API}/comercial/gestao/liberacoes`,
      liberacao,
      {
        observe: 'response',
      }
    );
  }

  getPermissoesAcesso(): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/permissoes-acesso`)
      .pipe(take(1), retry(2));
  }

  getMotivosTrava(nrPedido: number, codEmpresa: number): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/motivos-trava/${nrPedido}/${codEmpresa}`)
      .pipe(take(1), retry(2));
  }

  aprovaLiberacao(params:any): Observable<any>{
    return this.http.post(`${this.API}/aprovacao`, params).pipe(take(1));
  }

  reprovaLiberacao(params:any): Observable<any>{
    return this.http.post(`${this.API}/reprovacao`, params).pipe(take(1));
  }


}
