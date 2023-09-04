import { ComercialGestaoAssociacioesCoordenadoresEscritoriosModule } from './../../comercial/gestao/associacoes/coordenadores-escritorios/coordenadores-escritorios.module';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { take } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

// Services
import { GenericService } from 'src/app/shared/services/requests/generic.service';

// Interfaces
import { ControleLinha } from './models/controle-linha';

@Injectable({
  providedIn: 'root'
})
export class TecnologiaInformacaoControleLinhaService {
  private readonly API = `http://23.254.204.187/api/tecnologia-informacao/controle-linhas`;

  constructor(
    protected http: HttpClient,
    private genericService: GenericService
  ) {}

  getFormFields(): Observable<any> {
    const empresas = this.genericService.getEmpresas();
    const escritorios = this.genericService.getEscritorios();

    return forkJoin([empresas, escritorios]).pipe(take(1));
  }

  getListaLinhas(params: any): Observable<any> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/lista`, { params: httpParams })
      .pipe(take(1));
  }

  getDetalhes(codLinha: number): Observable<any> {
    return this.http.get(`${this.API}/detalhes/${codLinha}`).pipe(take(1));
  }

  private saveLinha(controleLinha: ControleLinha) {
    return this.http.post(`${this.API}/salvar`, controleLinha).pipe(take(1));
  }

  private updateLinha(controleLinha: ControleLinha) {
    return this.http.put(`${this.API}/atualizar`, controleLinha).pipe(take(1));
  }
  getContadores() {
    return this.http.get(`${this.API}/contadores`).pipe(take(1));
  }
  getStatus() {
    return this.http.get(`${this.API}/pesquisa/status`).pipe(take(1));
  }
  save(controleLinha: ControleLinha): Observable<any> {
    if (controleLinha.codLinha !== null) {
      return this.updateLinha(controleLinha);
    }

    return this.saveLinha(controleLinha);
  }
  postDocument(document, codLinha) {
    return this.http.post(
      `${this.API}/documento?codLinha=${codLinha}`,
      document
    );
  }

  getTermos(matricula: number): Observable<any> {
    return this.http.get(`${this.API}/termo/${matricula}`).pipe(take(1));
  }

  getFuncionariosSituacoes() {
    return this.http.get(`${this.API}/funcionarios/situacoes`).pipe(take(1));
  }
  deleteLinha(codLinha: number): Observable<any> {
    return this.http.delete(`${this.API}/excluir/${codLinha}`).pipe(take(1));
  }

  getDocumentos(params) {
    return this.http.get(`${this.API}/documentos`, {
      params: params,
      observe: 'response'
    });
  }

  putDocumento(params) {
    return this.http.put(`${this.API}/documento`, params, {
      observe: 'response'
    });
  }
}
