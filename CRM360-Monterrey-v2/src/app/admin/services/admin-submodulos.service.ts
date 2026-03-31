import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdminSubmodulosService {
  private http = inject(HttpClient);
  private readonly API = '/api';

  getSubModulos(params: any = {}) {
    return this.http.get<any>(`${this.API}/core/submodulos`, {
      params,
      observe: 'response'
    });
  }

  postSubModulo(submodulo: any) {
    return this.http.post<any>(`${this.API}/core/submodulos`, submodulo, {
      observe: 'response'
    });
  }
}
