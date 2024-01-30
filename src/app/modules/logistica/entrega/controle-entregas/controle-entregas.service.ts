import { Injectable } from '@angular/core';
import { take } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin } from 'rxjs';

import { environment } from 'src/environments/environment';
import { ComercialService } from 'src/app/modules/comercial/comercial.service';
import { ComercialVendedoresService } from 'src/app/modules/comercial/services/vendedores.service';
import { ComercialTidSoftwareService } from 'src/app/modules/comercial/tid-software/tid-software.service';

// Services
/* import { ComercialService } from '../comercial.service';
import { ComercialVendedoresService } from '../services/vendedores.service';
import { ComercialTidSoftwareService } from '../tid-software/tid-software.service'; */

@Injectable({
  providedIn: 'root',
})
export class ComercialControleEntregasService {
  private readonly API = `https://23.254.204.187/api`;

  constructor(
    protected http: HttpClient,
    private comercialService: ComercialService,
    private vendedoresService: ComercialVendedoresService,
    private tidSoftwareService: ComercialTidSoftwareService
  ) { }

  getFiltros() {
    /* const vendedores = this.vendedoresService.getVendedores(); */
    /* const empresas = this.tidSoftwareService.getEmpresas('entregas'); */

    /* return forkJoin([vendedores, empresas]).pipe(take(1)); */
  }

  getLista(params: any) {

    return this.http
      .get(`${this.API}/comercial/controle-entregas/lista`, { params: params, observe: "response" })
      .pipe(take(1));
  }

  getVendedores(params?){
    return this.http
      .get(`${this.API}/logistica/controle-entregas/vendedores`, { params: params, observe: "response" })
      .pipe(take(1));
  }

  getDetalhesPedido(params: any) {
    return this.http
      .get(`${this.API}/comercial/controle-entregas/detalhes-pedido`, {
        params: params,
        observe: "response"
      })
      .pipe(take(1));
  }

  getDetalhesRomaneio(params: any) {
    return this.http
      .get(`${this.API}/comercial/controle-entregas/detalhes-romaneio`, {
        params: params,
        observe: "response"
      })
      .pipe(take(1));
  }

  getSituacoes(){
    return this.http.get(`${this.API}/comercial/controle-entregas/situacoes`, {
      observe: "response"
    }).pipe(take(1));
  }

  pacthEvento(params){
    return this.http.patch(`${this.API}/logistica/controle-entregas/eventos`, params, {
      observe: 'response'
    })
  }
}
