import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ComercialReenvioXmlService {
  private readonly API = `http://23.254.204.187/api/comercial/reenvio-xml`;

  constructor(protected http: HttpClient) {}

  getContadores() {
    return this.http.get(`${this.API}/contadores`).pipe(take(1));
  }

  getLista(params: any) {
    return this.http
      .get(`${this.API}/lista/${params['codEmpresa']}/${params['numNota']}`)
      .pipe(take(1));
  }

  putReagendarEnvio(record: any) {
    return this.http.put(`${this.API}/reagendar-envio`, record).pipe(take(1));
  }
}
