import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LogisticaEstoquePainelInventarioCadastroService {
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

  getMateriais(descricaoLinhas, idClasses) {
    if (!idClasses) idClasses = '';

    return this.http.get(`${this.BASE_URL}/common/materiais`, {
      params: {
        linhas: btoa(descricaoLinhas),
        classes: btoa(idClasses)
      }
    });
  }

  postCadastraInventario(params) {
    return this.http.post(
      `${this.BASE_URL}/logistica/estoque/inventarios`,
      params,
      { observe: 'response' }
    );
  }

  postMateriais(matriculaAuditor, idInventario, cdMaterial) {
    return this.http.post(
      `${this.BASE_URL}/logistica/estoque/inventarios/${idInventario}/materiais`,
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
      `${this.BASE_URL}/logistica/estoque/inventario/usuarios/${matricula}/perfis/controle-acesso`
    );
  }
}
