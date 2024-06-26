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
  private readonly API = `http://23.254.204.187/api/comercial/estoque`;

  constructor(
    protected http: HttpClient,
    private comercialService: ComercialService,
    private tidSoftwareService: ComercialTidSoftwareService
  ) { }

  getFiltros(): Observable<Object | JsonResponse> {
    /* Almacen */
    let almacenes = this.comercialService.getAlmacen();
    /* Familia */
    let classes = this.comercialService.getClasses(null);
    let depositos = this.comercialService.getDepositos({ grupoManetoni: 1 });

    let sucursales = this.comercialService.getEscritorios();
    let empresas = this.tidSoftwareService.getEmpresas('estoques');
    let linhas = this.tidSoftwareService.getLinhas();


    return forkJoin([almacenes, classes, depositos, sucursales, empresas, linhas]).pipe(
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

  getStockComprometido(params: any): Observable<Object | JsonResponse> {
    return this.http
      .get(
        `${this.API}/estoquecomprometido/${params.idMaterial}`
      )
      .pipe(take(1), retry(2));
  }
  getStockSuspeso(params: any): Observable<Object | JsonResponse> {
    return this.http
      .get(
        `${this.API}/estoquesuspenso/${params.idMaterial}`
      )
      .pipe(take(1), retry(2));
  }

  getStockAlmacenes(params: any): Observable<Object | JsonResponse> {
    const url = `${this.API}/estoquealmacen/${params.idMaterial}`;
    
    const queryParams = new HttpParams({
      fromObject: {
        id_lista_precio: params.id_lista_precio || '',
        nombre_almacen: params.nombre_almacen || '',
        codigo_almacen: params.codigo_almacen || '',
        registrosLista: params.registrosLista || '25',
      }
    });
  
    console.log('URL de la solicitud:', url);
    console.log('Parámetros de la solicitud:', queryParams.toString());
  
    return this.http.get(url, { params: queryParams }).pipe(take(1), retry(2));
  }

  buscarListaPrecio(nombreLista: string): Observable<Object | JsonResponse> {
    const params = new HttpParams().set('nombre_lista', nombreLista);
  
    console.log('Enviando parámetros:', params.toString());
  
    return this.http
      .get(`${this.API}/lista-precio`, { params })
      .pipe(take(1), retry(2));
  }
  
  
  
}
