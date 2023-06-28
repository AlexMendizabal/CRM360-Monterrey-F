import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CepService {
  private readonly API = `http://127.0.0.1:8000/common/services/cep`;

  constructor(protected http: HttpClient) {}

  getData(cep: string) {
    cep = cep.replace(/\D/g, '');

    if (cep !== '') {
      let validaCep = /^[0-9]{8}$/;

      if (validaCep.test(cep)) {
        return this.http.get(`${this.API}/${cep}`);
      }
    }

    return of({});
  }
}
