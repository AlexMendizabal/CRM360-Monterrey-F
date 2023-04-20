import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class IconesFontAwesomeService {
  private readonly API = environment.API;

  constructor(private http: HttpClient) {}

  getIcones(
    icone = {
      qtItensPorPagina: '1000000'
    }
  ) {
    return this.http.get(`${this.API}/servicos/icons`, {
      params: icone,
      observe: 'response'
    });
  }
}
