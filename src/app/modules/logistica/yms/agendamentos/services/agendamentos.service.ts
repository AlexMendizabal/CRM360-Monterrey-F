//angular
import { Injectable } from '@angular/core';

// services
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ILogisticaYmsAgendamentos } from '../models/agendamentos';

@Injectable({
  providedIn: 'root',
})
export class LogisticaYmsAgendamentosService {
  private readonly API = environment.API;

  constructor(private http: HttpClient) {}


  getAgendamentos(params?) {
    return this.http.get(
      `${this.API}/logistica/yms/agendamentos`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  getAgendamento(id: number) {
    return this.http.get(
      `${this.API}/logistica/yms/agendamentos/${id}`,
      {
        observe: 'response',
      }
    );
  }

  postAgendamentos(etapas: ILogisticaYmsAgendamentos) {
    return this.http.post(
      `${this.API}/logistica/yms/agendamentos`,
      etapas,
      {
        observe: 'response',
      }
    );
  }

  postMateriais(materiais) {
    return this.http.post(
      `${this.API}/logistica/yms/agendamentos/materiais`,
      materiais,
      {
        observe: 'response',
      }
    );
  }
    
  getMateriais(params?) {
    return this.http.get(
      `${this.API}/common/v2/materiais`,
      {
        params: params,
        observe: 'response',
      }
    );
  }
}
