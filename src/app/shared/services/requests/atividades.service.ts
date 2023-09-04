import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { take, retry } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AtividadesService {
  private readonly API = `http://23.254.204.187/api/common/atividades`;

  constructor(protected http: HttpClient, private router: Router) {}

  registrarAcesso(idAtividade?: number) {
    return this.http
      .post(`http://23.254.204.187/api/core/registrar-acesso`, {
        idAtividade: idAtividade,
        dsRota: this.router.url,
      })
      .pipe(take(1), retry(2));
  }

  getAtividades(idModulo: number) {
    return this.http
      .get(`${this.API}/listar/${idModulo}`)
      .pipe(take(1), retry(2));
  }

  getAtividade(idAtividade: number) {
    return this.http
      .get(`${this.API}/atividade/${idAtividade}`)
      .pipe(take(1), retry(2));
  }

  getAtividadesInternas(idSubModulo: number) {
    return this.http
      .get(`${this.API}/internas/listar/${idSubModulo}`)
      .pipe(take(1), retry(2));
  }

  getDetalhes(idAtividade: number) {
    return this.http
      .get(`${this.API}/detalhes/${idAtividade}`)
      .pipe(take(1), retry(2));
  }
}
