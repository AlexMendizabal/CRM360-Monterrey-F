import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { take, retry } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

// Services
import { PNotifyService } from './pnotify.service';
import { RouterService } from './router.service';
import { ModulosService } from '../requests/modulos.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API = `http://23.254.204.187/api/usuario`;

  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  showMenuEmitter: EventEmitter<boolean> = new EventEmitter();
  hasSession: boolean = true;

  constructor(
    private http: HttpClient,
    private router: Router,
    private pnotifyService: PNotifyService,
    private routerService: RouterService,
    private modulosService: ModulosService
  ) {
    this.currentUserSubject = new BehaviorSubject<any>(
      JSON.parse(localStorage.getItem('currentUser'))
    );
    this.currentUser = this.currentUserSubject.asObservable();
    this.pnotifyService.getPNotify();
  }

  login(data: any): Observable<any> {
    this.hasSession = true;
    return this.http.post(`${this.API}/login`, data).pipe(take(1), retry(2));
  }

  loginSAP(data: any): Observable<any> {
    this.hasSession = true;
  return this.http.post(`http://192.168.0.123:4100/api/Login`, data).pipe(take(1), retry(2));
  }
  


  logout(): boolean {
    this.resetCurrentUser();
    this.showMenuEmitter.emit(false);
    this.router.navigate(['/login']);
    return false;
  }

  changePassword(data: any): Observable<any> {
    return this.http.post(`http://23.254.204.187/api/core/contra-senha`, data, { observe: 'response' }).pipe(take(1));
  }

  sessionExpired(): void {

    setTimeout(() => {

      if (!this.hasSession) {
        return
      }

      const router = this.router.url;
      const queryParams = router != '/login' ? { urlAfterLogin: router } : undefined;

      this.hasSession = false;
      this.resetCurrentUser();
      this.pnotifyService.notice('Su sesión expiro intente nuevamente.');
      this.router.navigate(['/login'], {
        queryParams: queryParams
      })
      //.then(() => {window.location.reload()});

    }, 500);
  }

  setCurrentUser(user: any): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  resetCurrentUser(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.modulosService.resetCurrentModule();
    this.hideMenu();
  }

  hideMenu(): void {
    this.showMenuEmitter.emit(false);
  }

  isAuthenticated(): boolean {
    if (this.getCurrentUser() != null) {
      this.showMenuEmitter.emit(true);
      return true;
    }

    this.showMenuEmitter.emit(false);
    return false;
  }

  checkTokenValidity(): Observable<any> {
    return this.http.get(`${this.API}/check-token`).pipe(take(1));
  }
}
