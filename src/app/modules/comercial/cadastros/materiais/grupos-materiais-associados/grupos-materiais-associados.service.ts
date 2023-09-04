import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { take, retry } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

// Services
import { ComercialService } from '../../../comercial.service';
import { ComercialTidSoftwareService } from '../../../tid-software/tid-software.service';

// Interfaces
import { IGrupo } from './models/grupo-materiais-associados';
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialCadastrosMateriaisGrupoMateriaisAssociadosService {
  private readonly API = `http://23.254.204.187/api/comercial/cadastros/materiais/grupos-materiais-associados`;

  constructor(
    protected http: HttpClient,
    private comercialService: ComercialService,
    private tidSoftwareService: ComercialTidSoftwareService
  ) {}

  getListaGrupos(params: any): Observable<Object | JsonResponse> {
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

  private saveGrupo(record: IGrupo): Observable<Object | JsonResponse> {
    return this.http.post(`${this.API}/salvar`, record).pipe(take(1), retry(2));
  }

  private updateGrupo(record: IGrupo): Observable<Object | JsonResponse> {
    return this.http
      .put(`${this.API}/atualizar`, record)
      .pipe(take(1), retry(2));
  }

  save(record: IGrupo): Observable<Object | JsonResponse> {
    if (record.codGrupo !== null) {
      return this.updateGrupo(record);
    }

    return this.saveGrupo(record);
  }

  activateGrupo(codGrupo: number): Observable<Object | JsonResponse> {
    return this.http
      .post(`${this.API}/ativar`, codGrupo)
      .pipe(take(1), retry(2));
  }

  inactivateGrupo(codGrupo: number): Observable<Object | JsonResponse> {
    return this.http
      .post(`${this.API}/inativar`, codGrupo)
      .pipe(take(1), retry(2));
  }

  getFilterValues(): Observable<Object | JsonResponse> {
    const linhas = this.tidSoftwareService.getLinhas();
    const classes = this.comercialService.getClasses(null);

    return forkJoin([linhas, classes]);
  }

  deleteAssociacao(
    codGrupo: number,
    codMaterial: number
    ): Observable<Object | JsonResponse> {
    return this.http
      .delete(`${this.API}/remover/${codGrupo}/${codMaterial}`)
      .pipe(take(1), retry(2));
  }
}
