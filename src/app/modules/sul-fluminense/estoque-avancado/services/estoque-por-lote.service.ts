import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SulFluminenseEstoqueAvancadoEstoquePorLoteService {
  private readonly BASE_URL: string = `http://127.0.0.1:8000`;

  constructor(private http: HttpClient) { }

  getLista(params = {}) {
    return this.http.get(`${this.BASE_URL}/abastecimento/relatorios/estoque-por-lote`, {
      params,
      observe: 'response'
    })
  }
}
