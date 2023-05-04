import { Injectable } from '@angular/core';

// services
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { IAcoes } from './models/acoes';

@Injectable({
  providedIn: 'root',
})
export class ComercialAknaAcoesService {
  private readonly API = environment.API;

  constructor(private http: HttpClient) {}
  getAcoes(params?) {
    return this.http.get(`${this.API}/comercial/integracoes/akna/lista-acoes`, {
      params: params,
      observe: 'response',
    });
  }

  postAcoes(acoes: IAcoes) {
    return this.http.post(`${this.API}/comercial/akna/acoes`, acoes, {
      observe: 'response',
    });
  }
}
