
import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable, forkJoin, BehaviorSubject, of } from 'rxjs';
import { take, retry, delay } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

// Services
import { ComercialService } from '../../../comercial.service';
import { ComercialVendedoresService } from '../../../services/vendedores.service';
import { ComercialClientesService } from '../../../services/clientes.service';
import { ComercialCadastrosTransportadoraService } from '../../../cadastros/transportadoras/transportadoras.service';
import { ComercialAgendaFormularioService } from '../../../agenda/formulario/formulario.service';
import { ComercialCadastrosSituacaoPropostaService } from '../../../cadastros/situacao-proposta/situacao-proposta.service';
import { ComercialCadastrosFormasPagamentoService } from '../../../cadastros/formas-pagamento/formas-pagamento.service';
import { ComercialCadastrosContatoFormasContatoService } from '../../../cadastros/contato/formas-contato/formas-contato.service';
import { ComercialCadastrosContatoOrigemContatoService } from '../../../cadastros/contato/origem-contato/origem-contato.service';

// Interfaces
import { JsonResponse } from 'src/app/models/json-response';
import { ICalculoModel } from './models/calculo';
import { IDescontoModel } from './models/descontos';
import { ILoteModel } from './models/lote';
import { ComercialTidSoftwareService } from '../../../tid-software/tid-software.service';

@Injectable({
  providedIn: 'root',
})
export class ComercialCicloVendasCotacoesFormularioService {
  private readonly API = `http://23.254.204.187/comercial/ciclo-vendas/cotacoes`;

  private readonly URL = 'http://23.254.204.187/comercial';

  private notifySubmit = new Subject<any>();

  notifySubmitObservable$ = this.notifySubmit.asObservable();

  materiaisSubject: Subject<Array<any>> = new Subject<Array<any>>();
  limparCarrinhoSubject: Subject<boolean> = new Subject<boolean>();
  calculoSubject: Subject<ICalculoModel> = new Subject<ICalculoModel>();
  descontoSubject: Subject<IDescontoModel> = new Subject<IDescontoModel>();
  loteSubject: Subject<ILoteModel> = new Subject<ILoteModel>();

  carteiraClientesSubject: BehaviorSubject<any>;
  carteiraClientes: Observable<any>;
  carteiraClientesLoaded: boolean;

  codCliente: EventEmitter<number> = new EventEmitter();

  constructor(
    protected http: HttpClient,
    private comercialService: ComercialService,
    private vendedoresService: ComercialVendedoresService,
    private clientesService: ComercialClientesService,
    private tidService: ComercialTidSoftwareService,
    private transportadorasService: ComercialCadastrosTransportadoraService,
    private agendaService: ComercialAgendaFormularioService,
    private situacoesService: ComercialCadastrosSituacaoPropostaService,
    private formasPagamentoService: ComercialCadastrosFormasPagamentoService,
    private formasContatoService: ComercialCadastrosContatoFormasContatoService,
    private origensContatoService: ComercialCadastrosContatoOrigemContatoService
  ) {}

  public onNotifySubmit(data: boolean) {
    this.notifySubmit.next(data);
  }

  loadDependencies(): Observable<Array<Object | JsonResponse>> {
    const situacoes = this.situacoesService.getListaSituacaoProposta(null);
    // const depositos = this.comercialService.getDepositos({ idDeposito: [1,18,60,79,/*77*/], tipo: 'ssv' });
    // const empresas = this.comercialService.getEmpresas({ idEmpresa: [4,18,55,79,77], tipo: 'search' });
    const empresas = this.tidService.getEmpresas('vendas');
    const depositos = this.comercialService.getDepositos(null);
    const formasPagamento = this.formasPagamentoService.getListaFormasPagamento(
      { tipoConsulta: 2 }
    );
    const formasContato = this.formasContatoService.getListaFormasContato(null);
    const origensContato = this.origensContatoService.getListaOrigemContato(
      null
    );
    const transportadoras = this.transportadorasService.getListaTransportadoras(
      { tipoConsulta: 2 }
    );

    return forkJoin([
      situacoes,
      empresas,
      depositos,
      formasPagamento,
      formasContato,
      origensContato,
      transportadoras
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
      // {
      //   codCliente: 78919,
      //   razaoSocial: 'LINDSAY',
      // },
    ]).pipe(delay(1000));
  }

  getLocaisEntrega(codCliente: number): Observable<Object | JsonResponse> {
    return this.clientesService.getEnderecos(codCliente, { localEntrega: 1 });
  }

  getAnexos(codCotacao: number): Observable<any> {
    return this.http
      .get(`${this.API}/anexo/documentos/${codCotacao}`)
      .pipe(take(1));
  }

  postAnexos(params, codCotacao: number): Observable<any> {
    return this.http.post(
      `${this.API}/anexo/documentos/salvar?codCotacao=${codCotacao}`,
      params
    );
  }

  deleteAnexo(codAnexo: number): Observable<any> {
    let params = {
      codAnexo: codAnexo,
    };

    return this.http
      .put(`${this.API}/anexo/documentos/excluir`, params)
      .pipe(take(1));
  }

  getCliente(codCliente){
    return this.http.get(`${this.URL}/clientes/detalhes/${codCliente}`).pipe(take(1));
  }

  getListarPrecios(){
    return this.http.get(`${this.URL}/vendedor/lista_precio`);
  }

  getTodosVendedores(){
    return this.http.get(`${this.URL}/vendedor/allvendedor`);
  }
}
