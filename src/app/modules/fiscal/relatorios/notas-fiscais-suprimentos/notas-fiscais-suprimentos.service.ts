import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FiscalRelatoriosNotasFiscaisSuprimentosService {
  private readonly BASE_URL: string = `https://crm360.monterrey.com.bo/api`;

  constructor(private http: HttpClient) {}

  getRelatorio() {
    return this.http.get(
      `${this.BASE_URL}/fiscal/relatorios/relatoriosNotasFiscais/documentos/tipos`
    );
  }

  getFormaPagamento() {
    return this.http.get(
      `${this.BASE_URL}/fiscal/relatorios/relatoriosNotasFiscais/pagamentos/formas`
    );
  }

  getLista(data) {
    return this.http.get(
      `${this.BASE_URL}/fiscal/relatorios/relatoriosNotasFiscais/suprimentos/notasFiscais`,
      {
        params: {
          dtInicial: data.params.dataInicio,
          dtFinal: data.params.dataFim,
          tipoDocumento: data.params.tipoDocumento
            ? data.params.tipoDocumento
            : null,
          numeroNota: data.params.numeroNota ? data.params.numeroNota : null,
          cnpjFatSup: data.params.cnpjFatSup ? data.params.cnpjFatSup : null,
          cnpjFatFin: data.params.cnpjFatFin ? data.params.cnpjFatFin : null,
          cnpjFor: data.params.cnpjFor ? data.params.cnpjFor : null,
          razaoFor: data.params.razaoFor ? data.params.razaoFor : null,
          formaPag: data.params.formaPagamento
            ? data.params.formaPagamento
            : null,
          pagina: data.pagina
        },
        observe: 'response'
      }
    );
  }
}
