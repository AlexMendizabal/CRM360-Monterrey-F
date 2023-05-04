import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { take, retry } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

// Services
import { ComercialService } from '../../../comercial.service';
import { ComercialTidSoftwareService } from '../../../tid-software/tid-software.service';

// Interfaces
import { ISimilaridade } from './models/similaridade';
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialCadastrosMateriaisSimilaridadeService {
  private readonly API = `https://crm360.monterrey.com.bo/api/comercial/cadastros/materiais/similaridade`;

  constructor(
    protected http: HttpClient,
    private comercialService: ComercialService,
    private tidSoftwareService: ComercialTidSoftwareService
  ) {}

  getListaSimilaridades(params: any): Observable<Object | JsonResponse> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/lista`, { params: httpParams })
      .pipe(take(1), retry(2));
  }

  getAssociacoesMateriais(codGrupo: number): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/associacoes/${codGrupo}`)
      .pipe(take(1), retry(2));
  }

  getDetalhes(codGrupo: number): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/detalhes/${codGrupo}`)
      .pipe(take(1), retry(2));
  }

  private saveSimilaridade(
    record: ISimilaridade
  ): Observable<Object | JsonResponse> {
    return this.http.post(`${this.API}/salvar`, record).pipe(take(1), retry(2));
  }

  private updateSimilaridade(
    record: ISimilaridade
  ): Observable<Object | JsonResponse> {
    return this.http
      .put(`${this.API}/atualizar`, record)
      .pipe(take(1), retry(2));
  }

  save(record: ISimilaridade): Observable<Object | JsonResponse> {
    if (record.codSimilaridade !== null) {
      return this.updateSimilaridade(record);
    }

    return this.saveSimilaridade(record);
  }

  activateSimilaridade(
    codSimilaridade: number
  ): Observable<Object | JsonResponse> {
    return this.http
      .post(`${this.API}/ativar`, codSimilaridade)
      .pipe(take(1), retry(2));
  }

  inactivateSimilaridade(
    codSimilaridade: number
  ): Observable<Object | JsonResponse> {
    return this.http
      .post(`${this.API}/inativar`, codSimilaridade)
      .pipe(take(1), retry(2));
  }

  getFilterValues(): Observable<Object | JsonResponse> {
    const linhas = this.tidSoftwareService.getLinhas();
    const classes = this.comercialService.getClasses(null);

    return forkJoin([linhas, classes]);
  }
}
