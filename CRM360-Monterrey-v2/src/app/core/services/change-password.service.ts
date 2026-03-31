import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChangePasswordService {
  private http = inject(HttpClient);
  private readonly API = '/api';

  changePassword(data: { senha: string; novaSenha: string; confirmarNovaSenha: string }): Observable<any> {
    return this.http.post(`${this.API}/usuario/change-password`, data, { observe: 'response' });
  }
}
