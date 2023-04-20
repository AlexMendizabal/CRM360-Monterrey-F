//angular
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

//services
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminPrestadorServicoPessoasService {

  private readonly API = environment.API;

  constructor(
    private http: HttpClient
  ) { }

  getPessoas(params?) {
    return this.http.get(`${this.API}/core/prestador-servico/pessoas`, {
      params: params,
      observe: "response"
    })
  }

  postPessoa(pessoa: Object) {
    return this.http.post(`${this.API}/core/prestador-servico/pessoa`,
      pessoa,
      { observe: "response" }
    )
  }

}
