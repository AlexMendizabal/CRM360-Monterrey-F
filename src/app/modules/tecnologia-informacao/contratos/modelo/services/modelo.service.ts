//angular
import { Injectable } from '@angular/core';

// services
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ITecnologiaInformacaoModelo } from '../models/modelo';

@Injectable({
  providedIn: 'root',
})
export class TecnologiaInformacaoCadastroModeloService {
  private readonly API = environment.API;

  constructor(private http: HttpClient) {}

  getModelo(params?) {
    return this.http.get(`${this.API}/tecnologia-informacao/item/modelos`, {
      params: params,
      observe: 'response',
    });
  }

  postModelo(modelo: ITecnologiaInformacaoModelo) {
    return this.http.post(
      `${this.API}/tecnologia-informacao/item/modelo`,
      modelo,
      {
        observe: 'response',
      }
    );
  }
}
