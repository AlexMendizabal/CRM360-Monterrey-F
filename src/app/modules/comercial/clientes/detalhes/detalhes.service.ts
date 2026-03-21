import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ComercialClientesDetalheService {
  private readonly API = `${environment.URL_MTCORP}comercial/clientes`;

  constructor(protected http: HttpClient) {}

  getDetalhes(id: any) {
    return this.http.get(`${this.API}/detalhes/${id}`).pipe(take(1));
  }
}
