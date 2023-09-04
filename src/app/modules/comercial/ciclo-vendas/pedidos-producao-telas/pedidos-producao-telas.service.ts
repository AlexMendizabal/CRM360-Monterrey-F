import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { take, retry } from 'rxjs/operators';
import { Observable, forkJoin } from 'rxjs';

import { environment } from 'src/environments/environment';

// Services
import { ComercialService } from '../../comercial.service';
import { ComercialTidSoftwareService } from '../../tid-software/tid-software.service';
import { ComercialEstoqueService } from '../../estoque/estoque.service';

// Interfaces
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialCicloVendasPedidosProducaoTelasService {
  private readonly API = `http://23.254.204.187/api/comercial/ciclo-vendas/pedidos-producao-telas`;

  constructor(
    protected http: HttpClient,
    private comercialService: ComercialService,
    private tidSoftwareService: ComercialTidSoftwareService,
    private estoqueService: ComercialEstoqueService
  ) {}

  getPermissoesAcesso(): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/permissoes-acesso`)
      .pipe(take(1), retry(2));
  }

  getPedidosProducaoTelas(params: any): Observable<Object | JsonResponse> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/lista`, { params: httpParams })
      .pipe(take(1), retry(2));
  }

  getDetalhesPedidosProducaoTelas(
    codEmpresa: number,
    nrProposta: number
  ): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/detalhes/${nrProposta}`)
      // .get(`${this.API}/detalhes/${codEmpresa}/${nrProposta}`)
      .pipe(take(1), retry(2));
  }

  getMateriaisPedidosProducaoTelas(
    codEmpresa: number,
    nrProposta: number
  ): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/materiais/detalhes/${codEmpresa}/${nrProposta}`)
      .pipe(take(1), retry(2));
  }

  getSituacaoLiberacao(nrProposta: number): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/situacao-liberacao/${nrProposta}`)
      .pipe(take(1), retry(2));
  }

  postTrocarCliente(params: any): Observable<Object | JsonResponse> {
    return this.http
      .post(`${this.API}/trocar/cliente`, params)
      .pipe(take(1), retry(2));
  }

  postDuplicarProposta(params: any): Observable<Object | JsonResponse> {
    return this.http
      .post(`${this.API}/duplicar-proposta`, params)
      .pipe(take(1), retry(2));
  }

  postDesdobrarProposta(params: any): Observable<Object | JsonResponse> {
    return this.http
      .post(`${this.API}/desdobrar-proposta`, params)
      .pipe(take(1), retry(2));
  }

  postTrocarEmpresa(params: any): Observable<Object | JsonResponse> {
    return this.http
      .post(`${this.API}/trocar/empresa`, params)
      .pipe(take(1), retry(2));
  }

  getImprimirCotacao(nrProposta: number): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/imprimir-cotacao/${nrProposta}`)
      .pipe(take(1), retry(2));
  }

  postEmailCotacao(params: any): Observable<Object | JsonResponse> {
    return this.http
      .post(`${this.API}/email-cotacao`, params)
      .pipe(take(1), retry(2));
  }

  getReservarIdCotacao(): Observable<Object | JsonResponse> {
    return this.http.get(`${this.API}/reservar`).pipe(take(1), retry(2));
  }

  getCotacao(
    codCotacao: number,
    idEmpresa: number
  ): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/${codCotacao}/${idEmpresa}`)
      .pipe(take(1), retry(2));
  }

  getCotacaoFilterValues(): Observable<Object | JsonResponse> {
    const linhas = this.tidSoftwareService.getLinhas();
    const classes = this.comercialService.getClasses(null);

    return forkJoin([linhas, classes]);
  }

  getMateriais(params: any): Observable<Object | JsonResponse> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/materiais`, { params: httpParams })
      .pipe(take(1), retry(2));
  }

  getEstoqueDetalhes(params: any): Observable<Object | JsonResponse> {
    return this.estoqueService.getEstoqueAtual(params);
  }

  getEstoqueDepositos(
    codDeposito: number,
    codMaterial: number
  ): Observable<Object | JsonResponse> {
    return this.http
      .get(
        `${this.API}/materiais/estoque-depositos/${codMaterial}/${codDeposito}`
      )
      .pipe(take(1), retry(2));
  }

  getMateriaisCombo(
    codEmpresa: number,
    codMaterial: number
  ): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/materiais/combo/${codEmpresa}/${codMaterial}`)
      .pipe(take(1), retry(2));
  }

  postVendasGerais(params: any): Observable<Object | JsonResponse> {
    return this.http
      .post(`${this.API}/materiais/relacionados`, params)
      .pipe(take(1), retry(2));
  }

  postVendasCliente(params: any): Observable<Object | JsonResponse> {
    return this.http
      .post(`${this.API}/materiais/relacionados`, params)
      .pipe(take(1), retry(2));
  }

  postMateriaisRelacionados(params: any): Observable<Object | JsonResponse> {
    return this.http
      .post(`${this.API}/materiais/relacionados`, params)
      .pipe(take(1), retry(2));
  }


  getFichaCadastralMaterial(
    codMaterial: number
  ): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/material/ficha-cadastral/${codMaterial}`)
      .pipe(take(1), retry(2));
  }

  getSimilaridadeMaterial(
    codEmpresa: number,
    codMaterial: number
  ): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/material/similaridade/${codEmpresa}/${codMaterial}`)
      .pipe(take(1), retry(2));
  }

  getTipoCalculoMaterial(
    codMaterial: number,
  ): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/material/tipo-calculo/${codMaterial}`)
      .pipe(take(1), retry(2));
  }

  getCalculoMaterial(params: any): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/material/calculo`, params)
      .pipe(take(1), retry(2));
  }

   // postCalculoMaterial(params: any): Observable<Object | JsonResponse> {
  //   return this.http
  //     .post(`${this.API}/material/calculo`, params)
  //     .pipe(take(1), retry(2));
  // }

  getHistoricoCompras(
    codEmpresa: number,
    codCliente: number
  ): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/historico-compras/${codEmpresa}/${codCliente}`)
      .pipe(take(1), retry(2));
  }

  postGerarDuplicatas(params: any): Observable<Object | JsonResponse> {
    return this.http
      .post(`${this.API}/duplicatas/gerar`, params)
      .pipe(take(1), retry(2));
  }

  postAlterarDuplicatas(params: any): Observable<Object | JsonResponse> {
    return this.http
      .post(`${this.API}/duplicatas/alterar`, params)
      .pipe(take(1), retry(2));
  }

  getHistoricoExclusao(codCotacao: number): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/historico-exclusao/${codCotacao}`)
      .pipe(take(1), retry(2));
  }

  postCotacaoPerdida(params: any): Observable<Object | JsonResponse> {
    return this.http
      .post(`${this.API}/perdida/salvar`, params)
      .pipe(take(1), retry(2));
  }

  getComissaoCotacao(
    codCotacao: number,
    codEmpresa: number
  ): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/comissao/${codCotacao}/${codEmpresa}`)
      .pipe(take(1), retry(2));
  }

  getProgressoCotacao(
    codCotacao: number,
    codEmpresa: number
  ): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/progresso/${codCotacao}/${codEmpresa}`)
      .pipe(take(1), retry(2));
  }

  getDetalhesPedidos(
    nrPedido: number
  ): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/detalhes/${nrPedido}`)
      .pipe(take(1), retry(2));
  }

  getDetailPanel(
    nrPedido: number
  ): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/detail-panel/${nrPedido}`)
      .pipe(take(1), retry(2));
  }

  postCotacao(params: any): Observable<Object | JsonResponse> {
    return this.http.post(`${this.API}/salvar`, params).pipe(take(1));
  }

  putCotacao(params: any): Observable<Object | JsonResponse> {
    return this.http.put(`${this.API}/atualizar`, params).pipe(take(1));
  }

  deleteMaterialCotacao(
    index: number,
    codMaterial: number
  ): Observable<Object | JsonResponse> {
    return this.http
      .delete(`${this.API}/materiais/excluir/${codMaterial}/${index}`)
      .pipe(take(1), retry(2));
  }
}
