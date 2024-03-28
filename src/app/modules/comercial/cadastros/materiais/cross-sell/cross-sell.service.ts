import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { take, retry } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

// Services
import { ComercialService } from '../../../comercial.service';
import { ComercialTidSoftwareService } from '../../../tid-software/tid-software.service';

// Interfaces
import { ICrossSell } from './models/cross-sell';
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialCadastrosMateriaisCrossSellService {
  private readonly API = `http://23.254.204.187/api/comercial/cadastros/materiais/cross-sell`;

  constructor(
    protected http: HttpClient,
    private comercialService: ComercialService,
    private tidSoftwareService: ComercialTidSoftwareService
  ) {}

  getListaCrossSell(params: any): Observable<Object | JsonResponse> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/lista`, { params: httpParams })
      .pipe(take(1), retry(2));
  }

  getMateriais(params: any): Observable<Object | JsonResponse> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/lista-materiais`, { params: httpParams })
      .pipe(take(1), retry(2));
  }

  getAssociacoesMateriais(
    codCrossSell: number
  ): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/associacoes/${codCrossSell}`)
      .pipe(take(1), retry(2));
  }

  getDetalhes(codCrossSell: number): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/detalhes/${codCrossSell}`)
      .pipe(take(1), retry(2));
  }

  private saveCrossSell(record: ICrossSell): Observable<Object | JsonResponse> {
    return this.http.post(`${this.API}/salvar`, record).pipe(take(1), retry(2));
  }

  private updateCrossSell(
    record: ICrossSell
  ): Observable<Object | JsonResponse> {
    return this.http
      .put(`${this.API}/atualizar`, record)
      .pipe(take(1), retry(2));
  }

  save(record: ICrossSell): Observable<Object | JsonResponse> {
    if (record.codCrossSell !== null) {
      return this.updateCrossSell(record);
    }

    return this.saveCrossSell(record);
  }

  activateCrossSell(codCrossSell: number): Observable<Object | JsonResponse> {
    return this.http
      .post(`${this.API}/ativar`, codCrossSell)
      .pipe(take(1), retry(2));
  }

  inactivateCrossSell(codCrossSell: number): Observable<any> {
    return this.http.post(`${this.API}/inativar`, codCrossSell).pipe(take(1));
  }

  desassociaMaterial(
    codCrossSell: number,
    codAssociacao: number
  ): Observable<Object | JsonResponse> {
    return this.http
      .delete(`${this.API}/desassociar/${codCrossSell}/${codAssociacao}`)
      .pipe(take(1), retry(2));
  }

  getFilterValues(): Observable<Object | JsonResponse> {
    const linhas = this.tidSoftwareService.getLinhas();
    const classes = this.comercialService.getClasses(null);
    const grupos = this.comercialService.getGrupo(null);

    return forkJoin([linhas, classes, grupos]);
  }
}
