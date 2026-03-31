import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';

export interface UserSession {
  token: string;
  username: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  // URL local de la API configurada por Docker proxy.config.json
  private readonly API_URL = '/api'; 

  currentUser = signal<UserSession | null>(null);

  constructor() {
    this.checkLocalToken();
  }

  login(usuario: string, senha: string): Observable<{success: boolean, token?: string}> {
    const loginPayload = {
      nr_matr_usua: usuario,
      ds_senh_usua: senha
    };

    return this.http.post<any>(`${this.API_URL}/usuario/login`, loginPayload).pipe(
      tap(response => {
        if (response.responseCode === 200 && response.token) {
          const userSession: UserSession = {
            username: usuario,
            token: response.token,
            role: 'USER'
          };
          this.currentUser.set(userSession);
          localStorage.setItem('AUTH_TOKEN', response.token);
          localStorage.setItem('currentUser', JSON.stringify(response.result));
        }
      }),
      map(res => ({ success: res.responseCode === 200, token: res.token }))
    );
  }

  logout() {
    this.currentUser.set(null);
    localStorage.removeItem('AUTH_TOKEN');
    localStorage.removeItem('currentUser');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('AUTH_TOKEN');
  }

  private checkLocalToken() {
    const token = localStorage.getItem('AUTH_TOKEN');
    if (token) {
      this.currentUser.set({ username: 'Usuario Existente', token, role: 'USER' });
    }
  }
}
