import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WINDOW_PROVIDERS } from 'src/app/shared/providers/window.provider';

// Perfect Scrollbar
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';

// ngx-bootstrap
import { TooltipModule } from 'ngx-bootstrap/tooltip';

// Modules
import { PipesModule } from 'src/app/shared/pipes/pipes.module';

// Components
import { ModuleWrapperComponent } from './module-wrapper.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { BodyComponent } from '../body/body.component';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

@NgModule({
  declarations: [ModuleWrapperComponent, SidebarComponent, BodyComponent],
  imports: [
    CommonModule,
    RouterModule,
    PerfectScrollbarModule,
    TooltipModule.forRoot(),
    PipesModule
  ],
  exports: [ModuleWrapperComponent, SidebarComponent, BodyComponent],
  providers: [
    WINDOW_PROVIDERS,
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ]
})
export class ModuleWrapperModule {}
