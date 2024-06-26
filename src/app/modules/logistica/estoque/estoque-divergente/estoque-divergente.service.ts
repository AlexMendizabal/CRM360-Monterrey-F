import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin } from 'rxjs';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LogisticaEstoqueEstoqueDivergenteService {
  private readonly BASE_URL: string = `https://23.254.204.187/api`;

  constructor(private http: HttpClient) {}

  getEmpresas() {
    return this.http.get(`${this.BASE_URL}/common/empresas`);
  }

  getDepositos(idEmpresa) {
    return this.http.get(`${this.BASE_URL}/common/depositos/${idEmpresa}`);
  }

  getLinhas() {
    return this.http.get(`${this.BASE_URL}/common/linhas`);
  }

  getClasses(descricaoLinhas) {
    return this.http.get(`${this.BASE_URL}/common/classes`, {
      params: {
        linhas: btoa(descricaoLinhas)
      }
    });
  }

  getMateriais(params = {}) {
    return this.http.get(`${this.BASE_URL}/common/materiais`, {
      params: params
    });
  }
}
