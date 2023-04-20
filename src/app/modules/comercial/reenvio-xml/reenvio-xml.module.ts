import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// ngx-bootstrap
import { TooltipModule } from 'ngx-bootstrap/tooltip';

// ng-select
import { NgSelectModule } from '@ng-select/ng-select';

// Counto
import { CountoModule } from 'angular2-counto';

// PNotify
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

// Modules
import { ComercialReenvioXmlRoutingModule } from './reenvio-xml-routing.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

// Components
import { ComercialReenvioXmlListaComponent } from './lista/lista.component';

@NgModule({
  declarations: [ComercialReenvioXmlListaComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule.forRoot(),
    NgSelectModule,
    CountoModule,
    ComercialReenvioXmlRoutingModule,
    SharedModule,
    TemplatesModule
  ],
  providers: [PNotifyService]
})
export class ComercialReenvioXmlModule {}
