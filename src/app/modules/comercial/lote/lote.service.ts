import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { take, retry } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ComercialLoteService {
  private readonly API = `https://crm360.monterrey.com.bo/api/comercial`;

  constructor(protected http: HttpClient) {}

  getAcessos() {
    return this.http.get(`${this.API}/acessos`).pipe(take(1), retry(2));
  }

/*   getRutaClientes(params: any) {
    return this.http.get(`${this.API}/ruta/clientes`, { params }).pipe(
      take(1),
      retry(2)
    );
  } */
  
 /*  getCompromissos(params: any) {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/compromissos/lista`, { params: httpParams })
      .pipe(take(1), retry(2));
  }
 */

/* 
  getCompromisso(id: any) {
    return this.http
      .get(`${this.API}/compromissos/detalhes/${id}`)
      .pipe(take(1), retry(2));
  }

  private saveCompromisso(record: any) {
    return this.http
      .post(`${this.API}/compromisso/salvar`, record)
      .pipe(take(1), retry(2));
  }

  private updateCompromisso(record: any) {
    return this.http
      .put(`${this.API}/compromisso/atualizar`, record)
      .pipe(take(1), retry(2));
  }

  private rescheduleCompromisso(record: any) {
    return this.http
      .put(`${this.API}/compromisso/reagendar`, record)
      .pipe(take(1), retry(2));
  }

  save(action: string, record: any) {
    if (action == 'editar') {
      return this.updateCompromisso(record);
    } else if (action == 'reagendar') {
      return this.rescheduleCompromisso(record);
    }

    return this.saveCompromisso(record);
  }

  deleteCompromisso(id: any) {
    return this.http
      .delete(`${this.API}/compromisso/excluir/${id}`)
      .pipe(take(1), retry(2));
  } */
}
