//angular
import { Injectable } from '@angular/core';

// services
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ILogisticaEntradaMateriaisNotasFiscais } from '../models/notasFiscais';

@Injectable({
  providedIn: 'root',
})
export class LogisticaEntradaMateriaisNotasFiscaisService {
  private readonly API = environment.API;

  constructor(private http: HttpClient) {}


  getNotasFiscais(params?) {
    return this.http.get(
      `${this.API}/logistica/entrada-materiais/notas-fiscais`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  getExport(params?) {
    return this.http.get(
      `${this.API}/logistica/entrada-materiais/notas-fiscais/relatorio`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  getAlteracoes(params?) {
    return this.http.get(
      `${this.API}/logistica/entrada-materiais/notas-fiscais/historico`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  getLotesDuplicados(params?) {
    return this.http.get(
      `${this.API}/logistica/entrada-materiais/notas-fiscais/materiais/lotes-duplicados`,
      {
        params: params,
        observe: 'response',
      }
    );
  }
  postNotasDuplicadas(notas: ILogisticaEntradaMateriaisNotasFiscais) {
    return this.http.post(
      `${this.API}/logistica/entrada-materiais/notas-fiscais/materiais/lotes-duplicados`,
      notas,
      {
        observe: 'response',
      }
    );
  }


  postNotasFiscais(notas) {
    return this.http.post(
      `${this.API}/logistica/entrada-materiais/notas-fiscais`,
      notas,
      {
        observe: 'response',
      }
    );
  }
  
  getHistoricoMateriais(params?) {
    return this.http.get(
      `${this.API}/logistica/entrada-materiais/notas-fiscais/materiais/historico`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  getNotasMateriais(params?) {
    return this.http.get(
      `${this.API}/logistica/entrada-materiais/notas-fiscais/materiais`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  postMateriais(notas) {
    return this.http.post(
      `${this.API}/logistica/entrada-materiais/notas-fiscais/materiais`,
      notas,
      {
        observe: 'response',
      }
    );
  }
}
