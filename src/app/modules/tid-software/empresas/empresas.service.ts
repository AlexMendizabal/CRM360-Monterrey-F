import { observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TidSoftwareEmpresasService {
  private readonly API = environment.API;
  constructor(private http: HttpClient) {}

  getUrlRDP(params) {
    return this.http.post(`${this.API}/tid-software/gerar-acesso`, params, {
      observe: 'response'
    });
  }
}
