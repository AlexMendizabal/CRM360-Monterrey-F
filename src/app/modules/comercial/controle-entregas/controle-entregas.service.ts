import { Injectable } from '@angular/core';
import { take } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin } from 'rxjs';

import { environment } from 'src/environments/environment';

// Services
import { ComercialService } from '../comercial.service';
import { ComercialVendedoresService } from '../services/vendedores.service';
import { ComercialTidSoftwareService } from '../tid-software/tid-software.service';

@Injectable({
  providedIn: 'root',
})
export class ComercialControleEntregasService {
  private readonly API = `http://23.254.204.187/api/comercial/controle-entregas`;

  constructor(
    protected http: HttpClient,
    private comercialService: ComercialService,
    private vendedoresService: ComercialVendedoresService,
    private tidSoftwareService: ComercialTidSoftwareService
  ) { }

  getFiltros() {
    const vendedores = this.vendedoresService.getVendedores();
    const empresas = this.tidSoftwareService.getEmpresas('entregas');

    return forkJoin([vendedores, empresas]).pipe(take(1));
  }

  getLista(params: any) {

    return this.http
      .get(`${this.API}/lista`, { params: params, observe: "response" })
      .pipe(take(1));
  }


  getDetalhesPedido(params: any) {
    return this.http
      .get(`${this.API}/detalhes-pedido`, {
        params: params,
        observe: "response"
      })
      .pipe(take(1));
  }

  getDetalhesRomaneio(params: any) {
    return this.http
      .get(`${this.API}/detalhes-romaneio`, {
        params: params,
        observe: "response"
      })
      .pipe(take(1));
  }

  getSituacoes(){
    return this.http.get(`${this.API}/situacoes`, {
      observe: "response"
    }).pipe(take(1));
  }
}
