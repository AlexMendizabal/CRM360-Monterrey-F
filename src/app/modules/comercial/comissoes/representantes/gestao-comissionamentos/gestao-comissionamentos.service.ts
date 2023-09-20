import { descricaoTabela, assocTabela } from './models/tabela-precos';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { take, tap, retry } from 'rxjs/operators';
import { JsonResponse } from './../../../../../models/json-response';
import { environment } from './../../../../../../environments/environment';



@Injectable({
  providedIn: 'root',
})
export class ComercialComissoesGestaoComissionamentosService {
  private readonly API = `http://23.254.204.187/api/comercial/comissoes/representantes/gestao-comissionamentos`;

  constructor(protected http: HttpClient) {}

  getComissionamentos(params: any = []): Observable<any> {

    let httpParams = new HttpParams();
    for (let param in params) {
    httpParams = httpParams.append(param, params[param]);    }
    return this.http.get(`${this.API}/lista`, { params: httpParams })
    .pipe(
      take(1),
      retry(2)
      );
  }

  getListaComissoes(params: any = []): Observable<any> {

    let httpParams = new HttpParams();
    for (let param in params) {
    httpParams = httpParams.append(param, params[param]);    }
    return this.http.get(`${this.API}/lista`, { params: httpParams })
    .pipe(
      take(1),
      retry(2)
      );
  }

  getListaEdicaoComissoes(params: any = []): Observable<any> {

    let httpParams = new HttpParams();
    for (let param in params) {
    httpParams = httpParams.append(param, params[param]);    }
    return this.http.get(`${this.API}/lista-edicao`, { params: httpParams })
    .pipe(
      take(1),
      retry(2)
      );
  }

  getDetalhesRepresentante(params): Observable<any> {
    let httpParams = new HttpParams();
    for (let param in params) {
    httpParams = httpParams.append(param, params[param]);    }
    return this.http.get(`${this.API}/representantes-detalhes`, { params: httpParams })
    .pipe(
      take(1),
      retry(2)
      );
  }

  getDetalhesUnidades(params): Observable<any> {
    let httpParams = new HttpParams();
    for (let param in params) {
    httpParams = httpParams.append(param, params[param]);    }
    return this.http.get(`${this.API}/unidades-detalhes`, { params: httpParams })
    .pipe(
      take(1),
      retry(2)
      );
  }

  // getDetalhesRepresentante(params): Observable<any> {
  //   return this.http.get(`${this.API}/comissoes-detalhes/${codGestao}/${codComissao}`)
  //   .pipe(
  //     take(1),
  //     retry(2)
  //     );
  // }

  getFormComissoes(params): Observable<any> {
    let httpParams = new HttpParams();
    for (let param in params) {
    httpParams = httpParams.append(param, params[param]);    }
    return this.http.get(`${this.API}/dados-comissoes`, { params: httpParams })
    .pipe(
      take(1),
      retry(2)
      );
  }

  getHistorico(codComissaoRepresentante): Observable<any> {
    return this.http.get(`${this.API}/historico/${codComissaoRepresentante}`)
    .pipe(
      take(1),
      retry(2)
      );
  }

  getModelo(codGestao): Observable<any> {
    return this.http.get(`${this.API}/modelos/${codGestao}`)
    .pipe(
      take(1),
      retry(2)
      );
  }

  getSituacao(): Observable<any> {
    return this.http.get(`${this.API}/situacao`)
    .pipe(
      take(1),
      retry(2)
      );
  }

  // getFilterValues(): Observable<Object | JsonResponse> {
  //   let escritorios = this.getEscritorios();
  //   let representantes = this.getRepresentantes();

  //   return forkJoin([
  //     escritorios,
  //     representantes,
  //   ]).pipe(take(1));
  // }

  getRepresentantes(codEscritorio): Observable<any> {
  return this.http.get(`${this.API}/representantes/${codEscritorio}`)
  .pipe(
    take(1),
    retry(2)
    );
  }

  getEscritorios(): Observable<any> {
    return this.http.get(`${this.API}/escritorios`)
    .pipe(
      take(1),
      retry(2)
      );
  }

  getDetalhes(idAnoMes): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/detalhes/${idAnoMes}`)
      .pipe(
        take(1),
        retry(2)
        );
  }

  getPermissoesAcesso(): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/permissoes-acesso`)
      .pipe(take(1), retry(2));
  }

  saveComissao(record: any, action?): Observable<Object | JsonResponse> {
    return this.http.post(`${this.API}/salvar`, record).pipe(take(1));
  }

  updateComissao(record: any, action?): Observable<Object | JsonResponse> {
    return this.http.put(`${this.API}/atualizar`, record).pipe(take(1));
  }

  // getSolicitaNfEscritorio(){
  //   return this.http.get(`${this.API}/solicitar-nf-escritorio`).pipe(take(1));
  // }

  getSolicitaNfRepresentante(params: any): Observable<Object | JsonResponse> {
    return this.http
      .post(`${this.API}/solicitar-nf-representante`, params)
      .pipe(take(1), retry(2));
  }

  postValores(params: any): Observable<Object | JsonResponse> {
    return this.http
      .post(`${this.API}/salvar-valores`, params)
      .pipe(take(1));
  }


   postAprovar(params: any): Observable<Object | JsonResponse> {
    return this.http
      .post(`${this.API}/aprovar`, params)
      .pipe(take(1));
  }

  postReprovar(params: any): Observable<Object | JsonResponse> {
    return this.http
      .post(`${this.API}/reprovar`, params)
      .pipe(take(1));
  }

  getAnexos(codComissao: number): Observable<any> {
    return this.http
      .get(`${this.API}/anexo/documentos/${codComissao}`)
      .pipe(take(1));
  }

  postAnexos(params, codComissaoRepresentante: number): Observable<any> {
    return this.http.post(
      `${this.API}/anexo/documentos/salvar?codComissaoRepresentante=${codComissaoRepresentante}`,
      params
    );
  }

  deleteAnexo(codAnexo: number): Observable<any> {
    let params = {
      codAnexo: codAnexo,
    };

    return this.http
      .put(`${this.API}/anexo/documentos/excluir`, params)
      .pipe(take(1));
  }

}
