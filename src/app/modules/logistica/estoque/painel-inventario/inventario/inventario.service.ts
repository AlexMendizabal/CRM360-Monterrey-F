import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DateService } from 'src/app/shared/services/core/date.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LogisticaEstoquePainelInventarioInventarioService {
  private readonly BASE_URL: string = `https://23.254.204.187/api`;

  constructor(private http: HttpClient, private dateService: DateService) {}

  getInventario(params?) {
    return this.http.get(`${this.BASE_URL}/logistica/estoque/inventarios`, {
      params: params,
      observe: 'response'
    });
  }

  getClassesInventario(idInventario) {
    return this.http.get(
      `${this.BASE_URL}/logistica/estoque/inventarios/classes/${idInventario}`,
      {
        observe: 'response'
      }
    );
  }

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

  getMateriais(descricaoLinhas, idClasses) {
    if (!idClasses) idClasses = '';

    return this.http.get(`${this.BASE_URL}/common/materiais`, {
      params: {
        linhas: btoa(descricaoLinhas),
        classes: btoa(idClasses)
      }
    });
  }
}
