import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CnpjService {
  private readonly API = `http://23.254.204.187/api/common/services/cnpj`;

  constructor(protected http: HttpClient) {}

  getData(cnpj: string) {
    cnpj = cnpj.replace(/\D/g, '');

    return this.http.get(`${this.API}/${cnpj}`).pipe(
      timeout(5000),
      catchError(e => {
        return of(null);
      })
    );
  }
}
