import { IDescontoModel } from './../../cotacoes/formulario/models/descontos';
import { ICalculoModel } from './../../cotacoes/formulario/models/calculo';
import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpParams} from '@angular/common/http';
import { Subject, Observable, forkJoin, BehaviorSubject, of } from 'rxjs';
import { take, delay } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

// Services
import { ComercialService } from '../../../comercial.service';
import { ComercialVendedoresService } from '../../../services/vendedores.service';
import { ComercialCadastrosSituacaoPropostaService } from '../../../cadastros/situacao-proposta/situacao-proposta.service';

// Interfaces
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialCicloVendasPedidosProducaoTelasFormularioService {
  private readonly API = `https://crm360.monterrey.com.bo/api/comercial/ciclo-vendas/pedidos-producao-telas`;

  private notifySubmit = new Subject<any>();

  notifySubmitObservable$ = this.notifySubmit.asObservable();

  materiaisSubject: Subject<Array<any>> = new Subject<Array<any>>();
  limparCarrinhoSubject: Subject<boolean> = new Subject<boolean>();
  calculoSubject: Subject<ICalculoModel> = new Subject<ICalculoModel>();
  dataSubject: Subject<ICalculoModel> = new Subject<ICalculoModel>();
  descontoSubject: Subject<IDescontoModel> = new Subject<IDescontoModel>();

  calculoBehavior: BehaviorSubject<ICalculoModel>;
  calculoObservable: Observable<ICalculoModel>;

  carteiraClientesSubject: BehaviorSubject<any>;
  carteiraClientes: Observable<any>;
  carteiraClientesLoaded: boolean;

  codCliente: EventEmitter<number> = new EventEmitter();

  constructor(
    protected http: HttpClient,
    private comercialService: ComercialService,
    private vendedoresService: ComercialVendedoresService,
    private situacoesService: ComercialCadastrosSituacaoPropostaService,
  ) {}


  public onNotifySubmit(data: boolean) {
    this.notifySubmit.next(data);
  }


  loadDependencies(): Observable<Array<Object | JsonResponse>> {
    const situacoes = this.situacoesService.getListaSituacaoProposta(null);
    const empresas = this.comercialService.getEmpresas({ tipo: 'faturamento' });
    const depositos = this.comercialService.getDepositos({ grupoManetoni: 1 });

    return forkJoin([
      situacoes,
      empresas,
      depositos
    ]);
  }

  createCarteiraClientes(carteiraClientes: Array<any>): void {
    this.carteiraClientesSubject = new BehaviorSubject<any>(carteiraClientes);
    this.carteiraClientes = this.carteiraClientesSubject.asObservable();
    this.carteiraClientesSubject.next(carteiraClientes);
    this.carteiraClientesLoaded = true;
  }

  getCurrentCarteiraClientes(): Array<any> {
    let _carteiraClientes = [];

    if (this.carteiraClientesLoaded === true) {
      _carteiraClientes = this.carteiraClientesSubject.value;
    }

    return _carteiraClientes;
  }

  getCarteiraClientes(): Observable<Object | JsonResponse> {
    return this.vendedoresService.getCarteiraClientes();
  }

  clearCarteiraClientes(): void {
    if (typeof this.carteiraClientesSubject !== 'undefined') {
      this.carteiraClientesSubject.next([]);
    }
  }

  getPesquisaCliente(termoPesquisa: string): Observable<Object | JsonResponse> {
    return of([
      {
        codCliente: 78919,
        razaoSocial: 'LINDSAY',
      },
    ]).pipe(delay(1000));
  }

  postProducao(nrPedido: number): Observable<any> {
    return this.http.post(`${this.API}/producao`, nrPedido).pipe(take(1));
  }

  postExpedicao(nrPedido: number): Observable<any> {
    return this.http.post(`${this.API}/expedicao`, nrPedido).pipe(take(1));
  }

  // getCalculoMaterial(
  //   params
  // ): Observable<Object | JsonResponse> {
  //   return this.http
  //     .get(`${this.API}/material/calculo`, params)
  //     .pipe(take(1));
  // }

  getCalculoMaterial(params: any): Observable<Object | JsonResponse> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/material/calculo`, { params: httpParams })
      .pipe(take(1));
  }

}
