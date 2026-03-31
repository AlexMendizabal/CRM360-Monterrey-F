import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AgendaService {
  private http = inject(HttpClient);
  private readonly API = '/api/comercial/agenda';

  getCompromissos(params: any) {
    let httpParams = new HttpParams();
    for (const key in params) {
      if (params[key] != null && params[key] !== '') {
        httpParams = httpParams.append(key, params[key]);
      }
    }
    return this.http.get<any>(`${this.API}/compromissos/lista`, { params: httpParams });
  }

  getCompromisso(id: any) {
    return this.http.get<any>(`${this.API}/compromissos/detalhes/${id}`);
  }

  getAcessos() {
    return this.http.get<any>(`${this.API}/acessos`);
  }

  getEstados() {
    return this.http.get<any>(`${this.API}/estados`);
  }

  getTitulosAgenda() {
    return this.http.get<any>(`/api/comercial/cadastros/titulos-agenda/lista`);
  }

  getVendedores() {
    return this.http.get<any>(`/api/comercial/vendedor/lista`);
  }

  getEscritorios() {
    return this.http.get<any>(`/api/common/escritorios`);
  }

  save(action: string, record: any) {
    if (action === 'editar') {
      return this.http.post<any>(`${this.API}/compromiso/actualizar`, record);
    } else if (action === 'finalizar') {
      return this.http.post<any>(`${this.API}/compromiso/actualizar`, record);
    } else if (action === 'reagendar') {
      return this.http.post<any>(`${this.API}/compromisso/reagendar`, record);
    } else {
      return this.http.post<any>(`${this.API}/compromisso/salvar`, record);
    }
  }

  deleteCompromisso(id: any) {
    return this.http.post<any>(`${this.API}/compromiso/eliminar`, { id });
  }

  getRuta(id: any) {
    return this.http.get<any>(`${this.API}/getruta/${id}`);
  }
}
