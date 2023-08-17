import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { take, retry } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

// Services
import { ComercialService } from '../../../comercial.service';
import { ComercialTidSoftwareService } from '../../../tid-software/tid-software.service';

// Interfaces
import { IContrato } from './models/contrato';
import { JsonResponse } from 'src/app/models/json-response';
import { constants } from 'crypto';

@Injectable({
  providedIn: 'root',
})
export class ComercialCadastrosMateriaisContratoService {
  private readonly API = `http://23.254.204.187/api/comercial/cadastros/materiais/contratos`;

  constructor(
    protected http: HttpClient,
    private comercialService: ComercialService,
    private tidSoftwareService: ComercialTidSoftwareService
  ) {}

  getListaContratos(params: any): Observable<Object | JsonResponse> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/lista`, { params: httpParams })
      .pipe(take(1), retry(2));
  }

  getAssociacoesMateriais(
    codContrato: number,
    params?: any
  ): Observable<Object | JsonResponse> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/associacoes/${codContrato}`, { params: httpParams })
      .pipe(take(1), retry(2));
  }

  getDetalhes(codContrato: number): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/detalhes/${codContrato}`)
      .pipe(take(1), retry(2));
  }

  private saveContrato(record: IContrato): Observable<Object | JsonResponse> {
    return this.http.post(`${this.API}/salvar`, record).pipe(take(1), retry(2));
  }

  private updateContrato(record: IContrato): Observable<Object | JsonResponse> {
    return this.http
      .put(`${this.API}/atualizar`, record)
      .pipe(take(1), retry(2));
  }

  save(record: IContrato, action: string): Observable<Object | JsonResponse> {
    if (action === 'update') {
      return this.updateContrato(record);
    }

    return this.saveContrato(record);
  }

  deleteAssociacao(
    codContrato: number,
    codAssociacao: number
  ): Observable<Object | JsonResponse> {
    return this.http
      .delete(`${this.API}/associacao/remover/${codContrato}/${codAssociacao}`)
      .pipe(take(1), retry(2));
  }

  activateContrato(codContrato: number): Observable<Object | JsonResponse> {
    return this.http
      .post(`${this.API}/ativar`, codContrato)
      .pipe(take(1), retry(2));
  }

  inactivateContrato(codContrato: number): Observable<Object | JsonResponse> {
    return this.http.post(`${this.API}/inativar`, codContrato).pipe(take(1));
  }

  getFilterValues(): Observable<Object | JsonResponse> {
    const linhas = this.tidSoftwareService.getLinhas();
    const classes = this.comercialService.getClasses(null);
    return forkJoin([linhas, classes]);
  }
}
