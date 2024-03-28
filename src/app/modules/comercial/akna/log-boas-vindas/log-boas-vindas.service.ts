import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ControladoriaAknaLogBoasVindasService {
  private readonly BASE_URL: string = `https://23.254.204.187/api`;

  constructor(private http: HttpClient) {}

  getLogBoasVindas() {
    return this.http.get(
      `${this.BASE_URL}/comercial/integracoes/akna/consulta-log-email-boas-vindas`,
      {
        observe: 'response',
      }
    );
  }

  postAkna(param){
    return this.http.post(
      `${this.BASE_URL}/comercial/integracoes/akna/log-email-boas-vindas`,
      param,
      { observe: 'response' }
    );
  }
}
