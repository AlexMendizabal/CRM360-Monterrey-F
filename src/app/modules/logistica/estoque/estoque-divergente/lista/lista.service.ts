import { observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LogisticaEstoqueEstoqueDivergenteListaService {
  private readonly BASE_URL: string = `https://crm360.monterrey.com.bo/api`;

  constructor(private http: HttpClient) {}

  getLista(data) {
    return this.http.get(`${this.BASE_URL}/abastecimento/estoque-divergente`, {
      params: {
        dtInicial: data.dataInicio,
        cdEmpresa: data.empresas,
        depositos: btoa(data.depositos),
        linhas: btoa(data.linhas),
        classes: btoa(data.classes),
        materiais: btoa(data.codigoMaterial)
      },
      observe: 'response'
    });
  }

  getData(data) {
    return this.http.get(
      `${this.BASE_URL}/abastecimento/estoque-divergente/data`,
      {
        params: {
          dtInicial: data.dataInicio,
          cdEmpresa: data.deposito,
          cdMaterial: data.codigoMaterial
        },
        observe: 'response'
      }
    );
  }
}
