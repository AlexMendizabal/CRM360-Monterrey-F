import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LogisticaSoftranCentroCustoVeiculoService {

  private readonly API = `https://23.254.204.187/api`;

  constructor(private http: HttpClient) { }

  getCentroCustoVeiculo(params?) {
    return this.http.get(`${this.API}/softran-ideal/centro-custo-veiculo`, {
      params: params,
      observe: "response"
    });
  }

}
