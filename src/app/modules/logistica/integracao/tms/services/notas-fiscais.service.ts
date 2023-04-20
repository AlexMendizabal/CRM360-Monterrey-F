import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LogisticaIntegracoesTMSService {

  private API = environment.API;

  constructor(
    private http: HttpClient
  ) { }

  getNotasFiscaisTID(params?) {
    return this.http.get(`${this.API}/logistica/integracoes/senior/tms/tid/notas-fiscais`, {
      params: params,
      observe: "response"
    })
  }
}
