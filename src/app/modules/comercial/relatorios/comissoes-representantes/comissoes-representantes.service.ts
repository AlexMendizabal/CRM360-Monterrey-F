import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { take, retry } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

// Services
import { ComercialService } from 'src/app/modules/comercial/comercial.service';

// Interfaces
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialRelatoriosComissoesRepresentantesService {
  private readonly API = `http://23.254.204.187/api/comercial/relatorios/comissoes-representantes`;


  constructor(
    protected http: HttpClient,
    private comercialService: ComercialService,
  ) {}

  getDadosRepresentante(params: any = []): Observable<any> {
    let httpParams = new HttpParams();
    for (let param in params) {
    httpParams = httpParams.append(param, params[param]);    }
    return this.http.get(`${this.API}/dados-representante`, { params: httpParams })
    .pipe(
      take(1),
      retry(2)
      );
  }
}
