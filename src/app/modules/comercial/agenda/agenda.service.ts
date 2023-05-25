import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { take, retry } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ComercialAgendaService {
  private readonly API = `https://crm360.monterrey.com.bo/api/comercial/agenda`;

  constructor(protected http: HttpClient) {}

  getAcessos() {
    return this.http.get(`${this.API}/acessos`).pipe(take(1), retry(2));
  }

  getCompromissos(params: any) {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/compromissos/lista`, { params: httpParams })
      .pipe(take(1), retry(2));
  }

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
  private saveCompromisso2(record: any) {
    return this.http
      .post(`${this.API}/compromiso/actualizar`, record)
      .pipe(take(1), retry(2));
  }

  private updateCompromisso(record: any) {
    return this.http
      .post(`${this.API}/compromiso/actualizar` , record)
      .pipe(take(1), retry(2));
  }

  private rescheduleCompromisso(record: any) {
    return this.http
      .post(`${this.API}/compromisso/reagendar`, record)
      .pipe(take(1), retry(2));
  }

  private finalizarCompromisso(record: any) {
    return this.http
      .post(`${this.API}/compromiso/finalizar`, record)
      .pipe(take(1), retry(2));
  }

  save(action: string, record: any) {

    if (action == 'editar' || action == 'finalizar') {
      return this.updateCompromisso(record);
    } else if (action == 'reagendar') {
      return this.rescheduleCompromisso(record);
    }

    return this.saveCompromisso(record);
  }

  deleteCompromisso(id: any) {
    const record = { id: id };
    return this.http
      .post(`${this.API}/compromiso/eliminar`, record)
      .pipe(take(1), retry(2));
  }

}
