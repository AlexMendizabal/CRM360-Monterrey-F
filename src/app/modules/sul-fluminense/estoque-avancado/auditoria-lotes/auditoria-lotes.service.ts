import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SulFluminenseAuditoriaLotesService {

  private readonly BASE_URL = environment.API;

  constructor(
    private httpClient : HttpClient
  ) { }

  getLinhas(): Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/common/linhas`,{
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
        // tipo_material: "Sul Fluminense",
        // situacao: "A"

      },
       observe: "response"
    });
  }

  getRelatorioAuditoriaLotes(params): Observable<any> {
    let tipoRelatorio = params["relatorio"];
    let material = params["materiais"] ? params["materiais"] : "0";

    return this.httpClient.get(`${this.BASE_URL}/abastecimento/auditoria-estoque-avancado`,{
      params: {
        "id_tipo": tipoRelatorio,
        "id_material": material
      },
      observe: "response"
    });
  }

  getLotesConferidos(params) {
    return this.httpClient.get(
      `${this.BASE_URL}/abastecimento/relatorios/lotes-conferidos`,
      {
        params,
        observe: "response"
      }
    );
  }
}
