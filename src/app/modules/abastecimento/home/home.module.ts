import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

import { AbastecimentoHomeRoutingModule } from './home-routing.module';
import { AbastecimentoHomeComponent } from './home.component';

@NgModule({
  declarations: [
    AbastecimentoHomeComponent
  ],
  imports: [
    CommonModule,
    AbastecimentoHomeRoutingModule,
    SharedModule,
    TemplatesModule
  ]
})
export class AbastecimentoHomeModule { }
