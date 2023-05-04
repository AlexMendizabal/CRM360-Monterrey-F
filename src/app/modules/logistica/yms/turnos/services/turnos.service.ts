//angular
import { Injectable } from '@angular/core';

// services
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ILogisticaYmsTurnos } from '../models/turnos';

@Injectable({
  providedIn: 'root',
})
export class LogisticaYmsTurnosService {
  private readonly API = environment.API;

  constructor(private http: HttpClient) {}


  getTurnos(params?) {
    return this.http.get(
      `${this.API}/logistica/yms/turnos`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  getTurno(id: number) {
    return this.http.get(
      `${this.API}/logistica/yms/turnos/${id}`,
      {
        observe: 'response',
      }
    );
  }

  postTurnos(turno: ILogisticaYmsTurnos) {
    return this.http.post(
      `${this.API}/logistica/yms/turnos`,
      turno,
      {
        observe: 'response',
      }
    );
  }
}
