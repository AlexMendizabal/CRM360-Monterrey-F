import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EscritoriosService {
  private readonly API = `http://23.254.204.187/api/common/escritorios`;

  constructor(protected http: HttpClient) {}

  getEscritorios() {
    return this.http.get(`${this.API}`).pipe(take(1));
  }
}
