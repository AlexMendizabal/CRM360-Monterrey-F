import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { take, retry } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

// Services
import { ComercialService } from '../../../comercial.service';
import { ComercialTidSoftwareService } from '../../../tid-software/tid-software.service';

// Interfaces
import { ICombo } from './models/combo';
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialCadastrosMateriaisComboService {
  private readonly API = `http://127.0.0.1:8000/comercial/cadastros/materiais/combos`;

  constructor(
    protected http: HttpClient,
    private comercialService: ComercialService,
    private tidSoftwareService: ComercialTidSoftwareService
  ) {}

  getListaCombos(params: any): Observable<Object | JsonResponse> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/lista`, { params: httpParams })
      .pipe(take(1), retry(2));
  }

  getAssociacoesMateriais(
    codMaterial: number,
    params?: any
  ): Observable<Object | JsonResponse> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/associacoes/${codMaterial}`, { params: httpParams })
      .pipe(take(1), retry(2));
  }

  getDetalhes(codMaterial: number): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/detalhes/${codMaterial}`)
      .pipe(take(1), retry(2));
  }

  private saveCombo(record: ICombo): Observable<Object | JsonResponse> {
    return this.http.post(`${this.API}/salvar`, record).pipe(take(1), retry(2));
  }

  private updateCombo(record: ICombo): Observable<Object | JsonResponse> {
    return this.http
      .put(`${this.API}/atualizar`, record)
      .pipe(take(1), retry(2));
  }

  save(record: ICombo, action: string): Observable<Object | JsonResponse> {
    if (action === 'update') {
      return this.updateCombo(record);
    }

    return this.saveCombo(record);
  }

  deleteAssociacao(
    codCombo: number,
    codAssociacao: number
  ): Observable<Object | JsonResponse> {
    return this.http
      .delete(`${this.API}/associacao/remover/${codCombo}/${codAssociacao}`)
      .pipe(take(1), retry(2));
  }

  activateCombo(codCombo: number): Observable<Object | JsonResponse> {
    return this.http
      .post(`${this.API}/ativar`, codCombo)
      .pipe(take(1), retry(2));
  }

  inactivateCombo(codCombo: number): Observable<Object | JsonResponse> {
    return this.http.post(`${this.API}/inativar`, codCombo).pipe(take(1));
  }

  getFilterValues(): Observable<Object | JsonResponse> {
    const linhas = this.tidSoftwareService.getLinhas();
    const classes = this.comercialService.getClasses(null);

    return forkJoin([linhas, classes]);
  }
}
