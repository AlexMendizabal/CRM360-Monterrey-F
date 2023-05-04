import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  CanActivate
} from '@angular/router';
import { Observable } from 'rxjs';

// Services
import { ModulosService } from 'src/app/shared/services/requests/modulos.service';

@Injectable({
  providedIn: 'root'
})
export class ComercialGuard implements CanActivate {
  constructor(private modulosService: ModulosService) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.modulosService.checkAccess(state.url.split('/')[1]);
  }
}
