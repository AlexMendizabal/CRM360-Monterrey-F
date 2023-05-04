import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// ngx-bootstrap
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

// ng-select
import { NgSelectModule } from '@ng-select/ng-select';

import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

import { LogisticaRelatoriosRoutingModule } from './relatorios-routing.module';
import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { ModuleWrapperModule } from 'src/app/core/module-wrapper/module-wrapper.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

import { LogisticaRelatoriosComponent } from './relatorios.component';
import { LogisticaRelatoriosRomaneiosComponent } from './romaneios/romaneios.component';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { LogisticaRelatoriosAmbComponent } from './amb/amb.component';

@NgModule({
  declarations: [
    LogisticaRelatoriosComponent,
    LogisticaRelatoriosRomaneiosComponent,
    LogisticaRelatoriosAmbComponent
  ],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    NotFoundModule,
    ModuleWrapperModule,
    SharedModule,
    TemplatesModule,
    PipesModule,
    NgSelectModule,
    PaginationModule,
    TooltipModule,
    TabsModule,
    ModalModule,
    TimepickerModule,
    BsDatepickerModule,
    FormsModule,
    LogisticaRelatoriosRoutingModule
  ],
  providers: [PNotifyService]
})
export class LogisticaRelatoriosModule { }
