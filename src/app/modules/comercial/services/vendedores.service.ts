import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { take, retry } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

// Interfaces
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialVendedoresService {
  private readonly API = `http://23.254.204.187/api/comercial/vendedor`;
  private readonly API_CADASTROS = `http://23.254.204.187/api/comercial/cadastros`;


  constructor(protected http: HttpClient) { }

  getDetalhesCadastro() {
    return this.http
      .get(`${this.API}/detalhes-cadastro`)
      .pipe(take(1), retry(2));
  }

  getVendedores() {
    return this.http.get(`${this.API}/lista`).pipe(take(1), retry(2));
  }

  getVendedoresSucursal(id: number) {
    return this.http
      .get(`${this.API}/sucursal-vendedor/${id}`)
  }

  getGestiones() {
    return this.http.get(`${this.API_CADASTROS}/titulos-agenda/lista?codSituacao=1`).pipe(take(1), retry(2));
  }

  getCarteiraClientes(params?): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/carteira-clientes`,
        {
          params: params
        })
      .pipe(take(1), retry(2));
  }

  getCarteiraClientesCotizacion(params?): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/carteira-clientes-cotizacion`,
        {
          params: params
        })
      .pipe(take(1), retry(2));
  }

  getValidaClienteCarteira(
    codCliente: number
  ): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/valida-cliente-carteira/${codCliente}`)
      .pipe(take(1), retry(2));
  }

  getVinculoOperadores() {
    return this.http
      .get(`${this.API}/vinculo-operadores`)
      .pipe(take(1), retry(2));
  }
  getDetalleVendedor(params) {
  return this.http
      .get(`${this.API}/detalles_vendedor`,
        {
          params: params
        })
      .pipe(take(1), retry(2));
  }

  getRubros(){
    
    return this.http
      .get(`${this.API}/rubros`)
      .pipe(take(1), retry(2));
  }
}
