//angular
import { Injectable } from '@angular/core';

// services
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ITecnologiaInformacaoEstoqueMarcas } from '../models/marcas';

@Injectable({
  providedIn: 'root',
})
export class TecnologiaInformacaoEstoqueMarcasService {
  private readonly API = environment.API;

  constructor(private http: HttpClient) {}

  getMarcas(params?) {
    return this.http.get(
      `${this.API}/tecnologia-informacao/estoque/produtos/marcas`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  postMarcas(marca: ITecnologiaInformacaoEstoqueMarcas) {
    return this.http.post(
      `${this.API}/tecnologia-informacao/estoque/produtos/marcas`,
      marca,
      {
        observe: 'response',
      }
    );
  }
}
