import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgSelectModule } from '@ng-select/ng-select';
import { NgBrazil } from 'ng-brazil';
import { PaginationModule } from 'ngx-bootstrap/pagination';

import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { ModuleWrapperModule } from 'src/app/core/module-wrapper/module-wrapper.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';
import { TextMaskModule } from 'angular2-text-mask';

import { ComercialIntegracoesDagdaRoutingModule } from './dagda-routing.module';
import { ComercialIntegracoesDagdaComponent } from './dagda.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@NgModule({
  declarations: [ComercialIntegracoesDagdaComponent],
  imports: [
    ComercialIntegracoesDagdaRoutingModule,
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ModuleWrapperModule,
    NgSelectModule,
    PaginationModule.forRoot(),
    TooltipModule.forRoot(),
    TabsModule.forRoot(),
    TimepickerModule.forRoot(),
    BsDatepickerModule.forRoot(),
    PipesModule,
    NotFoundModule,
    SharedModule,
    TemplatesModule,
    NgBrazil,
    TextMaskModule,
  ],
})
export class ComercialIntegracoesDagdaModule {}
