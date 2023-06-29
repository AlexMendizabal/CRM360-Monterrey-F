import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LogisticaEstoqueInventarioFiltroService {
  private readonly API: string = `http://127.0.0.1:8000/api`;

  constructor(private http: HttpClient) {}

  getEmpresas() {
    return this.http.get(`${this.API}/common/empresas`);
  }

  getDepositos(idEmpresa) {
    return this.http.get(`${this.API}/common/depositos/${idEmpresa}`);
  }

  getLinhas() {
    return this.http.get(`${this.API}/common/linhas`);
  }

  getClasses(descricaoLinhas) {
    return this.http.get(`${this.API}/common/classes`, {
      params: {
        linhas: btoa(descricaoLinhas)
      }
    });
  }

  getMateriais(descricaoLinhas, idClasses) {
    if (!idClasses) idClasses = '';

    return this.http.get(`${this.API}/common/materiais`, {
      params: {
        linhas: btoa(descricaoLinhas),
        classes: btoa(idClasses)
      }
    });
  }

  postCadastraInventario(
    matriculaAuditor,
    cdEmpresa,
    cdDeposito,
    tipoInventario
  ) {
    return this.http.post(
      `${this.API}/logistica/estoque/inventario`,
      {
        matriculaAuditor: matriculaAuditor,
        cdEmpresa: cdEmpresa,
        cdDeposito: cdDeposito,
        tipoInventario: tipoInventario
      },
      { observe: 'response' }
    );
  }

  postMateriais(matriculaAuditor, idInventario, cdMaterial) {
    return this.http.post(
      `${this.API}/logistica/estoque/inventario/${idInventario}/materiais`,
      {
        matriculaAuditor: matriculaAuditor,
        idInventario: idInventario,
        cdMaterial: cdMaterial
      },
      { observe: 'response' }
    );
  }

  getPerfil(matricula = '') {
    return this.http.get(
      `${this.API}/logistica/estoque/inventario/usuarios/${matricula}/perfis/controle-acesso`
    );
  }
}
