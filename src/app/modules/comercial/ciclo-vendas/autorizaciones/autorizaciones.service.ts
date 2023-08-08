import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { take, retry } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import { JsonResponse } from 'src/app/models/json-response';
@Injectable({
  providedIn: 'root',
})
export class ComercialCicloVendasAutorizacionesService {
  private readonly API = `http://127.0.0.1:8000/comercial/ciclo-vendas/autorizaciones`;

  constructor(protected http: HttpClient) {}


}
