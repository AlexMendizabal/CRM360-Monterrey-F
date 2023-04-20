import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LogisticaCertificadoQualidadeService {

  private readonly API = `https://crm360.monterrey.com.bo/api`;

  constructor(private http: HttpClient) { }

  getCertificados(params?) {
    return this.http.get(`${this.API}/logistica/certificado-qualidade/v2`, {
      params: params,
      observe: "response"
    });
  }

}
