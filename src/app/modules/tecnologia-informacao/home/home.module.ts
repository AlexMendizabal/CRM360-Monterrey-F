import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// ng-select
import { NgSelectModule } from '@ng-select/ng-select';

// PNotify
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

// Modules
import { TecnologiaInformacaoHomeRoutingModule } from './home-routing.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

// Components
import { TecnologiaInformacaoHomeComponent } from './home.component';

@NgModule({
  declarations: [TecnologiaInformacaoHomeComponent],
  imports: [
    CommonModule,
    NgSelectModule,
    TecnologiaInformacaoHomeRoutingModule,
    SharedModule,
    TemplatesModule
  ],
  providers: [PNotifyService]
})
export class TecnologiaInformacaoHomeModule {}
