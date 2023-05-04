import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SulFluminenseFiltroService {

  private readonly BASE_URL = environment.API;

  constructor(
    private httpClient : HttpClient
  ) {}

  getLinhas(): Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/common/linhas`, {
      observe: "response"
    });
  }

  getClasses(descricaoLinhas): Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/common/classes`, {
      params: {
        linhas: btoa(descricaoLinhas) 
      },
      observe: "response"
    });
  }

  getMateriais(descricaoLinhas, idClasses): Observable<any> {
    if (!idClasses)
      idClasses = "";

    return this.httpClient.get(`${this.BASE_URL}/common/materiais`, {
      params: {
        linhas: btoa(descricaoLinhas),
        classes: btoa(idClasses),
        tipo_material: "Sul Fluminense",
        situacao: "A"

      },
       observe: "response"
    });
  }

  getUnidades(): Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/abastecimento/unidades`, {
      observe: "response"
    });
  }

  getFiltroNivelCritico(): Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/abastecimento/cadastros/niveis-criticos`, {
      observe: "response"
    });
  }

}
