import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable()
export class UrlRewriteInterceptor implements HttpInterceptor {
  private readonly PROD_BASE = environment.URL_MTCORP;

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!environment.production) {
      const trimmedUrl = request.url.trim();
      if (trimmedUrl.startsWith(this.PROD_BASE)) {
        const newUrl = trimmedUrl.replace(this.PROD_BASE, '/api/');
        const cloned = request.clone({ url: newUrl });
        return next.handle(cloned);
      }
    }
    return next.handle(request);
  }
}
