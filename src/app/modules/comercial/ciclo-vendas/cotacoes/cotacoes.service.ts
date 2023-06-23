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
export class ComercialCicloVendasCotacoesService {
  private readonly API = `https://crm360.monterrey.com.bo/api/comercial/ciclo-vendas/cotacoes`;

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

  getCotacoes(params: any): Observable<Object | JsonResponse> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/lista`, { params: httpParams })
      .pipe(take(1), retry(2));
  }

  getDetalhesCotacoes(
    codEmpresa: number,
    nrPedido: number
  ): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/detalhes/${codEmpresa}/${nrPedido}`)
      .pipe(take(1), retry(2));
  }

  getDetalhesPedidos(
    nrPedido: number
  ): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/detalhes/${nrPedido}`)
      .pipe(take(1), retry(2));
  }

  getMateriaisCotacao(
    codEmpresa: number,
    nrPedido: number
  ): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/materiais/detalhes/${codEmpresa}/${nrPedido}`)

      .pipe(take(1), retry(2));
  }

  getSituacaoLiberacao(params: any ): Observable<Object | JsonResponse> {

    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/situacao-liberacao`, { params: httpParams })
      .pipe(take(1), retry(2));
  }

  postTransfereFaturamento(params: any ): Observable<Object | JsonResponse> {
    return this.http
      .post(`${this.API}/transfere-faturamento`, params)
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

  getImprimirCotacao(nrPedido: number, codEmpresa: number): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/imprimir-cotacao/${nrPedido}/${codEmpresa}`)
      .pipe(take(1), retry(2));
  }

  getImprimirSeparacao(nrPedido: number, codEmpresa: number): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/imprimir-separacao/${nrPedido}/${codEmpresa}`)
      .pipe(take(1), retry(2));
  }

  postEmailCotacao(params: any): Observable<Object | JsonResponse> {
    return this.http
      .post(`${this.API}/email-cotacao`, params)
      .pipe(take(1)
      // ,
      // retry(2)
      );
  }

  getReservarIdCotacao(params?): Observable<Object | JsonResponse> {
    return this.http.get(`${this.API}/reservar`,{
      params: params
    }).pipe(take(1), retry(2));
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
    codMaterial: number,
    codCliente,
    codEndereco,
    codFormaPagamento,
    freteConta
    ): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/materiais/combo/${codEmpresa}/${codMaterial}`,{
        params:{
          codCliente:codCliente,
          codEndereco: codEndereco,
          codFormaPagamento: codFormaPagamento,
          freteConta: freteConta
        }

      })
      .pipe(take(1), retry(2));
  }

  postVendasGerais(params: any): Observable<Object | JsonResponse> {
    return this.http
      .post(`${this.API}/materiais/relacionados/vendas`, params)
      .pipe(take(1), retry(2));
  }

  postVendasCliente(params: any): Observable<Object | JsonResponse> {
    return this.http
      .post(`${this.API}/materiais/relacionados/cliente`, params)
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
    codMaterial: number,
    codCliente,
    codEndereco,
    codFormaPagamento,
    freteConta
  ): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/material/similaridade/${codEmpresa}/${codMaterial}`,
      {
        params:{
          codEndereco:codEndereco,
          codCliente:codCliente,
          codFormaPagamento:codFormaPagamento,
          freteConta: freteConta
        }
      })
      .pipe(take(1), retry(2));
  }

  getTipoCalculoMaterial(
    codMaterial: number,
    codFormaPagamento
  ): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/material/tipo-calculo/${codMaterial}`,{
        params: {
          codFormaPagamento:codFormaPagamento
        }
      })
      .pipe(take(1), retry(2));
  }

  postCalculoMaterial(params: any): Observable<Object | JsonResponse> {
    return this.http
      .post(`${this.API}/material/calculo`, params)
      .pipe(take(1), retry(2));
  }

  getHistoricoCompras(params: any ): Observable<Object | JsonResponse> {

    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/historico-compras`, { params: httpParams })
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

  getDuplicatas (params: any ): Observable<Object | JsonResponse> {

    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/duplicatas/consulta`, { params: httpParams })
      .pipe(take(1), retry(2));
  }

  deleteMaterialCotacao(params: any): Observable<Object | JsonResponse> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .delete(`${this.API}/materiais/excluir`, { params: httpParams })
      .pipe(take(1), retry(2));
  }

  getHistoricoExclusao(params: any): Observable<Object | JsonResponse> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/historico-exclusao`, { params: httpParams })
      .pipe(take(1), retry(2));
  }

  postCotacao(params: any): Observable<Object | JsonResponse> {
    return this.http.post(`${this.API}/salvar`, params).pipe(take(1), retry(2));
  }

  putCotacao(params: any): Observable<Object | JsonResponse> {
    return this.http.put(`${this.API}/atualizar`, params).pipe(take(1), retry(2));
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

  getValidadeDuplicata(
    codCotacao: number,
    codEmpresa: number
  ): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/validade-duplicata/${codCotacao}/${codEmpresa}`)
      .pipe(take(1), retry(2));
  }

  getLoteMaterial(
    codMaterial: number,
    codEmpresa: number
  ): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/material/lote/${codMaterial}/${codEmpresa}`)
      .pipe(take(1), retry(2));
  }


}
