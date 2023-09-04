import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { take } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContatosService {
  private readonly API = `http://23.254.204.187/api/core/mtcorp/usuarios`;

  constructor(protected http: HttpClient) { }

  getContatos(params: any) {

    //let httpParams = new HttpParams();

    /* for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    } */

    return this.http
      .get(`${this.API}`, {
        params: params,
        observe: "response"
      })
      .pipe(take(1));
  }

  // Método obsoleto, aponta para a tabela do MTCorp 1
  getDetalhes(matricula: number) {
    return this.http.get(`${this.API}/detalhes/${matricula}`).pipe(take(1));
  }
}
