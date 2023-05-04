import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { take, retry } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

// Services
import { ComercialService } from '../comercial.service';
import { ComercialTidSoftwareService } from '../tid-software/tid-software.service';

// Interfaces
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialEstoqueService {
  private readonly API = `https://crm360.monterrey.com.bo/api/comercial/estoque`;

  constructor(
    protected http: HttpClient,
    private comercialService: ComercialService,
    private tidSoftwareService: ComercialTidSoftwareService
  ) {}

  getFiltros(): Observable<Object | JsonResponse> {
    let empresas = this.tidSoftwareService.getEmpresas('estoques');
    let depositos = this.comercialService.getDepositos({ grupoManetoni: 1 });
    let linhas = this.tidSoftwareService.getLinhas();
    let classes = this.comercialService.getClasses(null);

    return forkJoin([empresas, depositos, linhas, classes]).pipe(
      take(1),
      retry(2)
    );
  }

  getEstoqueAtual(params: any): Observable<Object | JsonResponse> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/estoque-atual`, { params: httpParams })
      .pipe(take(1), retry(2));
  }

  getOutrasUnidades(id: any): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/outras-unidades/${id}`)
      .pipe(take(1), retry(2));
  }

  getPedidosCompra(params: any): Observable<Object | JsonResponse> {
    return this.http
      .get(
        `${this.API}/pedidos-compra/${params.idMaterial}/${params.idEmpresa}`
      )
      .pipe(take(1), retry(2));
  }

  getComprometido(params: any): Observable<Object | JsonResponse> {
    return this.http
      .get(
        `${this.API}/estoque-comprometido/${params.idMaterial}/${params.idEmpresa}`
      )
      .pipe(take(1), retry(2));
  }

  getLote(params: any): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/lote/${params.idMaterial}/${params.idEmpresa}`)
      .pipe(take(1), retry(2));
  }

  getEstoqueSuspenso(params: any): Observable<Object | JsonResponse> {
    return this.http
      .get(
        `${this.API}/estoque-suspenso/${params.idMaterial}/${params.idEmpresa}`
      )
      .pipe(take(1), retry(2));
  }
}
