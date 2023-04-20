//angular
import { Injectable } from '@angular/core';

// services
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ITecnologiaInformacaoTipoItem } from '../models/tipoItem';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TecnologiaInformacaoCadastroTipoItemService {
  private readonly API = environment.API;

  constructor(private http: HttpClient) {}

  getTipoItem(params?) {
    return this.http.get(`${this.API}/tecnologia-informacao/item/tipo-item`, {
      params: params,
      observe: 'response',
    });
  }

  postTipoItem(tipoItem: ITecnologiaInformacaoTipoItem) {
    return this.http.post(
      `${this.API}/tecnologia-informacao/item/tipo-item`,
      tipoItem,
      {
        observe: 'response',
      }
    );
  }
}
