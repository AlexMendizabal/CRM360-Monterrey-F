import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ComercialGestaoAssociacoesCoordenadoresEscritoriosService {
  private readonly API = `http://127.0.0.1:8000/comercial/gestao/associacao-coordenadores`;

  constructor(protected http: HttpClient) {}

  getListaCoordenadoresEscritorios() {
    return this.http.get(`${this.API}/lista`).pipe(take(1));
  }

  putAssociacaoCoordenadorEscritorio(data: any) {
    return this.http.put(`${this.API}/salvar`, data).pipe(take(1));
  }
}
