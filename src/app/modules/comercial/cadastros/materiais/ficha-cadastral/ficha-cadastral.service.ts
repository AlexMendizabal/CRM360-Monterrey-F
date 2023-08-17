import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { take } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

// Interfaces
import { FichaCadastral } from './models/ficha-cadastral';
import { JsonResponse } from 'src/app/models/json-response';

// Services
import { ComercialService } from '../../../comercial.service';
import { ComercialTidSoftwareService } from '../../../tid-software/tid-software.service';

@Injectable({
  providedIn: 'root',
})
export class ComercialCadastrosMateriaisFichaCadastralService {
  private readonly API = `http://23.254.204.187/api/comercial/cadastros/materiais/ficha-cadastral`;

  constructor(
    protected http: HttpClient,
    private comercialService: ComercialService,
    private tidSoftwareService: ComercialTidSoftwareService
  ) {}

  getListaFichaCadastral(params: any): Observable<any> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/lista`, { params: httpParams })
      .pipe(take(1));
  }

  getAlteracoes(codFichaCadastral: number): Observable<any> {
    return this.http
      .get(`${this.API}/alteracoes/${codFichaCadastral}`)
      .pipe(take(1));
  }

  getDetalhes(codMaterial: number): Observable<any> {
    return this.http.get(`${this.API}/detalhes/${codMaterial}`).pipe(take(1));
  }

  private saveFichaCadastral(fichaCadastral: FichaCadastral) {
    return this.http.post(`${this.API}/salvar`, fichaCadastral).pipe(take(1));
  }

  private updateFichaCadastral(fichaCadastral: FichaCadastral) {
    return this.http.put(`${this.API}/atualizar`, fichaCadastral).pipe(take(1));
  }

  save(fichaCadastral: FichaCadastral): Observable<any> {
    if (fichaCadastral.codFichaCadastral !== null) {
      return this.updateFichaCadastral(fichaCadastral);
    }

    return this.saveFichaCadastral(fichaCadastral);
  }

  activateFichaCadastral(codigo: number): Observable<any> {
    return this.http.post(`${this.API}/ativar`, codigo).pipe(take(1));
  }

  inactivateFichaCadastral(codigo: number): Observable<any> {
    return this.http.post(`${this.API}/inativar`, codigo).pipe(take(1));
  }

  getAnexos(codMaterial: number): Observable<any> {
    return this.http.get(`${this.API}/documentos/${codMaterial}`).pipe(take(1));
  }

  postAnexos(
    params,
    codMaterial: number,
    codFichaCadastral: number
  ): Observable<any> {
    return this.http.post(
      `${this.API}/anexos/salvar?codMaterial=${codMaterial}&codFichaCadastral=${codFichaCadastral}`,
      params
    );
  }

  deleteAnexo(codAnexo: number): Observable<any> {
    let params = {
      codAnexo: codAnexo,
    };

    return this.http.put(`${this.API}/anexos/excluir`, params).pipe(take(1));
  }

  getFilterValues(): Observable<Object | JsonResponse> {
    const linhas = this.tidSoftwareService.getLinhas();
    const classes = this.comercialService.getClasses(null);

    return forkJoin([linhas, classes]);
  }
}
