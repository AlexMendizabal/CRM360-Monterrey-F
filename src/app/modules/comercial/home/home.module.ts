import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// ng-select
import { NgSelectModule } from '@ng-select/ng-select';

// PNotify
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

// Modules
import { ComercialHomeRoutingModule } from './home-routing.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';
import { ComercialTemplatesModule } from '../templates/templates.module';

// Components
import { ComercialHomeComponent } from './home.component';

@NgModule({
  declarations: [ComercialHomeComponent],
  imports: [
    CommonModule,
    NgSelectModule,
    ComercialHomeRoutingModule,
    SharedModule,
    TemplatesModule,
    ComercialTemplatesModule
  ],
  providers: [PNotifyService]
})
export class ComercialHomeModule {}
