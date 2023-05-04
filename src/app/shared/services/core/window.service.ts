import { Injectable, Inject } from '@angular/core';

// Providers
import { WINDOW } from 'src/app/shared/providers/window.provider';

@Injectable()
export class WindowService {
  constructor(@Inject(WINDOW) private window: Window) {}

  getHost(): string {
    return this.window.location.origin;
  }

  getHostname(): string {
    return this.window.location.hostname;
  }

  getHostnameLogo(): string {
    return this.getHostname().replace(/\./g, '_');
  }

  async getBase64ImageFromUrl(imageUrl: string): Promise<any> {
    var res = await fetch(imageUrl);
    var blob = await res.blob();

    return new Promise((resolve, reject) => {
      var reader = new FileReader();
      reader.addEventListener(
        'load',
        function() {
          resolve(reader.result);
        },
        false
      );

      reader.onerror = () => {
        return reject(this);
      };
      reader.readAsDataURL(blob);
    });
  }
}
