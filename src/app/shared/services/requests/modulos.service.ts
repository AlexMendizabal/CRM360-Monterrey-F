import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { take, retry } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ModulosService {
  private readonly API = `http://127.0.0.1:8000/common`;

  private currentModuleSubject: BehaviorSubject<any>;
  public currentModule: Observable<any>;

  constructor(protected http: HttpClient) {
    if (
      typeof localStorage.getItem('currentModule') == 'undefined' ||
      localStorage.getItem('currentModule') == 'undefined'
    ) {
      localStorage.removeItem('currentModule');
    }

    this.currentModuleSubject = new BehaviorSubject<any>(
      JSON.parse(localStorage.getItem('currentModule'))
    );
    this.currentModule = this.currentModuleSubject.asObservable();
  }

  getModulo(rotaModulo: string) {
    return this.http
      .get(`${this.API}/modulo/${rotaModulo}`)
      .pipe(take(1), retry(2));
  }

  _getModulo(rota: string){
    return this.http
      .get(`http://127.0.0.1:8000/core/modulos`, {
        "params": { "rota": rota },
        "observe":"response"
      }).pipe(take(1), retry(2));
  }

  getModulos() {
    return this.http.get(`${this.API}/modulos`).pipe(take(1), retry(2));
  }

  async checkAccess(rotaModulo: string): Promise<boolean> {
    return await this._getModulo(rotaModulo)
      .toPromise()
      .then((response: any) => {
        if(response.status === 200){
          return true;
        }
        return false;
      })
      .catch((error) => {
        return false;
      });
  }

  setCurrentModule(module: any) {
    if (module && module != null && module != '') {
      localStorage.setItem('currentModule', JSON.stringify(module));
      this.currentModuleSubject.next(module);
    }
  }

  getCurrentModule() {
    return this.currentModuleSubject.value;
  }

  resetCurrentModule() {
    localStorage.removeItem('currentModule');
    this.currentModuleSubject.next(null);
  }
}
