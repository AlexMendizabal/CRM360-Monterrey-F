import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AbastecimentoNfeSemPedidoPaiService {

  private readonly BASE_URL = environment.API;

  constructor(
    private httpClient: HttpClient
  ) { }

  getNfeSemPedidoPai(params): Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/abastecimento/nfe-sem-pedido-pai`, {
      params,
      observe: "response"
    });
  }

  getLinhas() {
    return this.httpClient.get(`${this.BASE_URL}/common/v2/linhas`,{
      observe: 'response'
    },
    );
  }

  getClasses(params) {
    return this.httpClient.get(`${this.BASE_URL}/common/v2/classes`, {
      params,
      observe: 'response'
    });
  }

  getMateriais(params = {}) {
    return this.httpClient.get(`${this.BASE_URL}/common/v2/materiais`, {
      params,
      observe: 'response'
    });
  }
}
