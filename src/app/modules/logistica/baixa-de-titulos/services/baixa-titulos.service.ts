//angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// services
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LogisticaBaixaTitulosService {

  private readonly API = `http://23.254.204.187/api/api`;

  constructor(
    private http: HttpClient
  ) { }

  getTitulos(parametro, params) {
    return this.http.post(`${this.API}/logistica/baixa-titulo/${parametro}`,
      params,
      { observe: "response" })
  }
}
