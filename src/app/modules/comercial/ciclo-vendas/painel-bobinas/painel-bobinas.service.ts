import { IComercialPainelBobinas } from './models/painel-bobinas';
//angular
import { Injectable } from '@angular/core';

// services
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { retry, take } from 'rxjs/operators';
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialPainelBobinasService {
  private readonly API = `http://23.254.204.187/api/comercial/ciclo-vendas/painel-bobinas`;

  constructor(private http: HttpClient) {}

  getListaBobinas(params: any): Observable<any> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/lista`, { params: httpParams })
      .pipe(take(1));
  }


  postPainelBobinas(material: any): Observable<any>{
    return this.http.post(`${this.API}/salvar`, material).pipe(take(1));
  }

}
