import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LogisticaEntergaRestricoesService {

  API = environment.API;

  constructor(
    private http: HttpClient
  ) { }

  getRestricoes(params?) {
    return this.http.get(`${this.API}/logistica/restricoes-transporte`, {
      params: params,
      observe: "response"
    });
  }

  getRestricao(uuid: string) {
    return this.http.get(`${this.API}/logistica/restricoes-transporte/${uuid}`, {
      observe: "response"
    });
  }

  postRestricoes(params) {
    return this.http.post(`${this.API}/logistica/restricoes-transporte`, params, {
      observe: "response"
    })
  }

  postMateriaisAssociados(params) {
    return this.http.post(`${this.API}/logistica/restricoes-transporte/materiais`, params, {
      observe: "response"
    })
  }

  getMateriais(params?){
    return this.http.get(`${this.API}/logistica/entrada-materiais/materiais`, {
      params: params,
      observe: "response"
    })
  }

  getMateriaisAssociados(params?){
    return this.http.get(`${this.API}/logistica/restricoes-transporte/materiais`, {
      params: params,
      observe: "response"
    });
  }

}
