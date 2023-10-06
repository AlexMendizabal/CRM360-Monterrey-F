import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LogisticaEstoquePainelInventarioInventarioMateriaisNotasFiscaisService {
  private readonly BASE_URL: string = `https://crm360.monterrey.com.bo/api`;

  constructor(private http: HttpClient) {}

  getNotasFiscais(idInventario, nrNotaFiscal, cdEmp) {
    return this.http.get(
      `${this.BASE_URL}/logistica/estoque/inventarios/${idInventario}/notas-fiscais`,
      {
        params: {
          nrNotaFiscal: nrNotaFiscal,
          cdEmp: cdEmp
        },
        observe: 'response',
      }
    );
  }

  getMateriaisNotasFiscais(idInventario, notaFiscal) {
    return this.http.get(
      `${this.BASE_URL}/logistica/estoque/inventarios/${idInventario}/nota-fiscal/${notaFiscal}`,
      {
        observe: 'response',
      }
    );
  }

  salvarNotasFiscais(idInventario, notasFiscais, matriculaAuditor) {
    return this.http.put(
      `${this.BASE_URL}/logistica/estoque/inventarios/${idInventario}/notas-fiscais`,
      {
        notasFiscais: notasFiscais,
        matriculaAuditor: matriculaAuditor,
      },
      { observe: 'response' }
    );
  }

  getInventario(cdInventario) {
    return this.http.get(`${this.BASE_URL}/logistica/estoque/inventarios`, {
      params: {cdInventario: cdInventario
      },
      observe: 'response'
    });
  }
}
