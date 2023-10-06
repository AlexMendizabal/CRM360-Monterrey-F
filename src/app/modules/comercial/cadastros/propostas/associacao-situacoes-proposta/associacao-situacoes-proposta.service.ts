import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { take, retry } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

// Services
import { ComercialService } from '../../../comercial.service';
import { ComercialTidSoftwareService } from '../../../tid-software/tid-software.service';

// Interfaces
import { IAssociacao } from './models/associacao-situacoes-proposta';
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialCadastrosPropostasAssociacaoSituacoesPropostaService {
  private readonly API = `http://23.254.204.187/api/comercial/cadastros/propostas/associacao-situacoes-proposta`;

  constructor(
    protected http: HttpClient,
    private comercialService: ComercialService,
    private tidSoftwareService: ComercialTidSoftwareService
  ) {}

  getListaAssociacoes(params: any): Observable<Object | JsonResponse> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/lista`, { params: httpParams })
      .pipe(take(1), retry(2));
  }

  getAssociacoesSituacoesProposta(
    codAssociacao: number
  ): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/associacoes/${codAssociacao}`)
      .pipe(take(1), retry(2));
  }

  getDetalhes(codAssociacao: number): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/detalhes/${codAssociacao}`)
      .pipe(take(1), retry(2));
  }

  private saveAssociacao(
    record: IAssociacao
  ): Observable<Object | JsonResponse> {
    return this.http.post(`${this.API}/salvar`, record).pipe(take(1), retry(2));
  }

  private updateAssociacao(
    record: IAssociacao
  ): Observable<Object | JsonResponse> {
    return this.http
      .put(`${this.API}/atualizar`, record)
      .pipe(take(1), retry(2));
  }

  save(record: IAssociacao): Observable<Object | JsonResponse> {
    if (record.codAssociacao !== null) {
      return this.updateAssociacao(record);
    }

    return this.saveAssociacao(record);
  }

  activateAssociacao(codAssociacao: number): Observable<Object | JsonResponse> {
    return this.http
      .post(`${this.API}/ativar`, codAssociacao)
      .pipe(take(1), retry(2));
  }

  inactivateAssociacao(
    codAssociacao: number
  ): Observable<Object | JsonResponse> {
    return this.http
      .post(`${this.API}/inativar`, codAssociacao)
      .pipe(take(1), retry(2));
  }
}
