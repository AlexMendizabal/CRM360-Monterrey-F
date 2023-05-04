import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Modules
import { PipesModule } from '../pipes/pipes.module';

// Translater
import { TranslateModule } from '@ngx-translate/core';

// Components
import { BackButtonComponent } from './back-button/back-button.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { ConfirmModalComponent } from './confirm-modal/confirm-modal.component';
import { EmptyResultComponent } from './empty-result/empty-result.component';
import { IframeComponent } from './iframe/iframe.component';
import { InvalidFormControlComponent } from './invalid-form-control/invalid-form-control.component';
import { LoaderSpinnerFullScreenComponent } from './loader/spinner-full-screen/spinner-full-screen.component';
import { LoaderSpinnerNavbarComponent } from './loader/spinner-navbar/spinner-navbar.component';
import { PermissionDeniedComponent } from './permission-denied/permission-denied.component';
import { SubtitlesComponent } from './subtitles/subtitles.component';
import { TheadSorterComponent } from './thead-sorter/thead-sorter.component';
import { XlsxComponent } from './xlsx/xlsx.component';

@NgModule({
  declarations: [
    BackButtonComponent,
    BreadcrumbComponent,
    ConfirmModalComponent,
    EmptyResultComponent,
    IframeComponent,
    InvalidFormControlComponent,
    LoaderSpinnerFullScreenComponent,
    LoaderSpinnerNavbarComponent,
    PermissionDeniedComponent,
    SubtitlesComponent,
    TheadSorterComponent,
    XlsxComponent
  ],
  imports: [CommonModule, RouterModule, PipesModule],
  exports: [
    BackButtonComponent,
    BreadcrumbComponent,
    ConfirmModalComponent,
    EmptyResultComponent,
    IframeComponent,
    InvalidFormControlComponent,
    LoaderSpinnerFullScreenComponent,
    LoaderSpinnerNavbarComponent,
    PermissionDeniedComponent,
    SubtitlesComponent,
    TheadSorterComponent,
    XlsxComponent,
    TranslateModule
  ],
  entryComponents: [ConfirmModalComponent]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
        ngModule: SharedModule,
        providers: [ConfirmModalComponent]
    };
}
}
