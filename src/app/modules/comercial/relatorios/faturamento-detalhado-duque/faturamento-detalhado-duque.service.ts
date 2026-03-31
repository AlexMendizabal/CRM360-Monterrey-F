import { Injectable } from '@angular/core';
import { take } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ComercialRelatoriosFaturamentoDetalhadoDuqueService {
  private readonly API = `https://crm360.monterrey.com.bo/api/comercial/relatorios/faturamento-detalhado-duque`;

  constructor(protected http: HttpClient) {}

  getFaturamentoDuque(data: any) {
    return this.http.get(`${this.API}/lista/${data}`).pipe(take(1));
  }

  getFaturamentoDuqueDetalhes(params: any) {
    return this.http
      .get(`${this.API}/detalhes/${params.data}/${params.ordem}`)
      .pipe(take(1));
  }
}
