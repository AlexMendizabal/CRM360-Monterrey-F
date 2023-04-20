import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Counto
import { CountoModule } from 'angular2-counto';

// Modules
import { SharedModule } from '../modules/shared.module';

// Components
import { AppHeaderComponent } from './core/app-header/app-header.component';
import { AppBodyComponent } from './core/app-body/app-body.component';
import { CardButtonComponent } from './card-button/card-button.component';
import { AdvancedFilterComponent } from './advanced-filter/advanced-filter.component';
import { DetailPanelComponent } from './detail-panel/detail-panel.component';
import { CustomTableComponent } from './custom-table/custom-table.component';
import { CardCounterComponent } from './card-counter/card-counter.component';
import { BtnIconComponent } from './btn-icon/btn-icon.component';
import { MessageComponent } from './message/message.component';
import { CardGroupComponent } from './card-group/card-group.component';
import { BtnArrowComponent } from './btn-arrow/btn-arrow.component';

@NgModule({
  declarations: [
    AppHeaderComponent,
    AppBodyComponent,
    CardButtonComponent,
    AdvancedFilterComponent,
    DetailPanelComponent,
    CustomTableComponent,
    CardCounterComponent,
    BtnIconComponent,
    MessageComponent,
    CardGroupComponent,
    BtnArrowComponent,
  ],
  imports: [CommonModule, RouterModule, CountoModule, SharedModule],
  exports: [
    AppHeaderComponent,
    AppBodyComponent,
    CardButtonComponent,
    AdvancedFilterComponent,
    DetailPanelComponent,
    CustomTableComponent,
    CardCounterComponent,
    BtnIconComponent,
    MessageComponent,
    CardGroupComponent,
    BtnArrowComponent
  ],
})
export class TemplatesModule {
  static forRoot(): ModuleWithProviders<TemplatesModule> {
    return {
        ngModule: TemplatesModule,
    };
}
}
