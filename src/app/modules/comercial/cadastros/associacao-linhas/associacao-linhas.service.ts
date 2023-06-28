import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { take, retry } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

// Services
import { ComercialService } from '../../comercial.service';
import { ComercialTidSoftwareService } from '../../tid-software/tid-software.service';

// Interfaces
import { ILinha } from './models/associacao-linhas';
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialCadastrosAssociacaoLinhasService {
  private readonly API = `http://127.0.0.1:8000/comercial/emailMarketing/associacao`;

  constructor(
    protected http: HttpClient,
    private comercialService: ComercialService,
    private tidSoftwareService: ComercialTidSoftwareService
  ) {}

  getListaLinhas(params: any): Observable<Object | JsonResponse> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/linhas`, { params: httpParams })
      .pipe(take(1), retry(2));
  }

  getAssociacoesSetores(params?) {
    return this.http.get(`${this.API}/lista-associacoes`, {
      params: params,
      observe: 'response',
    });
  }

  getLinhas(params?) {
    return this.http.get(`${this.API}/linhas`, {
      params: params,
      observe: 'response',
    });
  }
  getSetoresFilter(params?) {
    return this.http.get(`${this.API}/setor-atividade`, {
      params: params,
      observe: 'response',
    });
  }

  getDetalhes(params?): Observable<Object | JsonResponse> {
    return this.http.get(`${this.API}/lista-associacoes`, {
      params: params,
      observe: 'response',
    });
  }

  private saveLinha(record: ILinha): Observable<Object | JsonResponse> {
    return this.http
      .post(`${this.API}/lista-associacoes`, record)
      .pipe(take(1), retry(2));
  }


  save(record: ILinha): Observable<Object | JsonResponse> {
    return this.saveLinha(record);
  }

  getSetores(params: any = []): Observable<Object | JsonResponse> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/setor-atividade`, { params: httpParams })
      .pipe(take(1), retry(2));
  }
}
