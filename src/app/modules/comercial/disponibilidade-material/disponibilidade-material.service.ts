import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { take } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

import { environment } from 'src/environments/environment';

// Services
import { ComercialService } from '../comercial.service';
import { GenericService } from 'src/app/shared/services/requests/generic.service';
import { ComercialVendedoresService } from '../services/vendedores.service';
import { DisponibilidadeMaterial } from './models/disponibilidade-material';

@Injectable({
  providedIn: 'root'
})
export class ComercialDisponibilidadeMaterialService {
  private readonly API = `http://127.0.0.1:8000/comercial/disponibilidade-material`;

  constructor(
    protected http: HttpClient,
    private comercialService: ComercialService,
    private vendedoresService: ComercialVendedoresService,
    private genericService: GenericService
  ) {}

  getFiltros() {
    const depositos = this.comercialService.getDepositos({ grupoManetoni: 1 });
    const vendedores = this.vendedoresService.getVendedores();
    const situacoes = this.genericService.getSituacoes();

    return forkJoin([depositos, vendedores, situacoes]).pipe(take(1));
  }

  getSolicitacoes(params: any) {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/solicitacoes`, { params: httpParams })
      .pipe(take(1));
  }

  getSolicitacao(id: number) {
    return this.http.get(`${this.API}/solicitacao/${id}`).pipe(take(1));
  }

  private saveSolicitacao(record: any) {
    return this.http
      .post(`${this.API}/solicitacao/salvar`, record)
      .pipe(take(1));
  }

  private updateSolicitacao(record: any) {
    return this.http
      .put(`${this.API}/solicitacao/atualizar`, record)
      .pipe(take(1));
  }

  save(action: string, record: any) {
    if (action == 'editar') {
      return this.updateSolicitacao(record);
    }

    return this.saveSolicitacao(record);
  }

  deleteSolicitacao(disponibilidadeMaterial: DisponibilidadeMaterial) {
    return this.http
      .delete(
        `${this.API}/solicitacao/excluir/${disponibilidadeMaterial.codigo}`
      )
      .pipe(take(1));
  }
}
