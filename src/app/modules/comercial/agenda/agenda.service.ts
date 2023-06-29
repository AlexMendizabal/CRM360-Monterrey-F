import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { take, retry } from 'rxjs/operators';
import { Observable } from 'rxjs';

// Resto del código del servicio

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ComercialAgendaService {
  getruta(id_agenda: any) {
    return this.http.get(`${this.API}/getruta/${id_agenda}`).pipe(take(1), retry(2));
  }

  private readonly API = `http://127.0.0.1:8000/comercial/agenda`;


  constructor(protected http: HttpClient) { }

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

    reporteAgenda(data: any) {
      console.log('entro')
      return this.http.post(`${this.API}/reporte`, data).pipe(take(1), retry(2));
    }

    estadosAgenda(data?: any): Observable<any> {
      const params = data ? { params: data } : {}; // Opcionalmente, incluye los parámetros en la solicitud

      return this.http.get(`${this.API}/estados`, params).pipe(
        take(1),
        retry(2)
      );

    }

  private saveCompromisso(record: any) {
    return this.http
      .post(`${this.API}/compromisso/salvar`, record)
      .pipe(take(1), retry(2));
  }
  // private actualizarCompromiso(record: any) {
  //   return this.http
  //     .post(`${this.API}/compromiso/actualizar`, record)
  //     .pipe(take(1), retry(2));
  // }
  private updateCompromisso(record: any) {
    return this.http
      .post(`${this.API}/compromiso/actualizar`, record)
      .pipe(take(1), retry(2));
  }

  private rescheduleCompromisso(record: any) {
    return this.http
      .post(`${this.API}/compromisso/reagendar`, record)
      .pipe(take(1), retry(2));
  }

  private finalizarCompromisso(record: any) {
    return this.http
      .post(`${this.API}/compromiso/actualizar`, record)
      .pipe(take(1), retry(2));
  }

  save(action: string, record: any) {
    if (action == 'editar') {
      return this.updateCompromisso(record);
    } else if (action == 'finalizar') {
      return this.finalizarCompromisso(record);
    } else if (action == 'reagendar') {
      return this.rescheduleCompromisso(record);
    } else {
      return this.saveCompromisso(record);
    }
  }

  deleteCompromisso(id: any) {
    const record = { id: id };
    return this.http
      .post(`${this.API}/compromiso/eliminar`, record)
      .pipe(take(1), retry(2));
  }

    reporte(params: any) {
      console.log(params);
        return this.http.post(`${this.API}/reporte`, params ).pipe(
          take(1),
          retry(2)
        );
      }
    reporte_cliente(params: any) {
      console.log('entro432')
      console.log(params);
        return this.http.post(`${this.API}/reportecliente`, params ).pipe(
          take(1),
          retry(2)
        );
      }

  getPosicionPromotor(id: any) {
    return this.http.get(`${this.API}/getruta/${id}`).pipe(
      take(1),
      retry(2)
    );
  }
}
