import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// ngx-bootstrap
import { ModalModule } from 'ngx-bootstrap/modal';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

// ng-select
import { NgSelectModule } from '@ng-select/ng-select';

// PNotify
import { PNotifyService } from './../../../shared/services/core/pnotify.service';

// Modules
import { ComercialKanbanComercialRoutingModule } from './kanban-comercial-routing.module';
import { TemplatesModule } from './../../../shared/templates/templates.module';
import { SharedModule } from './../../../shared/modules/shared.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

// Components
import { ComercialKanbanComercialComponent } from './kanban-comercial.component';

@NgModule({
  declarations: [ComercialKanbanComercialComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PaginationModule.forRoot(),
    TabsModule.forRoot(),
    TooltipModule.forRoot(),
    NgSelectModule,
    ComercialKanbanComercialRoutingModule,
    SharedModule,
    TemplatesModule,
    BsDatepickerModule.forRoot(),
  ],
  providers: [PNotifyService]
})
export class ComercialKanbanComercialModule {}
