import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import * as $ from 'jquery';

if (environment.production) {
  enableProdMode();
}

if ('serviceWorker' in navigator && environment.production) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/ngsw-worker.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}


platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
