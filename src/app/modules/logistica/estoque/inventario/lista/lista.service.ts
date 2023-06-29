import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LogisticaEstoqueInventarioListaService {
  private readonly API: string = `http://127.0.0.1:8000/api`;

  constructor(private http: HttpClient) {}

  getLista(
    idInventario,
    matricula = '',
    cdMaterial = '',
    naoConsideraEstoqueZerado
  ) {
    return this.http.get(
      `${this.API}/logistica/estoque/inventario/${idInventario}/materiais`,
      {
        params: {
          idInventario: idInventario,
          matricula: matricula,
          cdMaterial: cdMaterial,
          naoConsideraEstoqueZerado: naoConsideraEstoqueZerado
        }
      }
    );
  }

  getListaMateriaisParaFiltro(idInventario, matricula = '') {
    return this.http.get(
      `${this.API}/logistica/estoque/inventario/${idInventario}/materiais`,
      {
        params: {
          idInventario: idInventario,
          matricula: matricula,
          naoConsideraEstoqueZerado: '0',
          qtPagina: '1000'
        },
        observe: 'response'
      }
    );
  }

  postSalvar(requisicao, idInventario) {
    return this.http.post(
      `${this.API}/logistica/estoque/inventario/${idInventario}/materiais/lancamento`,
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
      `${this.API}/logistica/estoque/inventario/${idInventario}`,
      {
        observacao: observacao,
        idStatusInventario: idStatusInventario,
        matriculaAuditor: matriculaAuditor
      },
      { observe: 'response' }
    );
  }

  getInfoInventario(idInventario) {
    return this.http.get(
      `${this.API}/logistica/estoque/inventario/${idInventario}`
    );
  }

  getNotasFiscais(idInventario, nrNotaFiscal) {
    return this.http.get(
      `${this.API}/logistica/estoque/inventario/${idInventario}/notas-fiscais`,
      {
        params: {
          nrNotaFiscal: nrNotaFiscal
        },
        observe: 'response'
      }
    );
  }

  getMateriaisNotasFiscais(idInventario, notaFiscal) {
    return this.http.get(
      `${this.API}/logistica/estoque/inventario/${idInventario}/nota-fiscal/${notaFiscal}`,
      {
        observe: 'response'
      }
    );
  }

  salvarNotasFiscais(idInventario, notasFiscais, matriculaAuditor) {
    return this.http.put(
      `${this.API}/logistica/estoque/inventario/${idInventario}/notas-fiscais`,
      {
        notasFiscais: notasFiscais,
        matriculaAuditor: matriculaAuditor
      },
      { observe: 'response' }
    );
  }

  getNotasFiscaisRo(idInventario, nrNotaFiscalRo) {
    return this.http.get(
      `${this.API}/logistica/estoque/inventario/${idInventario}/notas-fiscais`,
      {
        params: {
          nrNotaFiscalRo: nrNotaFiscalRo
        },
        observe: 'response'
      }
    );
  }

  getMateriaisNotasFiscaisRo(idInventario, notaFiscalRo) {
    return this.http.get(
      `${this.API}/logistica/estoque/inventario/${idInventario}/nota-fiscal/${notaFiscalRo}`,
      {
        observe: 'response'
      }
    );
  }

  salvarNotasFiscaisRo(idInventario, notasFiscaisRo, matriculaAuditor) {
    return this.http.put(
      `${this.API}/logistica/estoque/inventario/${idInventario}/notas-fiscais`,
      {
        notasFiscaisRo: notasFiscaisRo,
        matriculaAuditor: matriculaAuditor
      },
      { observe: 'response' }
    );
  }

  getInfoInventarioRotativo(idInventario, cdMaterial) {
    return this.http.get(
      `${this.API}/logistica/estoque/inventario-rotativo/${idInventario}/material/${cdMaterial}`,
      {
        observe: 'response'
      }
    );
  }

  getPerfil(matricula = '') {
    return this.http.get(
      `${this.API}/logistica/estoque/inventario/usuarios/${matricula}/perfis/controle-acesso`
    );
  }

  getTotal(idInventario) {
    return this.http.get(
      `${this.API}/logistica/estoque/inventario/${idInventario}/resultado`
    );
  }
}
