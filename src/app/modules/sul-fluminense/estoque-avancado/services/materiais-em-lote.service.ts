import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SulFluminenseEstoqueAvancadoMateriaisEmLoteService {
  private readonly BASE_URL: string = `http://127.0.0.1:8000/api`;

  constructor(private http: HttpClient) { }

  getLista(params = {}) {
    return this.http.get(`${this.BASE_URL}/abastecimento/relatorios/materiais-em-lote`, {
      params,
      observe: 'response'
    })
  }
}
