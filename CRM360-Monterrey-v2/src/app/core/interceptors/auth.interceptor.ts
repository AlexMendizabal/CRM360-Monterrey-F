import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  // Excluimos las peticiones de login para evitar loops cíclicos
  if (req.url.includes('/api/usuario/login')) {
    return next(req);
  }

  const currentUser = localStorage.getItem('currentUser');
  let clonedRequest = req.clone({
    setHeaders: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  const authToken = localStorage.getItem('AUTH_TOKEN');
  if (currentUser && authToken) {
    const user = JSON.parse(currentUser);
    const userInfo = user.info ? user.info : user; // Fallback safe
    
    clonedRequest = clonedRequest.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`,
        'X-User-Info': btoa(JSON.stringify(userInfo))
      }
    });
  }

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Sesión Expirada
        localStorage.removeItem('currentUser');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
