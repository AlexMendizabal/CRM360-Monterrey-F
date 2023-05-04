import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// ngx-bootstrap
import { ModalModule } from 'ngx-bootstrap/modal';

// Counto
import { CountoModule } from 'angular2-counto';

// Modules
import { FinanceiroRelatoriosInadimplentesRoutingModule } from './inadimplentes-routing.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

// Components
import { FinanceiroRelatoriosInadimplentesComponent } from './inadimplentes.component';

@NgModule({
  declarations: [FinanceiroRelatoriosInadimplentesComponent],
  imports: [
    CommonModule,
    ModalModule.forRoot(),
    CountoModule,
    FinanceiroRelatoriosInadimplentesRoutingModule,
    SharedModule,
    TemplatesModule,
  ],
})
export class FinanceiroRelatoriosInadimplentesModule {}
