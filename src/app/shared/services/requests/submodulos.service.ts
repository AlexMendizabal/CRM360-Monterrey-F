import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SubModulosService {
  private readonly API = `http://23.254.204.187/api/core/submodulo`;

  constructor(protected http: HttpClient) {}

  getSubModulo(idSubModulo: number) {
    return this.http
      .get(`${this.API}/${idSubModulo}`, { observe: 'response' })
      .pipe(take(1));
  }
}
