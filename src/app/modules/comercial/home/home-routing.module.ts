import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { ComercialHomeComponent } from './home.component';

const routes: Routes = [{ path: '', component: ComercialHomeComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComercialHomeRoutingModule {}
