//angular
import { Injectable } from '@angular/core';

// services
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ILogisticaYmsChecklist } from '../models/checklist';

@Injectable({
  providedIn: 'root',
})
export class LogisticaYmsChecklistService {
  private readonly API = environment.API;

  constructor(private http: HttpClient) {}


  getChecklist(params?) {
    return this.http.get(
      `${this.API}/logistica/yms/checklist`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  postChecklist(checklist: ILogisticaYmsChecklist) {
    return this.http.post(
      `${this.API}/logistica/yms/checklist`,
      checklist,
      {
        observe: 'response',
      }
    );
  }
}
