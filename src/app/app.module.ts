import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  HttpClient,
  HttpClientModule,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { UrlSerializer } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

registerLocaleData(localePt, 'pt-BR');

// ngx-translate
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// ngx-bootstrap
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

// PNotify
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

// Interceptors
import { JwtInterceptor } from './interceptors/jwt.interceptor';

// Providers
import { WINDOW_PROVIDERS } from './shared/providers/window.provider';
import { CustomUrlSerializer } from './shared/providers/custom-url-serializer';

// Modules
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared/modules/shared.module';
import { PipesModule } from './shared/pipes/pipes.module';

// Components
import { AppComponent } from './app.component';
import { LoginComponent } from './modules/login/login.component';
import { HeaderComponent } from './core/header/header.component';
import { ChangePasswordModalComponent } from './core/change-password-modal/change-password-modal.component';

@NgModule({
  declarations: [AppComponent, LoginComponent, HeaderComponent, ChangePasswordModalComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    TooltipModule.forRoot(),
    ModalModule.forRoot(),
    BsDropdownModule.forRoot(),
    AppRoutingModule,
    SharedModule,
    PipesModule,
  ],
  exports: [ChangePasswordModalComponent],
  providers: [
    PNotifyService,
    WINDOW_PROVIDERS,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    { provide: UrlSerializer, useClass: CustomUrlSerializer },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
