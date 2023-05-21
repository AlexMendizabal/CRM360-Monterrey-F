import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Services
import { AuthService } from '../shared/services/core/auth.service';
import { PNotifyService } from '../shared/services/core/pnotify.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private pnotifyService: PNotifyService
  ) {
    this.pnotifyService.getPNotify();
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    const user = this.authService.getCurrentUser();

    if(user !== null) {
      // ERROR MODULO COMERCIAL - LISTA CLIENTES
      // La idVendedor del administrador es 88
      // Y no permite acceder a Registros ("Cadastros") del cliente
      // user.info.idVendedor = 1;
    }
    if (user && user.token != null) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${user.token}`,
          'X-User-Info': btoa(JSON.stringify(user.info))
        }
      });
    }

    if (!request.headers.has('Content-Type')) {
      request = request.clone({
        headers: request.headers.set('Content-Type', 'application/json')
      });
    }

    request = request.clone({
      headers: request.headers.set('Accept', 'application/json')
    });

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.authService.sessionExpired();
        }
        return throwError(error);
      })
    );
  }
}
