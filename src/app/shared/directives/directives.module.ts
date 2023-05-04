import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Directives
import { IsEllipsedDirective } from './is-ellipsed.directive';

@NgModule({
  declarations: [IsEllipsedDirective],
  imports: [CommonModule],
  exports: [IsEllipsedDirective]
})
export class DirectivesModule {
  static forRoot(): ModuleWithProviders<DirectivesModule> {
    return {
        ngModule: DirectivesModule
    };
}
}
