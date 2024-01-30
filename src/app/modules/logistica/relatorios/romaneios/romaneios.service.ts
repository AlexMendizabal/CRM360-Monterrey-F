import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LogisticaRelatoriosRomaneiosService {

  private readonly API: string = `https://23.254.204.187/api`

  constructor(
    private http: HttpClient) { }

  getEmpresas(matricula) {
    return this.http.get(`${this.API}/logistica/associacao-usuario-empresa/${matricula}`, {
      params: {
        "parametro": "4"
      },
      observe: "response"
    })
  }

  getRomaneiosSinteticos(params) {
    return this.http.get(`${this.API}/logistica/romaneios`, {
      params: params,
      observe: "response"
    });
  }

  getRomaneiosAnaliticos(params) {
    return this.http.get(`${this.API}/logistica/romaneios/analiticos`, {
      params: params,
      observe: "response"
    });
  }

  getCtesComplementares(params){
    return this.http.get(`${this.API}/logistica/indicadores/cte-complementar`, {
      params:params,
      observe: "response"
    })
  }
}
