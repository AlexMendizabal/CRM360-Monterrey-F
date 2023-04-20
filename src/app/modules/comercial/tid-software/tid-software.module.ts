import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// ngx-bootstrap
import { ModalModule } from 'ngx-bootstrap/modal';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TabsModule } from 'ngx-bootstrap/tabs';

// ng-select
import { NgSelectModule } from '@ng-select/ng-select';

// PNotify
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

// Modules
import { ComercialTidSoftwareRoutingModule } from './tid-software-routing.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

// Components
import { ComercialTidSoftwareComponent } from './tid-software.component';

@NgModule({
  declarations: [ComercialTidSoftwareComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ModalModule.forRoot(),
    PaginationModule.forRoot(),
    TabsModule.forRoot(),
    NgSelectModule,
    ComercialTidSoftwareRoutingModule,
    SharedModule,
    TemplatesModule
  ],
  providers: [PNotifyService]
})
export class ComercialTidSoftwareModule {}
