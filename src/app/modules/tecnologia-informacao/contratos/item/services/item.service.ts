import { take } from 'rxjs/operators';
//angular
import { Injectable } from '@angular/core';

// services
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ITecnologiaInformacaoItem } from '../models/item';

@Injectable({
  providedIn: 'root',
})
export class TecnologiaInformacaoCadastroItemService {
  private readonly API = environment.API;

  constructor(private http: HttpClient) {}

  //-----------------------------------ITENS--------------------------\\

  getItem(params?) {
    return this.http.get(`${this.API}/tecnologia-informacao/itens`, {
      params: params,
      observe: 'response',
    });
  }

  getUsuariosSituacoes() {
    return this.http
      .get(`${this.API}/tecnologia-informacao/situacao-usuario`)
      .pipe(take(1));
  }

  postItem(item: ITecnologiaInformacaoItem) {
    return this.http.post(`${this.API}/tecnologia-informacao/item`, item, {
      observe: 'response',
    });
  }

  //-----------------------------------Docuementos--------------------------\\
  getDocumento(params) {
    return this.http.get(`${this.API}/tecnologia-informacao/item/documentos`, {
      params: params,
      observe: 'response',
    });
  }

  postDocumento(params, ID_TECN_INFO_ITEM: number) {
    return this.http.post(
      `${this.API}/tecnologia-informacao/item/documento?ID_TECN_INFO_ITEM=${ID_TECN_INFO_ITEM}`,
      params,
      {
        observe: 'response',
      }
    );
  }

  putDocumento(params) {
    return this.http.put(
      `${this.API}/tecnologia-informacao/item/documento`,
      params,
      {
        observe: 'response',
      }
    );
  }
}
