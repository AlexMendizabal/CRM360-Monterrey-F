import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LogisticaSofranIdealPlanoContaService {

  private readonly API = `http://23.254.204.187/api/api`;

  constructor(private http: HttpClient) { }

  getPlanoConta(params?) {
    return this.http.get(`${this.API}/softran-ideal/plano-conta`, {
      params: params,
      observe: "response"
    });
  }

}
