import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TecnologiaInformacaoFuncionariosService {
  private readonly API = environment.API;

  constructor(private http: HttpClient) {}

  getFuncionario(params?) {
    return this.http.get(`${this.API}/tecnologia-informacao/funcionarios`, {
      params: params,
      observe: 'response',
    });
  }
  
  getUsuarios(params?) {
    return this.http.get(
      `${this.API}/core/mtcorp/usuarios`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  getCentroCusto(params?) {
    return this.http.get(`${this.API}/tecnologia-informacao/centro-custo`, {
      params: params,
      observe: 'response',
    });
  }
}
