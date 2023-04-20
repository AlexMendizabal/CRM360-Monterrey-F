import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AbastecimentoCadastroMediaVendasService {

  private readonly BASE_URL = environment.API;

  constructor(
    private httpClient: HttpClient
  ) { }

  getLinhas(): Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/common/linhas`, {
      observe: "response"
    });
  }

  getClasses(descricaoLinhas: any): Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/common/classes`, {
      params: {
        linhas: btoa(descricaoLinhas) 
      },
      observe: "response"
    });
  }

  postMediaVendas(dados: any): Observable<any> {
    return this.httpClient.post(`${this.BASE_URL}/abastecimento/cadastros/medias-venda`,
      dados,
      { observe: "response"}
    );
  }

  putMediaVendas(dados: any): Observable<any> {
    return this.httpClient.put(`${this.BASE_URL}/abastecimento/cadastros/medias-venda`,
    dados,
      { observe: "response"}
    );
  }

  getMediaVendas(parametros: any): Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/abastecimento/cadastros/medias-venda`,{
      params: {
        "linhas": parametros["linhas"].toString(),
        "classes": parametros["classes"].toString(),
        "situacao": parametros["situacao"]
      },
    observe: "response"
  });
  }

  getMediaVendasLogs(parametros: any): Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/abastecimento/cadastros/medias-venda-auditoria`,{
      params: {
        "linha": parametros["linha"].toString(),
        "classes": parametros["classe"].toString(),
      },
    observe: "response"
  });
  }
}
