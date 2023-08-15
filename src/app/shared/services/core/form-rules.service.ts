import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FormRulesService {
  private readonly API = `http://127.0.0.1:8000/common/services`;

  constructor(protected http: HttpClient) {}

  getRules(formRef: number): Observable<any> {
    return this.http.get(`${this.API}/form-rules/${formRef}`).pipe(take(1));
  }
}
