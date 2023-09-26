import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LogisticaEstoquePainelInventarioInventarioListaService {
  private readonly BASE_URL: string = `https://crm360.monterrey.com.bo/api`;

  constructor(private http: HttpClient) {}

  getLista(
    idInventario,
    matricula = '',
    cdMaterial = '',
    naoConsideraEstoqueZerado
  ) {
    return this.http.get(
      `${this.BASE_URL}/logistica/estoque/inventarios/${idInventario}/materiais`,
      {
        params: {
          idInventario: idInventario,
          matricula: matricula,
          cdMaterial: cdMaterial,
          naoConsideraEstoqueZerado: naoConsideraEstoqueZerado,
        },
      }
    );
  }

  getListaMateriaisParaFiltro(idInventario, matricula = '') {
    return this.http.get(
      `${this.BASE_URL}/logistica/estoque/inventarios/${idInventario}/materiais`,
      {
        params: {
          idInventario: idInventario,
          matricula: matricula,
          naoConsideraEstoqueZerado: '0',
          qtPagina: '1000',
        },
        observe: 'response',
      }
    );
  }

  postSalvar(requisicao, idInventario) {
    return this.http.post(
      `${this.BASE_URL}/logistica/estoque/inventario/${idInventario}/materiais/lancamento`,
      requisicao,
      { observe: 'response' }
    );
  }

  atualizarInventario(
    observacao = '',
    idStatusInventario,
    idInventario,
    matriculaAuditor
  ) {
    return this.http.put(
      `${this.BASE_URL}/logistica/estoque/inventarios/${idInventario}`,
      {
        observacao: observacao,
        idStatusInventario: idStatusInventario,
        matriculaAuditor: matriculaAuditor,
      },
      { observe: 'response' }
    );
  }

  getInfoInventario(idInventario) {
    return this.http.get(
      `${this.BASE_URL}/logistica/estoque/inventario/${idInventario}`
    );
  }

  getNotasFiscaisRo(idInventario, nrNotaFiscalRo) {
    return this.http.get(
      `${this.BASE_URL}/logistica/estoque/inventario/${idInventario}/notas-fiscais`,
      {
        params: {
          nrNotaFiscalRo: nrNotaFiscalRo,
        },
        observe: 'response',
      }
    );
  }

  getMateriaisNotasFiscaisRo(idInventario, notaFiscalRo) {
    return this.http.get(
      `${this.BASE_URL}/logistica/estoque/inventario/${idInventario}/nota-fiscal/${notaFiscalRo}`,
      {
        observe: 'response',
      }
    );
  }

  salvarNotasFiscaisRo(idInventario, notasFiscaisRo, matriculaAuditor) {
    return this.http.put(
      `${this.BASE_URL}/logistica/estoque/inventario/${idInventario}/notas-fiscais`,
      {
        notasFiscaisRo: notasFiscaisRo,
        matriculaAuditor: matriculaAuditor,
      },
      { observe: 'response' }
    );
  }

  getInfoInventarioRotativo(idInventario, cdMaterial) {
    return this.http.get(
      `${this.BASE_URL}/logistica/estoque/inventario-rotativo/${idInventario}/material/${cdMaterial}`,
      {
        observe: 'response',
      }
    );
  }

  getPerfil(matricula = '') {
    return this.http.get(
      `${this.BASE_URL}/logistica/estoque/inventario/usuarios/${matricula}/perfis/controle-acesso`
    );
  }

  getTotal(idInventario) {
    return this.http.get(
      `${this.BASE_URL}/logistica/estoque/inventarios/${idInventario}/resultado`,
      {
        observe: 'response',
      }
    );
  }
}
