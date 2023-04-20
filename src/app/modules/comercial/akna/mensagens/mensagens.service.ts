import { Injectable } from '@angular/core';

// services
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { IComercialAknaMensagens } from './models/mensagens';

@Injectable({
  providedIn: 'root',
})
export class ComercialAknaMensagensService {
  private readonly API = environment.API;

  constructor(private http: HttpClient) {}
  getMensagens(params?) {
    return this.http.get(
      `${this.API}/comercial/integracoes/akna/lista-mensagens`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  postMensagens(mensagens: IComercialAknaMensagens) {
    return this.http.post(`${this.API}/comercial/akna/mensagens`, mensagens, {
      observe: 'response',
    });
  }
}
