import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RouterService {
  private previousUrl: string = undefined;
  private currentUrl: string = undefined;

  constructor(private router: Router) {
    this.currentUrl = this.router.url;
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.previousUrl = this.currentUrl;
        this.currentUrl = event.url;
      }
    });
  }

  public getPreviousUrl() {
    return this.previousUrl;
  }

  public getCurrentUrl() {
    return this.currentUrl;
  }

  public getFullUrl(): string {
    return this.router.url;
  }

  public setBase64UrlParams(params: Object) {
    return { q: btoa(JSON.stringify(params)) };
  }

  public getBase64UrlParams(params: Object) {
    if (params['q']) {
      return JSON.parse(atob(params['q']));
    } else {
      return params;
    }
  }
}
