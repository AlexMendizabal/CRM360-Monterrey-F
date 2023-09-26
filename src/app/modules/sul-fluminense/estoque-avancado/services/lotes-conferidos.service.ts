import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SulFluminenseEstoqueAvancadoLotesConferidosService {
  private readonly BASE_URL: string = `https://crm360.monterrey.com.bo/api`;

  constructor(private http: HttpClient) { }

  getLista(params = {}) {
    return this.http.get(`${this.BASE_URL}/abastecimento/relatorios/lotes-conferidos`, {
      params,
      observe: 'response'
    })
  }
}
