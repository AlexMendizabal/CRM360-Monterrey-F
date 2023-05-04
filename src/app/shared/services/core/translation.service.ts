import { Injectable } from '@angular/core';

// ngx-translate
import { TranslateService } from '@ngx-translate/core';

// Services
import { TitleService } from './title.service';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  constructor(
    private translateService: TranslateService,
    private titleService: TitleService
  ) {}

  setDefaultLang(language: string): void {
    this.translateService.setDefaultLang(language);
  }

  browserTitle(value: string): void {
    this.translateService.get(value).subscribe((browserTitle: string) => {
      this.titleService.setTitle(browserTitle);
    });
  }
}
