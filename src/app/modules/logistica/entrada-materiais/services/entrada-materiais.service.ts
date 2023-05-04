import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { take, retry } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LogisticaEntradaMateriaisService {
  private readonly API = `https://crm360.monterrey.com.bo/api`;

  constructor(protected http: HttpClient) {}

  getAcessos() {
    return this.http.get(`${this.API}/acessos`).pipe(take(1), retry(2));
  }

  getFornecedores(params?) {
    return this.http.get(
      `${this.API}/common/v2/fornecedores`,
      {
        params: params,
        observe: 'response',
      }
    );
  }
  getDepositos(params?) {
    return this.http.get(
      `${this.API}/common/v2/depositos`,
      {
        params: params,
        observe: 'response',
      }
    );
  }
  
  getAllMateriais(params?) {
    return this.http.get(
      `${this.API}/common/v2/materiais`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  getEmpresas(params?) {
    return this.http.get(
      `${this.API}/common/v2/empresas`,
      {
        params: params,
        observe: 'response',
      }
    );
  }
}