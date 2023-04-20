import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Modules
import { SharedModule } from 'src/app/shared/modules/shared.module';

// Components
import { NotFoundComponent } from './not-found.component';

@NgModule({
  declarations: [NotFoundComponent],
  imports: [CommonModule, SharedModule],
  exports: [NotFoundComponent]
})
export class NotFoundModule {}
