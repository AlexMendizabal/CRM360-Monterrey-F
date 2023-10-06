import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SulFluminenseEstoqueAvancadoAuditoriaEstoqueService {
  private readonly BASE_URL: string = `http://23.254.204.187/api/api`;

  constructor(private http: HttpClient) { }

  getLista(params = {}) {
    return this.http.get(`${this.BASE_URL}/abastecimento/relatorios/auditoria-de-estoque`, {
      params,
      observe: 'response'
    })
  }
}
