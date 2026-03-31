import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Modern Functional Route Guard for Angular 14+
 * Replace old class-based CanActivate with Functional Guards
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }
  
  // Ruteo seguro en caso de falta de sesión hacia /login
  return router.parseUrl('/login');
};
