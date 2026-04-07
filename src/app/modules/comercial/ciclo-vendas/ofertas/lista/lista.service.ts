import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { take, retry } from 'rxjs/operators';
// Interfaces
import { JsonResponse } from 'src/app/models/json-response';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ListaService {
  private readonly API = `${environment.API}`;
  private readonly API2 = `${environment.API}/comercial/ciclo-vendas/cotacoes`;
  constructor(protected http: HttpClient) {}

  postListaOferta(params: any): Observable<Object> {
    return this.http
      .post(`${this.API}/comercial/ciclo-vendas/ofertas/listar`, params)
      .pipe(take(1), retry(2));
  }
  private esVencida(fechaInicial: Date): boolean {
    let contadorDias = 0;
    let fecha = new Date(fechaInicial);

    while (contadorDias < 7) {
      fecha.setDate(fecha.getDate() + 1);
      if (fecha.getDay() !== 0 && fecha.getDay() !== 6) {
        contadorDias++;
      }
    }
    const hoy = new Date();
    return fecha <= hoy;
  }

  // Método para filtrar ofertas que han pasado 7 días hábiles desde su fecha inicial
  filtrarOfertasPasados7DiasHabiles(ofertas: any[]): any[] {
    return ofertas.filter((oferta) => {
      const fechaInicial = new Date(oferta.fecha_inicial);
      return this.esVencida(fechaInicial) && oferta.CODIGO_SAP !== null;
    });
  }

  getImprimirCotacao(nrPedido: number): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API2}/imprimir-cotacao/${nrPedido}`)
      .pipe(take(1), retry(2));
  }
  getenviarsap(nrPedido: number): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API2}/enviar_sap/${nrPedido}`)
      .pipe(take(1), retry(2));
  }

  postverifica_oferta(data: any): Observable<Object> {
    return this.http
      .get(`${this.API2}/vigencia_oferta/${data}`)
      .pipe(take(1), retry(2));
  }
}
