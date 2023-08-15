import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { take } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

import { environment } from 'src/environments/environment';

// Services
import { EscritoriosService } from 'src/app/shared/services/requests/escritorios.service';
import { ComercialVendedoresService } from '../../services/vendedores.service';

@Injectable({
  providedIn: 'root'
})
export class ComercialRelatoriosFaturamentoDetalhadoService {
  private readonly API = `http://127.0.0.1:8000/comercial`;

  constructor(
    protected http: HttpClient,
    private escritoriosService: EscritoriosService,
    private vendedoresService: ComercialVendedoresService
  ) {}

  getFiltros() {
    const escritorios = this.escritoriosService.getEscritorios();
    const vendedores = this.vendedoresService.getVendedores();

    return forkJoin([escritorios, vendedores]).pipe(take(1));
  }

  getPerfil() {
    return this.http.get(`${this.API}/perfil`).pipe(take(1));
  }

  getFaturamentoDetalhado(params: any) {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/relatorios/faturamento-detalhado/lista`, {
        params: httpParams
      })
      .pipe(take(1));
  }
}
