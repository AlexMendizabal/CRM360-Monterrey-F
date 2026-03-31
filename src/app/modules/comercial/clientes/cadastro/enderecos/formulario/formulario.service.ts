import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { take } from 'rxjs/operators';
import { forkJoin, Observable } from 'rxjs';

import { environment } from 'src/environments/environment';

// Services
import { ComercialClientesService } from 'src/app/modules/comercial/services/clientes.service';

// Interfaces
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialClientesCadastroEnderecosFormularioService {
  private readonly API = `https://crm360.monterrey.com.bo/api/comercial/clientes/cadastro/formulario/enderecos`;

  constructor(
    protected http: HttpClient,
    private clientesService: ComercialClientesService
  ) {}

  loadDepencies(codCliente: any) {
    let regioesAtuacaoComercial = this.getRegioesAtuacaoComercial();
    let regioesEntrega = this.getRegioesEntrega();
    let tiposMaterial = this.getTiposMaterial();
    let tiposDescarga = this.getTiposDescarga();
    let modosDescarga = this.getModosDescarga();
    let validacoes = this.clientesService.getEnderecos(codCliente);
    let tiposVeiculos = this.getTiposVeiculos();
    let dadosEspeciais = this.getDadosEspeciais();

    return forkJoin([
      regioesAtuacaoComercial,
      regioesEntrega,
      tiposMaterial,
      tiposDescarga,
      modosDescarga,
      validacoes,
      tiposVeiculos,
      dadosEspeciais,
    ]).pipe(take(1));
  }

  getRegioesAtuacaoComercial() {
    return this.http.get(`${this.API}/regioes-atuacao-comercial`).pipe(take(1));
  }

  getRegioesEntrega() {
    return this.http.get(`${this.API}/regioes-entrega`).pipe(take(1));
  }

  getIbgeCidades(data: any) {
    return this.http.post(`${this.API}/ibge`, data).pipe(take(1));
  }

  getRegiaoEntrega(codIBGE: any) {
    return this.http.get(`${this.API}/regiao-entrega/${codIBGE}`).pipe(take(1));
  }

  getRegiaoEntregaPorBairro(bairro: string) {
    return this.http.get(`${this.API}/regiao-entrega-por-bairro/${bairro}`).pipe(take(1));
  }

  getTiposMaterial() {
    return this.http.get(`${this.API}/tipos-material`).pipe(take(1));
  }

  getTiposDescarga() {
    return this.http.get(`${this.API}/tipos-descarga`).pipe(take(1));
  }

  getModosDescarga() {
    return this.http.get(`${this.API}/modos-descarga`).pipe(take(1));
  }

  getTiposVeiculos() {
    return this.http.get(`${this.API}/tipos-veiculos`).pipe(take(1));
  }

  getDadosEspeciais() {
    return this.http.get(`${this.API}/dados-especiais`).pipe(take(1));
  }

  getAnexos(codEndereco: number): Observable<Object | JsonResponse> {
    return this.http.get(`${this.API}/anexos/${codEndereco}`).pipe(take(1));
  }

  getCliente(codCliente){
    return this.http.get(`https://crm360.monterrey.com.bo/api/comercial/clientes/detalhes/${codCliente}`).pipe(take(1));
  }

  postAnexos(
    params,
    codEndereco: number,
    codCliente: number
  ): Observable<Object | JsonResponse> {
    return this.http.post(
      `${this.API}/anexos/salvar?codEndereco=${codEndereco}&codCliente=${codCliente}`,
      params
    );
  }

  deleteAnexo(codAnexo: number): Observable<Object | JsonResponse> {
    let params = {
      codAnexo: codAnexo,
    };

    return this.http.put(`${this.API}/anexos/excluir`, params).pipe(take(1));
  }
}
