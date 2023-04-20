import { SulFluminenseHomeComponent } from './home.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

import { SulFluminenseHomeRoutingModule } from './home-routing.module';

@NgModule({
  declarations: [
    SulFluminenseHomeComponent
  ],
  imports: [
    CommonModule,
    SulFluminenseHomeRoutingModule,
    SharedModule,
    TemplatesModule
  ]
})
export class SulFluminenseHomeModule { }
