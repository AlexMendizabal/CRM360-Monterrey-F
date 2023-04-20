import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { IAdimAtividade } from './../models/atividade';
import { retry, take } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminAtividadesService {

  private readonly API: string = environment.API;

  constructor(private http: HttpClient, private router: Router) { }

  getAtividades(atividade = {}) {
    return this.http.get(`${this.API}/core/atividades`, {
      params: atividade,
      observe: "response"
    });
  }

  getAtividade(id) {
    return this.http.get(`${this.API}/core/atividades/${id}`, {
      observe: "response"
    });
  }

  postAtividade(atividade) {
    return this.http.post(`${this.API}/core/atividades`,
      atividade,
      {
        observe: "response"
      });
  }

  getTipoAtividade() {
    return this.http.get(`${this.API}/core/atividades/tipos`, {
      observe: "response"
    });
  }

  registrarAcesso(idAtividade?: number) {
    return this.http
      .post(`https://crm360.monterrey.com.bo/api/core/registrar-acesso`, {
        idAtividade: idAtividade,
        dsRota: this.router.url,
      })
      .pipe(take(1), retry(2));
  }
}
