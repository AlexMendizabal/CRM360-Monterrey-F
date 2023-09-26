import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LogisticaDashboardsAnaliseFreteService {

  private readonly API = `https://crm360.monterrey.com.bo/api`;

  constructor(private http: HttpClient) { }


  getIndicadores(params){
    return this.http.get(`${this.API}/logistica/dashboards/analise-frete`, {
      params: params,
      observe: "response"
    })
  }

  getRotulos(params?){
    return this.http.get(`${this.API}/logistica/dashboards/analise-frete/rotulos`, {
      params: params,
      observe: "response"
    })
  }

}
