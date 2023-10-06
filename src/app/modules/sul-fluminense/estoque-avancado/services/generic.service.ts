import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SulFluminenseEstoqueAvancadoGenericService {
  private readonly BASE_URL: string = `http://23.254.204.187/api/api`;

  constructor(private http: HttpClient) { }

  getLinhas() {
    return this.http.get(`${this.BASE_URL}/common/v2/linhas`,{
      observe: 'response'
    },
    );
  }

  getClasses(params) {
    return this.http.get(`${this.BASE_URL}/common/v2/classes`, {
      params,
      observe: 'response'
    });
  }

  getMateriais(params = {}) {
    return this.http.get(`${this.BASE_URL}/common/v2/materiais`, {
      params,
      observe: 'response'
    });
  }
}
