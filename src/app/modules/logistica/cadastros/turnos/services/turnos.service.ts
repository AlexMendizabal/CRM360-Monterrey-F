//angular
import { Injectable } from '@angular/core';

// services
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ILogisticaTurnos } from '../models/turnos';

@Injectable({
  providedIn: 'root',
})
export class LogisticaTurnosService {
  private readonly API = environment.API;

  constructor(private http: HttpClient) {}


  getTurnos(params?) {
    return this.http.get(
      `${this.API}/logistica/turnos`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  getTurno(id: string) {
    return this.http.get(
      `${this.API}/logistica/turnos/${id}`,
      {
        observe: 'response',
      }
    );
  }

  postTurnos(turno: ILogisticaTurnos) {
    return this.http.post(
      `${this.API}/logistica/turnos`,
      turno,
      {
        observe: 'response',
      }
    );
  }
}
