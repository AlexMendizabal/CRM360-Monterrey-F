import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { take, retry } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

// Interfaces
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialClientesService {
  private readonly API = `http://23.254.204.187/api/comercial/clientes`;

  constructor(protected http: HttpClient) {}

  getStatus(): Observable<Object> {
    return this.http.get(`${this.API}/pesquisa/status`).pipe(take(1), retry(2));
  }

  getClientes(params: any): Observable<Object> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/pesquisa/lista`, { params: httpParams })
      .pipe(take(1), retry(2));
  }

  getClientesGrupoEconomico(codCliente: number): Observable<Object> {
    return this.http
      .get(`${this.API}/pesquisa/grupo-economico/${codCliente}`)
      .pipe(take(1), retry(2));
  }

  getPermissaoAcesso(id: any): Observable<Object> {
    return this.http
      .get(`${this.API}/permissao-acesso/${id}`)
      .pipe(take(1), retry(2));
  }

  getDetalhes(codCliente: number): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/pesquisa/detalhes/${codCliente}`)
      .pipe(take(1), retry(2));
  }

  getContatosResumido(codCliente: number): Observable<Object> {
    return this.http
      .get(`${this.API}/pesquisa/contatos/${codCliente}`)
      .pipe(take(1), retry(2));
  }

  getExisteCpfCnpj(
    documento: any,
    getDadosCliente: boolean
  ): Observable<Object> {
    return this.http
      .get(
        `${this.API}/verificar-cpf-cnpj/${documento}?getDadosCliente=${
          getDadosCliente === true ? 1 : 0
        }`
      )
      .pipe(take(1), retry(2));
  }

  postCliente(data: any): Observable<Object> {
    return this.http
      .post(`${this.API}/pre-cadastro`, data)
      .pipe(take(1), retry(2));
  }

  getPropostaAnaliseCredito(codCliente: number): Observable<Object> {
    return this.http
      .get(`${this.API}/proposta-analise-credito/${codCliente}`)
      .pipe(take(1), retry(2));
  }

  getDadosFaturamento(codCliente: number): Observable<Object> {
    return this.http
      .get(`${this.API}/cadastro/carregar/dados-faturamento/${codCliente}`)
      .pipe(take(1), retry(2));
  }

  updateDadosFaturamento(data: any): Observable<Object> {
    return this.http
      .put(`${this.API}/cadastro/salvar/dados-faturamento`, data)
      .pipe(take(1), retry(2));
  }

  deleteAtividadeSecundaria(
    codCliente: number,
    id: number
  ): Observable<Object> {
    return this.http
      .delete(
        `${this.API}/cadastro/excluir/atividade-secundaria/${codCliente}/${id}`
      )
      .pipe(take(1), retry(2));
  }

  getEnderecos(
    codCliente: number,
    params?: any
  ): Observable<Object | JsonResponse> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/cadastro/carregar/enderecos/${codCliente}`, {
        params: httpParams,
      })
      .pipe(take(1), retry(2));
  }

  getEndereco(
    codCliente: number,
    idEndereco: number,
    idSituacao: number
  ): Observable<Object> {
    return this.http
      .get(
        `${this.API}/cadastro/carregar/endereco/${codCliente}/${idEndereco}/${idSituacao}`
      )
      .pipe(take(1), retry(2));
  }

  updateEndereco(data: any): Observable<Object> {
    return this.http
      .put(`${this.API}/cadastro/salvar/endereco`, data)
      .pipe(take(1), retry(2));
  }

  deleteEndereco(codCliente: number, id: number): Observable<Object> {
    return this.http
      .delete(`${this.API}/cadastro/excluir/endereco/${codCliente}/${id}`)
      .pipe(take(1), retry(2));
  }

  getContatos(codCliente: number): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/cadastro/carregar/contatos/${codCliente}`)
      .pipe(take(1), retry(2));
  }

  getContato(
    codCliente: number,
    idContato: number
  ): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/cadastro/carregar/contato/${idContato}/${codCliente}`)
      .pipe(take(1), retry(2));
  }

  updateContato(data: any): Observable<Object> {
    return this.http
      .put(`${this.API}/cadastro/salvar/contato`, data)
      .pipe(take(1), retry(2));
  }

  deleteContato(
    codCliente: number,
    id: number,
    idSeqTid: number
  ): Observable<Object> {
    return this.http
      .delete(
        `${this.API}/cadastro/excluir/contato/${codCliente}/${id}/${idSeqTid}`
      )
      .pipe(take(1), retry(2));
  }

  deleteMeioContato(
    codCliente: number,
    id: number,
    idSeqTid: number
  ): Observable<Object> {
    return this.http
      .delete(
        `${this.API}/cadastro/excluir/meio-contato/${codCliente}/${id}/${idSeqTid}`
      )
      .pipe(take(1), retry(2));
  }

  deleteFilho(idFilho: number): Observable<Object> {
    return this.http
      .delete(`${this.API}/cadastro/excluir/filho/${idFilho}`)
      .pipe(take(1), retry(2));
  }

  getDadosRelacionamento(codCliente: number): Observable<Object> {
    return this.http
      .get(`${this.API}/cadastro/carregar/dados-relacionamento/${codCliente}`)
      .pipe(take(1), retry(2));
  }

  updateDadosRelacionamento(data: any): Observable<Object> {
    return this.http
      .put(`${this.API}/cadastro/salvar/dados-relacionamento`, data)
      .pipe(take(1), retry(2));
  }

  getPotencialCompra(codCliente: number): Observable<Object> {
    return this.http
      .get(`${this.API}/cadastro/carregar/potencial-compra/${codCliente}`)
      .pipe(take(1), retry(2));
  }

  updatePotencialCompra(data: any): Observable<Object> {
    return this.http
      .put(`${this.API}/cadastro/salvar/potencial-compra`, data)
      .pipe(take(1), retry(2));
  }

  getAnexos(codCliente: number): Observable<Object> {
    return this.http
      .get(`${this.API}/cadastro/carregar/anexos/${codCliente}`)
      .pipe(take(1)
      // , retry(2)
      );
  }

  uploadAnexo(data: any): Observable<Object> {
    return this.http
      .post(`${this.API}/cadastro/upload/anexo`, data)
      .pipe(take(1)
      // , retry(2)
      );
  }

  deleteAnexo(idAnexo: number): Observable<Object> {
    return this.http
      .delete(`${this.API}/cadastro/excluir/anexo/${idAnexo}`)
      .pipe(take(1), retry(2));
  }

  getFilial(codCliente: number): Observable<Object> {
    return this.http
      .get(`${this.API}/cadastro/carregar/filial/${codCliente}`)
      .pipe(take(1), retry(2));
  }

  getTravas(codCliente: number): Observable<Object> {
    return this.http
      .get(`${this.API}/cadastro/carregar/travas/${codCliente}`)
      .pipe(take(1), retry(2));
  }

  getInformacoesFinanceiras(codCliente: number): Observable<Object> {
    return this.http
      .get(
        `${this.API}/cadastro/carregar/informacoes-financeiras/${codCliente}`
      )
      .pipe(take(1), retry(2));
  }

  getInformacoesComerciais(codCliente: number): Observable<Object> {
    return this.http
      .get(`${this.API}/cadastro/carregar/informacoes-comerciais/${codCliente}`)
      .pipe(take(1), retry(2));
  }

  getListaEmails(codCliente: number): Observable<Object> {
    return this.http
      .get(`${this.API}/emails/lista/${codCliente}`)
      .pipe(take(1), retry(2));
  }
}
