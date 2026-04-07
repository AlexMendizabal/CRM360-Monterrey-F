import { Injectable } from '@angular/core';
import { HttpClient,  HttpParams } from '@angular/common/http';
import { Observable, Subscription, BehaviorSubject, Subject, throwError } from 'rxjs';
import { take, retry, catchError, finalize } from 'rxjs/operators';
// Interfaces
import { JsonResponse } from 'src/app/models/json-response';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FormularioService {
  private readonly API = `${environment.API}`;
  private readonly API2 = `${environment.API}/comercial/clientes`;

  private httpSubscription: Subscription | undefined;
  private selectedClientSource = new BehaviorSubject<string | null>(null);
  selectedClient$ = this.selectedClientSource.asObservable();
  materiaisSubject: Subject<Array<any>> = new Subject<Array<any>>();
  private notifySubmit = new Subject<any>();
  notifySubmitObservable$ = this.notifySubmit.asObservable();
  private articuloSource = new BehaviorSubject<string | null>(null);
  private articuloSubject = new BehaviorSubject<{articulo: string, lista: number}>({articulo: '', lista: 0});
  private logisticaDataSubject = new BehaviorSubject<any>(null);
  logisticaData$ = this.logisticaDataSubject.asObservable();
  private loaderSubject = new BehaviorSubject<boolean>(false);
  loader$ = this.loaderSubject.asObservable();

  articulo$ = this.articuloSource.asObservable();
  constructor(
    protected http: HttpClient,
  ) { }
  updateArticulo(articulo: string, lista: number): void {
    this.articuloSubject.next({ articulo, lista });
}

getArticulo(): Observable<{articulo: string, lista: number}> {
    return this.articuloSubject.asObservable();
}
  getCliente(params): Observable<Object | JsonResponse> {
    if (this.httpSubscription) {
      this.httpSubscription.unsubscribe();
    }
    return this.http
      .get(`${this.API}/comercial/ciclo-vendas/ofertas/getlistsacliente`, { params: params })
      .pipe(take(1), retry(2));
  }
  getClienteTextBox(params): Observable<Object | JsonResponse> {
    if (this.httpSubscription) {
      this.httpSubscription.unsubscribe();
    }
    return this.http
      .get(`${this.API}/comercial/ciclo-vendas/ofertas/getlistsaclienteCajaTexto`, { params: params })
      .pipe(take(1), retry(2));
  }
  getDataMateriales(params): Observable<Object | JsonResponse> {
    this.loaderSubject.next(true); // Activar loader
    if (this.httpSubscription) {
      this.httpSubscription.unsubscribe();
    }
    return this.http
      .get(`${this.API}/comercial/ciclo-vendas/ofertas/getListaMateriales`, { params: params })
      .pipe(
        take(1),
        retry(2),
        catchError((error) => {
          this.loaderSubject.next(false); // Desactivar loader en caso de error
          return throwError(error);
        }),
        finalize(() => {
          this.loaderSubject.next(false); // Desactivar loader al finalizar
        })
      );
  }
  insertClientesTemp(): Observable<any> {
    return this.http.get(`${this.API}/comercial/ciclo-vendas/ofertas/insertClientesTemp`, {});
  }

  setSelectedClient(codigo: string) {
    this.selectedClientSource.next(codigo);
  }

  PostCodigoCliente(codigo: string): Observable<any> {
    return this.http.post(`${this.API}/comercial/ciclo-vendas/ofertas/PostCodigoCliente`, { codigo });
  }

  getDatoEdita(id_oferta: string): Observable<Object | JsonResponse> {
    const params = { id_oferta: id_oferta};
    return this.http
      .get(`${this.API}/comercial/ciclo-vendas/ofertas/get_oferta_editar`, { params })
      .pipe(take(1), retry(2));
  }

  getAlmacenes(): Observable<any> {
    return this.http.get(`${this.API}/comercial/ciclo-vendas/ofertas/getAlmacenes`).pipe(
      take(1),
      retry(2)
    );
  }
  getEjecutivos(): Observable<any> {
    return this.http.get(`${this.API}/comercial/ciclo-vendas/ofertas/getEjecutivos`).pipe(
      take(1),
      retry(2)
    );
  }
  getTipoContacto(): Observable<any> {
    return this.http.get(`${this.API}/comercial/ciclo-vendas/ofertas/getTipoContacto`).pipe(
      take(1),
      retry(2)
    );
  }
  getCondicionPago(): Observable<any> {
    return this.http.get(`${this.API}/comercial/ciclo-vendas/ofertas/getCondicionPago`).pipe(
      take(1),
      retry(2)
    );
  }
  getMateriales(): Observable<object | JsonResponse> {
    return this.http
     .get(`${this.API}/comercial/ciclo-vendas/ofertas/getlistamaterial`)
     .pipe(take(1), retry(2));
  }

  postCalculo(params): Observable<Object | JsonResponse> {
    return this.http
     .post(`${this.API}/comercial/ciclo-vendas/cotacoes/calculadora`, params)
     .pipe(take(1), retry(2));
  }

  getRubros(): Observable<object | JsonResponse> {
    return this.http
     .get(`${this.API}/comercial/ciclo-vendas/ofertas/getRubros`)
     .pipe(take(1), retry(2));
  }

  getTipoDoc(): Observable<object | JsonResponse> {
    return this.http
     .get(`${this.API}/comercial/ciclo-vendas/ofertas/getTipoDoc`)
     .pipe(take(1), retry(2));
  }

  getAlmacenStockDisponible(params): Observable<Object | JsonResponse> {
    if (this.httpSubscription) {
      this.httpSubscription.unsubscribe();
    }
    return this.http
    .get(`${this.API}/comercial/ciclo-vendas/ofertas/getStockMaterial`, { params: params })
    .pipe(take(1), retry(2));
  }
  getMaterialDatosMaestros(articulo: string, lista: number): Observable<Object | JsonResponse> {
    const params = { codigo: articulo, lista: lista.toString() }; // Construir parámetros de consulta
    return this.http
      .get(`${this.API}/comercial/ciclo-vendas/ofertas/getMaterialDatosMaestros`, { params })
      .pipe(take(1), retry(2));
  }

  getStockAll(codigoArticulo: string): Observable<any> {
    const params = { codMate: codigoArticulo }; // Preparar los parámetros de consulta
    return this.http.get(`${this.API}/comercial/ciclo-vendas/ofertas/getStockAll`, { params })
      .pipe(take(1), retry(2));
  }
  updateLogisticaData(data: any) {
    this.logisticaDataSubject.next(data);
  }
  postOferta(params: any): Observable<any> {
    return this.http.post(`${this.API}/comercial/ciclo-vendas/oferta/registrar`, { params });
  }
  getHistorialOfertas(codigo: string): Observable<Object | JsonResponse> {
    const params = new HttpParams().set('codigo_cliente', codigo);
    return this.http
      .get(`${this.API}/comercial/ciclo-vendas/ofertas/get_historial_oferta_cliente`, { params })
      .pipe(take(1), retry(2));
  }
  getImprimirCotacao(nrPedido: number): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/comercial/ciclo-vendas/cotacoes/imprimir-cotacao/${nrPedido}`)
      .pipe(take(1), retry(2));
  }

  obtenerTiposDocumentos() {
    return this.http.get(`${this.API2}/tipo_documento`).pipe(take(1));
  }
  getTipoPersona() {
    return this.http.get(`${this.API2}/tipo_persona`).pipe(take(1));
  }
  updateCliente(params: any){
    return this.http
      .post(`${this.API}/sap/cliente_update`, params)
      .pipe(take(1), retry(0));
  }

  editarOferta(id_oferta: number): Observable<Object> {
    return this.http
      .get(`${this.API}/comercial/ciclo-vendas/ofertas/get_oferta_editar`, {
        params: { id_oferta: id_oferta.toString() } // Pasando idOferta como parámetro de consulta
      })
      .pipe(take(1), retry(2));
  }


  getCrossSell(id_material: string): Observable<any> {
    const params = { id_mate: id_material }; // Preparar los parámetros de consulta
    return this.http.get(`${this.API}/comercial/cadastros/materiais/cross-sell/cs_materiales`, { params })
      .pipe(take(1), retry(2));
  }
  getUpSell(id_material: string): Observable<any> {
    const params = { id_mate: id_material }; // Preparar los parámetros de consulta
    return this.http.get(`${this.API}/comercial/cadastros/materiais/Similaridade/s_materiales`, { params })
      .pipe(take(1), retry(2));
  }


}
