import { descricaoTabela, assocTabela } from './models/tabela-precos';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { take, tap, retry } from 'rxjs/operators';

/* Services */
import { ComercialService } from '../../comercial.service';

/* Interfaces */
import { environment } from 'src/environments/environment';
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialGestaoTabelaPrecosService {
  private readonly API = `https://crm360.monterrey.com.bo/api/comercial/gestao/tabela-precos`;

  constructor(
    protected http: HttpClient,
    private comercialService: ComercialService
  ) {}

  getListaPrecos(params: any = []): Observable<any> {
    let httpParams = new HttpParams();
    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }
    return this.http
      .get(`${this.API}/lista`, { params: httpParams })
      .pipe(take(1), retry(2));
  }

  getEmpresas(): Observable<Object | JsonResponse> {
    return this.comercialService.getEmpresas({ idEmpresa: [4,6,18,55,77,79,83], tipo: 'search' });
  }

  getTabelas(): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/tabelas`)
      .pipe(take(1), retry(2));
  }

  getDetalhes(codPreco: number): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/detalhes/${codPreco}`)
      .pipe(take(1), retry(2));
  }

  // getDetailPanel(codGrupo: number): Observable<Object | JsonResponse> {
  //   return this.http
  //     .get(`${this.API}/detail-panel/${codGrupo}`)
  //     .pipe(take(1), retry(2));
  // }

  getDetailPanel(params: any = []): Observable<any> {
    let httpParams = new HttpParams();
    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }
    return this.http
      .get(`${this.API}/detail-panel`, { params: httpParams })
      .pipe(take(1), retry(2));
  }

  getGrupos(params: any = []): Observable<Object | JsonResponse> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/lista/grupos`, { params: httpParams })
      .pipe(take(1), retry(2));
  }

  getAssociacoesGrupos(
    codGrupo: number,
    params?: any
  ): Observable<Object | JsonResponse> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/lista/grupos/${codGrupo}`, { params: httpParams })
      .pipe(take(1), retry(2));
  }

  getAssociados(): Observable<any> {
    return this.http.get(`${this.API}/associados`).pipe(take(1));
  }

  deleteAssociacaoPreco(item: any): Observable<Object | JsonResponse> {
    return this.http
      .delete(
        `${this.API}/associacao-precos/remover/${item.codAssociacao}/${item.codPreco}/${item.codGrupo}`
      )
      .pipe(take(1), retry(2));
  }

  deleteAssociacaoGrupo(
    codPreco: number,
    codGrupo: number
  ): Observable<Object | JsonResponse> {
    return this.http
      .delete(`${this.API}/grupo/remover/${codGrupo}/${codPreco}`)
      .pipe(take(1), retry(2));
  }

  saveTabelaPrecos(
    record: descricaoTabela,
    action: string
  ): Observable<Object | JsonResponse> {
    if (action === 'update') {
      return this.updateGrupo(record);
    }

    return this.saveGrupo(record);
  }

  private saveGrupo(
    record: descricaoTabela
  ): Observable<Object | JsonResponse> {
    return this.http.post(`${this.API}/salvar`, record).pipe(take(1));
  }

  private updateGrupo(
    record: descricaoTabela
  ): Observable<Object | JsonResponse> {
    return this.http
      .put(`${this.API}/atualizar`, record)
      .pipe(take(1));
  }

  // savePrecos(record: any, action: string): Observable<Object | JsonResponse> {
  //   if (action === 'update') {
  //     return this.updatePreco(record);
  //   }

  //   return this.savePreco(record);

  // }

  savePreco(record: any): Observable<Object | JsonResponse> {
    return this.http
      .post(`${this.API}/precos/salvar`, record)
      .pipe(take(1), retry(2));
  }

  updatePreco(record: any): Observable<Object | JsonResponse> {
    return this.http
      .put(`${this.API}/precos/atualizar`, record)
      .pipe(take(1), retry(2));
  }

  getPreco(params: any = []) {
    let httpParams = new HttpParams();
    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }
    return this.http
      .get(`${this.API}/precos/lista`, { params: httpParams })
      .pipe(take(1), retry(2));
  }

  activateGrupo(codGrupo: number): Observable<Object | JsonResponse> {
    return this.http
      .post(`${this.API}/ativar`, codGrupo)
      .pipe(take(1), retry(2));
  }

  inactivateGrupo(codGrupo: number): Observable<Object | JsonResponse> {
    return this.http.post(`${this.API}/inativar`, codGrupo).pipe(take(1));
  }

  getMateriais(params): Observable<Object | JsonResponse> {
    return this.http.get(`${this.API}/materiais`,
    { params: params}).pipe(take(1));
  }

  getMateriaisDetalhes(params: any): Observable<Object | JsonResponse> {

    let httpParams = new HttpParams();
    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http.get(`${this.API}/materiais/detalhes`, { params: httpParams })
      .pipe(take(1), retry(2));
  }

}
