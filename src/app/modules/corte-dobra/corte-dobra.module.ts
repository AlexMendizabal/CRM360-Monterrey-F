import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// ngx-bootstrap
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PaginationModule } from 'ngx-bootstrap/pagination';

// ng-select
import { NgSelectModule } from '@ng-select/ng-select';

// Counto
import { CountoModule } from 'angular2-counto';

import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { CorteDobraRoutingModule } from './corte-dobra-routing.module';
import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { ModuleWrapperModule } from 'src/app/core/module-wrapper/module-wrapper.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';

import { CorteDobraComponent } from './corte-dobra.component';
import { CorteDobraHomeComponent } from './home/home.component';
import { CorteDobraDashboardModule } from './dashboard/dashboard.module';

@NgModule({
  declarations: [CorteDobraComponent, CorteDobraHomeComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CorteDobraDashboardModule,
    CorteDobraRoutingModule,
    TooltipModule.forRoot(),
    BsDropdownModule.forRoot(),
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    PaginationModule.forRoot(),
    CountoModule,
    NgSelectModule,
    NotFoundModule,
    ModuleWrapperModule,
    SharedModule
  ],
  providers: [PNotifyService]
})
export class CorteDobraModule {}
