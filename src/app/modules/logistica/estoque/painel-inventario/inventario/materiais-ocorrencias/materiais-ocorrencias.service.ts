import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LogisticaEstoquePainelInventarioInventarioMateriaisOcorrenciasService {
  private readonly BASE_URL: string = `http://127.0.0.1:8000/api`;

  constructor(private http: HttpClient) { }

  getInventario(cdInventario) {
    return this.http.get(`${this.BASE_URL}/logistica/estoque/inventarios`, {
      params: {cdInventario: cdInventario
      },
      observe: 'response'
    });
  }

  getOcorrencias(idInventario, params) {
    return this.http.get(
      `${this.BASE_URL}/logistica/estoque/inventarios/${idInventario}/ocorrencias`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  getMateriaisNotasFiscais(idInventario, ocorrencia) {
    return this.http.get(
      `${this.BASE_URL}/logistica/estoque/inventarios/${idInventario}/ocorrencias/${ocorrencia}`,
      {
        observe: 'response',
      }
    );
  }

  salvarNotasFiscais(idInventario, ocorrencias, matriculaAuditor) {
    return this.http.put(
      `${this.BASE_URL}/logistica/estoque/inventarios/${idInventario}/ocorrencias`,
      {
        notasFiscais: ocorrencias,
        matriculaAuditor: matriculaAuditor,
      },
      { observe: 'response' }
    );
  }
}
