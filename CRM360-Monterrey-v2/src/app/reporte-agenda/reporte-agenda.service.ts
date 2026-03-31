import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ReporteAgendaService {
  private http = inject(HttpClient);
  private readonly API = '/api';

  getReporte(params: any) {
    return this.http.post<any>(`${this.API}/comercial/agenda/reporte`, params, {
      observe: 'response'
    });
  }

  getVendedores() {
    return this.http.get<any>(`${this.API}/comercial/vendedor/lista`);
  }

  getEscritorios() {
    return this.http.get<any>(`${this.API}/common/escritorios`);
  }

  getTitulosAgenda() {
    return this.http.get<any>(`${this.API}/comercial/cadastros/titulos-agenda/lista`);
  }

  getEstados() {
    return this.http.get<any>(`${this.API}/comercial/agenda/estados`);
  }
}
